from dataclasses import dataclass
from typing import List

import discord
import yaml
from discord.ext import commands
from discord.ext.commands import Context, Bot as DiscordBot, RoleConverter, MessageConverter

from converter.unicode import UnicodeEmojiConverter


@dataclass
class ReactionMessage:
    """Data container class for Reaction Messages"""
    mid: int  # message id of the reaction message
    rid: int  # id of role which should be assigned when reacted to this message with the emoji
    rname: str  # name of role
    ename: str  # the emoji name with which the user needs to react to be assigned the role


class RoleDistributor(commands.Cog):
    def __init__(self, bot: DiscordBot):
        self.bot: DiscordBot = bot
        self.path = 'role-dist.yml'
        self.reaction_messages = self.load_from_file()

    def add(self, rm: ReactionMessage) -> None:
        self.reaction_messages.append(rm)
        self.save_to_file()

    def remove(self, rm: ReactionMessage) -> None:
        self.reaction_messages.remove(rm)
        self.save_to_file()

    def save_to_file(self) -> None:
        with open(self.path, 'w') as file:
            yaml.dump(self.reaction_messages, file)

    def load_from_file(self) -> List[ReactionMessage]:
        try:
            with open(self.path, 'r') as file:
                return yaml.load(file, Loader=yaml.Loader)
        except FileNotFoundError:
            return []

    @commands.group()
    async def roledist(self, ctx: Context) -> None:
        pass

    @roledist.command('attach',
                      help='Usage: !?!roledist attach [<CHANNELID>:]<MESSAGEID> <ROLE> <EMOJI>')
    @commands.has_permissions(manage_roles=True)
    async def attach(self, ctx: Context, message: MessageConverter, role: RoleConverter,
                     emoji_name: UnicodeEmojiConverter) -> None:
        """Add a reaction message to the bot instance; enabling role assignment via reactions to the message."""
        message: discord.Message  # type: ignore
        role: discord.Role  # type: ignore
        emoji_name: str  # type: ignore
        rm = ReactionMessage(mid=message.id, rid=role.id, rname=role.name, ename=emoji_name)
        self.add(rm)
        await message.add_reaction(emoji_name)

    @roledist.command('detach',
                      help='Usage: !?!roledist detach [<CHANNELID>:]<MESSAGEID> <ROLE> <EMOJI>')
    @commands.has_permissions(manage_roles=True)
    async def detach(self, ctx: Context, message: MessageConverter, role: RoleConverter,
                     emoji_name: UnicodeEmojiConverter) -> None:
        message: discord.Message  # type: ignore
        role: discord.Role  # type: ignore
        emoji_name: str  # type: ignore
        bot: DiscordBot = ctx.bot
        rm = ReactionMessage(mid=message.id, rid=role.id, rname=role.name, ename=emoji_name)
        try:
            self.remove(rm)
            await message.remove_reaction(emoji_name, bot.user)
        except ValueError:
            await ctx.channel.send('Could not detach listener because none is attached.')

    @roledist.command('status',
                      help='Usage: !?!roledist status')
    @commands.has_permissions(manage_roles=True)
    async def status(self, ctx: Context) -> None:
        embed_title = "Status of Role Distributor"
        if len(self.reaction_messages) == 0:
            desc = "No listeners attached."
        else:
            desc = "{} listener(s) attached:".format(len(self.reaction_messages))
            desc += "\n"
            desc += "\n".join(
                ["mid: {}, role: {}, emoji: {}".format(rm.mid, rm.rname, rm.ename) for rm in self.reaction_messages])
        embed = discord.Embed(
            title=embed_title,
            description=desc,
            color=0xe1e100
        )
        await ctx.channel.send(embed=embed)

    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent) -> None:
        mid = payload.message_id
        for rm in self.reaction_messages:
            if rm.mid == mid and rm.ename == payload.emoji.name:
                guild = self.bot.get_guild(payload.guild_id)
                role = guild.get_role(rm.rid)
                await payload.member.add_roles(role)
                break

    @commands.Cog.listener()
    async def on_raw_reaction_remove(self, payload: discord.RawReactionActionEvent) -> None:
        mid: discord.Message = payload.message_id
        for rm in self.reaction_messages:
            if rm.mid == mid and rm.ename == payload.emoji.name:
                guild = self.bot.get_guild(payload.guild_id)
                role = guild.get_role(rm.rid)
                member = await guild.fetch_member(payload.user_id)
                await member.remove_roles(role)
                break

    async def cog_command_error(self, ctx: Context, error: commands.CommandError):
        embed = discord.Embed(color=0xff0000)
        embed.add_field(name="Error", value=str(error), inline=False)
        embed.add_field(name="Usage", value=ctx.command.help.replace('Usage: ', ''), inline=False)
        await ctx.channel.send(embed=embed)


def setup(bot: DiscordBot) -> None:
    bot.add_cog(RoleDistributor(bot))
