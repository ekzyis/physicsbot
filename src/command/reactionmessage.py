from dataclasses import dataclass
from typing import TYPE_CHECKING

import discord
from discord.ext import commands
from discord.ext.commands import MessageConverter, RoleConverter, EmojiConverter

if TYPE_CHECKING:
    from bot import BotClient


@dataclass
class ReactionMessage:
    """Data container class for Reaction Messages"""
    mid: int  # message id of the reaction message
    role: discord.Role  # which role should be assigned when reacted to this message with the emoji
    emoji: discord.Emoji  # the emoji with which the user needs to react to be assigned the role


@commands.group(name="reactionmessage", invoke_without_command=True)
async def reactionmessage(ctx):
    pass


@reactionmessage.command(name="add")
@commands.has_permissions(manage_roles=True)
async def add_reactionmessage(ctx, message: MessageConverter, role: RoleConverter, emoji: EmojiConverter):
    """Add a reaction message to the bot instance; enabling role assignment via reactions to the message."""
    message: discord.Message
    role: discord.Role
    emoji: discord.Emoji
    bot: 'BotClient' = ctx.bot
    rm = ReactionMessage(mid=message.id, role=role, emoji=emoji)
    bot.add_reaction_message(rm)


@reactionmessage.command(name="remove")
@commands.has_permissions(manage_roles=True)
async def remove_reactionmessage(ctx, message: MessageConverter, role: RoleConverter, emoji: EmojiConverter):
    """Remove a reaction message from the bot instance; disabling role assignment via reactions to the message."""
    message: discord.Message
    role: discord.Role
    emoji: discord.Emoji
    bot: 'BotClient' = ctx.bot
    rm = ReactionMessage(mid=message.id, role=role, emoji=emoji)
    bot.remove_reaction_message(rm)
