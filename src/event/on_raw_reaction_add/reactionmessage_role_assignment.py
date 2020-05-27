from typing import TYPE_CHECKING

import discord

from event.util import on_raw_reaction_add_arg_parser

if TYPE_CHECKING:
    from bot import BotClient


def reactionmessage_role_assignment(bot: 'BotClient'):
    """Return the handler for the 'on_raw_reaction_add' event for reaction-message role assignment ."""

    async def handler(raw_reaction: discord.RawReactionActionEvent):
        """Assign the role the user if he reacted to a reaction message with a valid emoji."""
        if raw_reaction.user_id == bot.user.id:
            # bot should not react to reactions from itself
            return
        member, emoji, message_id = on_raw_reaction_add_arg_parser(raw_reaction)
        # check if there is a reaction message with this message id and emoji
        rm = bot.get_reactionmessage(message_id, emoji)
        if rm is None:
            # message is not a reaction message. abort.
            return
        # assign the role of the reaction message to the user
        role = rm.role
        await member.add_roles(role)

    return handler
