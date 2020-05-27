from typing import Tuple, TYPE_CHECKING

import discord

if TYPE_CHECKING:
    from bot import BotClient


def on_raw_reaction_add_arg_parser(raw_reaction: discord.RawReactionActionEvent) \
        -> Tuple[discord.Member, str, int]:
    """Parse the argument of on_raw_reaction_add listener and return member, emoji, message_id."""
    member: discord.Member = raw_reaction.member
    emoji: str = raw_reaction.emoji.name  # NOTE This actually returns a PartialEmoji
    message_id: int = raw_reaction.message_id
    return member, emoji, message_id


def on_raw_reaction_remove_arg_parser(raw_reaction: discord.RawReactionActionEvent, bot: 'BotClient') \
        -> Tuple[discord.Member, str, int]:
    """Parse the argument of on_raw_reaction_remove listener and return member, emoji, message_id."""
    guild: discord.Guild = bot.get_guild(raw_reaction.guild_id)
    member: discord.Member = guild.get_member(raw_reaction.user_id)
    emoji: str = raw_reaction.emoji.name
    message_id: int = raw_reaction.message_id
    return member, emoji, message_id
