from typing import TYPE_CHECKING

import discord

from event.util import on_raw_reaction_remove_arg_parser

if TYPE_CHECKING:
    from bot import BotClient


def reactionmessage_role_unassignment(bot: 'BotClient'):
    """Return the handler for the 'on_raw_reaction_remove' event for reaction-message role unassignment ."""

    # TODO this code is very similar to the one in `on_raw_reaction_add`
    async def handler(raw_reaction: discord.RawReactionActionEvent):
        """Remove the role associated with the reaction emoji from the user if the message was a reaction message."""
        if raw_reaction.user_id == bot.user.id:
            # bot should not react to reactions from itself
            return
        member, emoji, message_id = on_raw_reaction_remove_arg_parser(raw_reaction, bot)
        # check if there is a reaction message with this message id and emoji
        rm = bot.get_reactionmessage(message_id, emoji)
        if rm is None:
            # message is not a reaction message. abort.
            return
        # assign the role of the reaction message to the user
        guild_id = raw_reaction.guild_id
        role = bot.get_guild(guild_id).get_role(rm.rid)
        await member.remove_roles(role)
        bot.logger.info("Removed role {} from {}!".format(role, member))

    return handler
