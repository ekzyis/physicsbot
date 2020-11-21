from typing import Callable, Coroutine, TYPE_CHECKING, Optional

import discord

from const import WHITE_CHECK_MARK
from event.util import on_raw_reaction_add_arg_parser
from util.lecture import Lecture
from util.member import add_role_to_member

if TYPE_CHECKING:
    from bot import BotClient


def lecture_role_assignment(bot: 'BotClient') -> Callable[[discord.RawReactionActionEvent], Coroutine]:
    """Return the handler for the 'on_raw_reaction_add' event for lecture roles assignment."""

    async def handler(raw_reaction: discord.RawReactionActionEvent) -> None:
        """If an user reacted appropriately to an lecture embed, the user is assigned the role associated
        with the lecture.
        """
        if raw_reaction.user_id == bot.user.id:
            # bot should not react to reactions from itself
            return
        member, emoji, message_id = on_raw_reaction_add_arg_parser(raw_reaction)
        # check if reaction was the one we expect to for role assignment
        if emoji == WHITE_CHECK_MARK:
            # check if the reaction belongs to an lecture embed
            lecture: Optional[Lecture] = bot.get_lecture_of_message_id(message_id)
            if lecture is not None:
                bot.logger.info('Reaction was added to embed of lecture %s' % lecture.embed_title)
                lecture_role_id: str = lecture.role
                await add_role_to_member(member, lecture_role_id)
                bot.logger.info("Role added!")

    return handler