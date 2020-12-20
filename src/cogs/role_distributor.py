"""RoleDistributor Cog Module."""

import logging
import sys
from dataclasses import dataclass
from typing import List

import discord
import yaml
from discord.ext import commands
from discord.ext.commands import Context, Bot as DiscordBot, RoleConverter, MessageConverter

from cogs.base import BaseCog
from converter.unicode import UnicodeEmojiConverter


@dataclass
class ReactionMessage:
    """Data container class for Reaction Messages"""
    gid: int  # id of guild the message/command was posted in
    mid: int  # message id of the reaction message
    rid: int  # id of role which should be assigned when reacted to this message with the emoji
    rname: str  # name of role
    ename: str  # the emoji name with which the user needs to react to be assigned the role


class RoleDistributor(BaseCog):
    """
    RoleDistributor. Extension of base.cog.BaseCog.

    Implements role distribution by attaching listeners to messages via command.
    """

    def __init__(self, bot: DiscordBot):
        self.bot: DiscordBot = bot

        self.logger: logging.Logger = logging.getLogger('role_distributor')
        self.logger.setLevel(logging.DEBUG)
        self.logger.addHandler(logging.StreamHandler(sys.stdout))

        self.path = 'role-dist.yml'
        self.reaction_messages = self.load_from_file()

    # pylint: disable=invalid-name
    def add(self, rm: ReactionMessage) -> None:
        """
        Add reaction message to list of current reaction messages.

        Sync change with list in file by overwriting file with new list.
        """
        self.reaction_messages.append(rm)
        self.save_to_file()

    # pylint: disable=invalid-name
    def remove(self, rm: ReactionMessage) -> None:
        """
        Remove reaction message from list of current reaction messages.

        Sync change with list in file by overwriting file with new list.
        """
        self.reaction_messages.remove(rm)
        self.save_to_file()

    def save_to_file(self) -> None:
        """Save reaction messages to file for persistence across bot restarts."""
        with open(self.path, 'w') as file:
            yaml.dump(self.reaction_messages, file)

    def load_from_file(self) -> List[ReactionMessage]:
        """Load reaction messages from file."""
        try:
            with open(self.path, 'r') as file:
                data = yaml.load(file, Loader=yaml.Loader)
                if data is None:
                    self.logger.info(
                        # pylint: disable=line-too-long
                        'Could not load reaction messages from %s. File is empty.', self.path)
                    return []
                self.logger.info(
                    'Loaded %s reaction message(s) from %s.', len(data), self.path)
                return data
        except FileNotFoundError:
            self.logger.warning(
                'Could not load reaction messages from %s. File not found.', self.path)
            return []

    @commands.group()
    async def roledist(self, ctx: Context) -> None:
        """Implements command group with name `roledist`."""

    @roledist.command('attach',
                      help='Usage: !?!roledist attach [<CHANNELID>:]<MESSAGEID> <ROLE> <EMOJI> \n\
(use shift while copying message ids to include channel id)')
    @commands.has_permissions(manage_roles=True)
    async def attach(self, _: Context, message: MessageConverter, role: RoleConverter,
                     emoji_name: UnicodeEmojiConverter) -> None:
        """
        Attach a reaction listener to a message.

        This enables role assignment via reactions to the message.
        Only users with permission MANAGE_ROLES can use this command.
        """
        message: discord.Message  # type: ignore
        role: discord.Role  # type: ignore
        emoji_name: str  # type: ignore
        guild_id = message.guild.id
        rm = ReactionMessage(gid=guild_id, mid=message.id,
                             rid=role.id, rname=role.name, ename=emoji_name)
        self.add(rm)
        await message.add_reaction(emoji_name)

    @roledist.command('detach',
                      help='Usage: !?!roledist detach [<CHANNELID>:]<MESSAGEID> <ROLE> <EMOJI>')
    @commands.has_permissions(manage_roles=True)
    async def detach(self, ctx: Context, message: MessageConverter, role: RoleConverter,
                     emoji_name: UnicodeEmojiConverter) -> None:
        """
        Remove a reaction listener from a message.

        This disables role assignment via reaction to the message.
        Only users with permission MANAGE_ROLES can use this command.
        """
        message: discord.Message  # type: ignore
        role: discord.Role  # type: ignore
        emoji_name: str  # type: ignore
        guild_id = message.guild.id
        bot: DiscordBot = ctx.bot
        rm = ReactionMessage(gid=guild_id, mid=message.id,
                             rid=role.id, rname=role.name, ename=emoji_name)
        try:
            self.remove(rm)
            await message.remove_reaction(emoji_name, bot.user)
        except ValueError:
            await ctx.channel.send('Could not detach listener because none is attached.')

    @roledist.command('status',
                      help='Usage: !?!roledist status')
    @commands.has_permissions(manage_roles=True)
    async def status(self, ctx: Context) -> None:
        """Show all active reaction listeners for role distribution as a discord.Embed."""
        embed_title = "Status of Role Distributor"
        guild_reaction_messages = [
            rm for rm in self.reaction_messages if rm.gid == ctx.message.guild.id]
        if len(guild_reaction_messages) == 0:
            desc = "No listeners attached."
        else:
            desc = "{} listener(s) attached:".format(
                len(guild_reaction_messages))
            desc += "\n"
            desc += "\n".join(
                ["{} <@&{}> {}".format(rm.mid, rm.rid, rm.ename)
                 for rm in guild_reaction_messages
                 if rm.gid == ctx.message.guild.id]
            )
        embed = discord.Embed(
            title=embed_title,
            description=desc,
            color=0xe1e100
        )
        await ctx.channel.send(embed=embed)

    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent) -> None:
      # pylint: disable=line-too-long
        """Assign role if a member reacted to a reaction message with the corresponding reaction."""
        member: discord.Member = payload.member
        if member.bot:
            return
        mid = payload.message_id
        for rm in self.reaction_messages:
            if rm.mid == mid and rm.ename == payload.emoji.name and rm.gid == payload.guild_id:
                guild = self.bot.get_guild(payload.guild_id)
                role = guild.get_role(rm.rid)
                await member.add_roles(role)
                break

    @commands.Cog.listener()
    async def on_raw_reaction_remove(self, payload: discord.RawReactionActionEvent) -> None:
        # pylint: disable=line-too-long
        """Unassign role if a member reacted to a reaction message with the corresponding reaction."""
        mid: discord.Message = payload.message_id
        guild = self.bot.get_guild(payload.guild_id)
        member = await guild.fetch_member(payload.user_id)
        if member.bot:
            return
        for rm in self.reaction_messages:
            if rm.mid == mid and rm.ename == payload.emoji.name and rm.gid == payload.guild_id:
                role = guild.get_role(rm.rid)
                await member.remove_roles(role)
                break


def setup(bot: DiscordBot) -> None:
    """Add RoleDistributor extension to bot."""
    bot.add_cog(RoleDistributor(bot))
