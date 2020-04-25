import logging
from collections import namedtuple

import discord

from const import WHITE_CHECKMARK
from log import init_logger
from util import get_embed_with_title, create_lecture_embed, add_role_to_member, remove_role_from_member, \
    create_overview_info_embed, needs_update


class BotClient(discord.Client):

    def __init__(self, config=None, **options):
        init_logger()
        super().__init__(**options)
        self.config = config
        self.lecture_message_tuples = []
        self.guild = None
        self.logger = logging.getLogger('bot')

    async def on_ready(self):
        """Executed when bot is logged in and ready."""
        self.logger.info('Logged in as %s with id %s' % (self.user.name, self.user.id))

    async def on_member_join(self, member):
        """Greets new member."""
        guild = member.guild
        self.logger.info('User %s has joined guild %s' % (member.user.name, member.guild))
        if guild.system_channel is not None:
            greeting = discord.Embed(
                title="{}, willkommen auf {}!".format(str(member), str(guild))
            )
            await guild.system_channel.send(greeting)
            self.logger.info('Greeting sent!')
        else:
            self.logger.warning('System channel not found!')

    async def on_raw_reaction_add(self, raw_reaction):
        """Handles users adding reactions to messages.
        If an user reacted appropriately to an lecture embed, the user is assigned the role associated with the lecture.
        """
        if raw_reaction.user_id == self.user.id:
            # bot should not react to reactions from itself
            return
        member = raw_reaction.member
        emoji = raw_reaction.emoji.name
        message_id = raw_reaction.message_id
        # TODO populate logging info with actual message?
        self.logger.info('User %s has reacted with %s to message with id %s' % (member, emoji, message_id))
        # check if the reaction belongs to an lecture embed
        lecture = self._get_lecture_of_message_id(message_id)
        if lecture is not None:
            self.logger.info('Message is embed of lecture %s' % lecture['embed_title'])
            # check if reaction was the one we expect to assign the role
            if emoji == WHITE_CHECKMARK:
                self.logger.info('Reaction is %s. Adding role...' % WHITE_CHECKMARK)
                lecture_role_id = lecture['role']
                await add_role_to_member(member, lecture_role_id)
                self.logger.info("Role added!")

    # TODO this code is very similar to the one in `on_raw_reaction_add`
    async def on_raw_reaction_remove(self, raw_reaction):
        """Handles users removing reactions from messages.
        If an user removed his previous reaction from a lecture embed, the associated role is removed."""
        if raw_reaction.user_id == self.user.id:
            # bot should not react to reactions from itself
            return
        guild = self.get_guild(raw_reaction.guild_id)
        member = guild.get_member(raw_reaction.user_id)
        emoji = raw_reaction.emoji.name
        message_id = raw_reaction.message_id
        # TODO populate logging info with actual message?
        self.logger.info('User %s has removed reaction %s from message with id %s' % (member, emoji, message_id))
        # check if the reaction belongs to an lecture embed
        lecture = self._get_lecture_of_message_id(message_id)
        if lecture is not None:
            self.logger.info('Message is embed of lecture %s' % lecture['embed_title'])
            # check if reaction was the one we expect to assign the role
            if emoji == '\u2705':  # \u2705 is :white_check_mark:
                self.logger.info('Reaction was %s. Removing role...' % WHITE_CHECKMARK)
                lecture_role_id = lecture['role']
                await remove_role_from_member(member, lecture_role_id)
                self.logger.info("Role removed!")

    def _get_lecture_of_message_id(self, message_id):
        """Returns the lecture associated with this message if there is one. Else returns None."""
        for tuples in self.lecture_message_tuples:
            if tuples.message_id == message_id:
                return tuples.lecture
        return None

    async def _init_lecture_embed(self, channel, lecture):
        """Returns the message for this lecture in the given channel.
        If it does not exist yet, it will be created."""
        message = await get_embed_with_title(channel, lecture['embed_title'])
        guild = await self._guild()
        embed = create_lecture_embed(guild, lecture)
        if message is None:
            message = await channel.send(embed=embed)
            await message.add_reaction(WHITE_CHECKMARK)
            self.logger.info('Created embed for lecture %s!' % lecture['embed_title'])
        # check if message needs update because of config change
        elif needs_update(message, embed):
            await message.edit(embed=embed)
            self.logger.info('Updated embed for lecture %s' % lecture['embed_title'])
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
        embed = await create_overview_info_embed()
        message = await get_embed_with_title(channel, embed.title)
        if message is None:
            await channel.send(embed=embed)
            self.logger.info('Created overview embed!')
        elif needs_update(message, embed):
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
            self.logger.info('Message with id %s holds the embed for lecture %s' % (message.id, lecture['embed_title']))
