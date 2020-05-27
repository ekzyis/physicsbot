from typing import TYPE_CHECKING

import discord
from discord.ext import commands
from discord.ext.commands import MessageConverter, RoleConverter, EmojiConverter

if TYPE_CHECKING:
    from bot import BotClient


class ReactionMessage:
    def __init__(self, mid: int, role, emoji):
        self.mid = mid
        self.role = role
        self.emoji = emoji

    def __eq__(self, other):
        return self.mid == other.mid \
               and self.role.id == other.role.id \
               and self.emoji.id == other.emoji.id


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
