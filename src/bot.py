import logging
from typing import Dict, Any, List, Optional

import discord
import discord.ext
import yaml

from command.reactionmessage import ReactionMessage, reactionmessage_add, reactionmessage_remove, reactionmessage
from const import WHITE_CHECK_MARK
from event.on_member_join.greet_member import greet_member
from event.on_raw_reaction_add.lecture_role_assignment import lecture_role_assignment
from event.on_raw_reaction_add.reactionmessage_role_assignment import reactionmessage_role_assignment
from event.on_raw_reaction_remove.lecture_role_unassignment import lecture_role_unassignment
from event.on_raw_reaction_remove.reactionmessage_role_unassignment import reactionmessage_role_unassignment
from event.util import on_raw_reaction_remove_arg_parser, on_raw_reaction_add_arg_parser
from log import init_logger
from util.embed import create_overview_info_embed, create_lecture_embed, get_embed_with_title, \
    embed_in_message_needs_update
from util.lecture import populate_lectures_in_config, LectureMessage, Lecture


class BotClient(discord.ext.commands.Bot):

    def __init__(self, config: Dict[str, Any], **options: Any):
        init_logger()
        super().__init__(**options, command_prefix='!')
        self.config = config
        self.config['lectures'] = populate_lectures_in_config(self.config['lectures'])
        self.lecture_messages: List[LectureMessage] = []
        self.guild: Optional[discord.Guild] = None
        self.logger: logging.Logger = logging.getLogger('bot')
        self._reaction_messages = []
        self.add_command(reactionmessage)
        self.add_command(reactionmessage_add)
        self.add_command(reactionmessage_remove)

    async def on_ready(self) -> None:
        """Executed when bot is logged in and ready."""
        self.logger.info('Logged in as %s with id %s' % (self.user.name, self.user.id))

    async def on_member_join(self, member: discord.Member) -> None:
        await greet_member(self)(member)

    async def on_raw_reaction_add(self, raw_reaction: discord.RawReactionActionEvent) -> None:
        member, emoji, message_id = on_raw_reaction_add_arg_parser(raw_reaction)
        # TODO populate logging info with actual message?
        self.logger.info('User %s has reacted with %s to message with id %s' % (member, emoji, message_id))
        await lecture_role_assignment(self)(raw_reaction)
        await reactionmessage_role_assignment(self)(raw_reaction)

    async def on_raw_reaction_remove(self, raw_reaction: discord.RawReactionActionEvent) -> None:
        member, emoji, message_id = on_raw_reaction_remove_arg_parser(raw_reaction, self)
        # TODO populate logging info with actual message?
        self.logger.info('User %s has removed reaction %s from message with id %s' % (member, emoji, message_id))
        await lecture_role_unassignment(self)(raw_reaction)
        await reactionmessage_role_unassignment(self)(raw_reaction)

    def get_lecture_of_message_id(self, message_id: int) -> Optional[Lecture]:
        """Returns the lecture associated with this message if there is one. Else returns None."""
        for lecture_message in self.lecture_messages:
            if lecture_message.message_id == message_id:
                return lecture_message.lecture
        return None

    async def _init_lecture_embed(self, channel: discord.TextChannel, lecture: Lecture) -> discord.Message:
        """Returns the message for this lecture in the given channel.
        If it does not exist yet, it will be created."""
        message: discord.Message = await get_embed_with_title(channel, lecture.embed_title)
        guild: discord.Guild = await self._guild()
        embed: discord.Embed = create_lecture_embed(guild, lecture)
        if message is None:
            message = await channel.send(embed=embed)
            await message.add_reaction(WHITE_CHECK_MARK)
            self.logger.info('Created embed for lecture %s!' % lecture.embed_title)
        # check if message needs update because of config change
        elif embed_in_message_needs_update(message, embed):
            await message.edit(embed=embed)
            self.logger.info('Updated embed for lecture %s' % lecture.embed_title)
        return message

    async def _guild(self) -> discord.Guild:
        """Returns the guild instance for which the config of this bot instance is written for.
        Also caches the result so we won't have to fetch again."""
        if self.guild is None:
            self.guild = self.get_guild(int(self.config['guild']))
        return self.guild

    async def _init_overview_embed(self, channel: discord.TextChannel) -> discord.Message:
        """Creates the overview embed in the given channel.
        The overview embed lists all available lectures and has some user information in it."""
        embed: discord.Embed = create_overview_info_embed()
        message = await get_embed_with_title(channel, embed.title)
        if message is None:
            await channel.send(embed=embed)
            self.logger.info('Created overview embed!')
        elif embed_in_message_needs_update(message, embed):
            await message.edit(embed=embed)
            self.logger.info('Updated overview embed')
        return message

    async def init_overview_channel(self) -> None:
        """Initializes the overview channel.
        Makes sure that an embed for every lecture exists such that users can react to it and
        the role can be assigned."""
        await self.wait_until_ready()
        overview_channel: discord.TextChannel = await self.fetch_channel(self.config['overview'])
        await self._init_overview_embed(overview_channel)
        for lecture in self.config['lectures']:
            message: discord.Message = await self._init_lecture_embed(overview_channel, lecture)
            self.lecture_messages.append(LectureMessage(lecture=lecture, message_id=message.id))
            self.logger.info('Message with id %s holds the embed for lecture %s' % (message.id, lecture.embed_title))

    def add_reactionmessage(self, rm: ReactionMessage):
        """Add the ReactionMessage to the list of reaction messages which will be searched on user reactions."""
        self._reaction_messages.append(rm)
        self.logger.info(
            "Added reaction message with message id {}, role {}, emoji {}".format(rm.mid, rm.role, rm.emoji))
        self.save_reactionmessages()

    def remove_reactionmessage(self, rm: ReactionMessage):
        """Remove the ReactionMessage from the list of reaction messages which will be searched on user reactions."""
        self._reaction_messages.remove(rm)
        self.logger.info(
            "Removed reaction message with message id {}, role {}, emoji {}".format(rm.mid, rm.role.mention, rm.emoji))
        self.save_reactionmessages()

    def get_reactionmessage(self, message_id: int, emoji: str):
        """Return the ReactionMessage instance which has the same message id and emoji."""
        for rm in self._reaction_messages:
            if rm.mid == message_id and rm.emoji == emoji:
                return rm
        return None

    async def load_reactionmessages(self):
        """Load reaction messages from file."""
        rm_file_path = self.config['rm']
        with open(rm_file_path, 'r') as rm_file:
            rm_file_content = yaml.safe_load(rm_file)
        guild = await self._guild()
        for raw_rm in rm_file_content:
            role = guild.get_role(int(raw_rm.role))
            rm = ReactionMessage(raw_rm.mid, role, raw_rm.emoji)
            self.add_reactionmessage(rm)

    def save_reactionmessages(self):
        """Save reaction messages to file for retrieval on next start."""
        rm_file_path = self.config['rm']
        with open(rm_file_path, 'w') as rm_file:
            yaml.dump(self._reaction_messages, rm_file)
