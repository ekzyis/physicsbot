from typing import Callable, Coroutine, Optional, TYPE_CHECKING

import discord

from const import WHITE_CHECK_MARK
from util.lecture import Lecture
from util.member import remove_role_from_member

if TYPE_CHECKING:
    from bot import BotClient


def lecture_role_unassignment(bot: 'BotClient') -> Callable[[discord.RawReactionActionEvent], Coroutine]:
    """Return the handler for the 'on_raw_reaction_remove' event for lecture roles unassignment."""

    # TODO this code is very similar to the one in `on_raw_reaction_add`
    async def handler(raw_reaction: discord.RawReactionActionEvent) -> None:
        """Handles users removing reactions from messages.
        If an user removed his previous reaction from a lecture embed, the associated role is removed."""
        if raw_reaction.user_id == bot.user.id:
            # bot should not react to reactions from itself
            return
        guild: discord.Guild = bot.get_guild(raw_reaction.guild_id)
        member: discord.Member = guild.get_member(raw_reaction.user_id)
        emoji: discord.Emoji = raw_reaction.emoji.name
        message_id: int = raw_reaction.message_id
        # TODO populate logging info with actual message?
        bot.logger.info('User %s has removed reaction %s from message with id %s' % (member, emoji, message_id))
        # check if reaction was the one we expect to remove the role
        if emoji == WHITE_CHECK_MARK:  # \u2705 is :white_check_mark:
            # check if the reaction belongs to an lecture embed
            lecture: Optional[Lecture] = bot.get_lecture_of_message_id(message_id)
            if lecture is not None:
                bot.logger.info('Reaction was removed from embed of lecture %s' % lecture.embed_title)
                lecture_role_id: str = lecture.role
                await remove_role_from_member(member, lecture_role_id)
                bot.logger.info("Role removed!")

    return handler
