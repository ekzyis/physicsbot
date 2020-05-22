import logging
from collections import namedtuple

import discord

from const import WHITE_CHECK_MARK
from event.on_member_join import on_member_join
from event.on_raw_reaction_add import on_raw_reaction_add
from event.on_raw_reaction_remove import on_raw_reaction_remove
from log import init_logger
from util.embed import create_overview_info_embed, create_lecture_embed, get_embed_with_title, \
    embed_in_message_needs_update
from util.lecture import populate_lectures_in_config


class BotClient(discord.Client):

    def __init__(self, config=None, **options):
        init_logger()
        super().__init__(**options)
        self.config = config
        self.config['lectures'] = populate_lectures_in_config(self.config['lectures'])
        self.lecture_message_tuples = []
        self.guild = None
        self.logger = logging.getLogger('bot')

    async def on_ready(self):
        """Executed when bot is logged in and ready."""
        self.logger.info('Logged in as %s with id %s' % (self.user.name, self.user.id))

    async def on_member_join(self, member):
        await on_member_join(self)(member)

    async def on_raw_reaction_add(self, raw_reaction):
        await on_raw_reaction_add(self)(raw_reaction)

    async def on_raw_reaction_remove(self, raw_reaction):
        await on_raw_reaction_remove(self)(raw_reaction)

    def get_lecture_of_message_id(self, message_id):
        """Returns the lecture associated with this message if there is one. Else returns None."""
        for tuples in self.lecture_message_tuples:
            if tuples.message_id == message_id:
                return tuples.lecture
        return None

    async def _init_lecture_embed(self, channel, lecture):
        """Returns the message for this lecture in the given channel.
        If it does not exist yet, it will be created."""
        message = await get_embed_with_title(channel, lecture.embed_title)
        guild = await self._guild()
        embed = create_lecture_embed(guild, lecture)
        if message is None:
            message = await channel.send(embed=embed)
            await message.add_reaction(WHITE_CHECK_MARK)
            self.logger.info('Created embed for lecture %s!' % lecture.embed_title)
        # check if message needs update because of config change
        elif embed_in_message_needs_update(message, embed):
            await message.edit(embed=embed)
            self.logger.info('Updated embed for lecture %s' % lecture.embed_title)
        return message

    async def _guild(self):
        """Returns the guild instance for which the config of this bot instance is written for.
        Also caches the result so we won't have to fetch again."""
        if self.guild is None:
            self.guild = self.get_guild(int(self.config['guild']))
        return self.guild

    async def _init_overview_embed(self, channel):
        """Creates the overview embed in the given channel.
        The overview embed lists all available lectures and has some user information in it."""
        embed = create_overview_info_embed()
        message = await get_embed_with_title(channel, embed.title)
        if message is None:
            await channel.send(embed=embed)
            self.logger.info('Created overview embed!')
        elif embed_in_message_needs_update(message, embed):
            await message.edit(embed=embed)
            self.logger.info('Updated overview embed')
        return message

    async def init_overview_channel(self):
        """Initializes the overview channel.
        Makes sure that an embed for every lecture exists such that users can react to it and
        the role can be assigned."""
        lecture_tuple = namedtuple('LectureMessage', 'lecture message_id')
        await self.wait_until_ready()
        overview_channel = await self.fetch_channel(self.config['overview'])
        await self._init_overview_embed(overview_channel)
        for lecture in self.config['lectures']:
            message = await self._init_lecture_embed(overview_channel, lecture)
            self.lecture_message_tuples.append(lecture_tuple(lecture=lecture, message_id=message.id))
            self.logger.info('Message with id %s holds the embed for lecture %s' % (message.id, lecture.embed_title))
