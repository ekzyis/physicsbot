from dataclasses import dataclass

import discord
from discord.ext import commands
from discord.ext.commands import Bot, RoleConverter, MessageConverter

from converter.unicode import UnicodeEmojiConverter


@dataclass
class ReactionMessage:
    """Data container class for Reaction Messages"""
    mid: int  # message id of the reaction message
    rid: int  # id of role which should be assigned when reacted to this message with the emoji
    rname: str  # name of role
    ename: str  # the emoji name with which the user needs to react to be assigned the role


class RoleDistributor(commands.Cog):
    def __init__(self, bot):
        self.bot: Bot = bot
        self.reaction_messages: [ReactionMessage] = []

    @commands.group()
    async def roledist(self, ctx):
        pass

    @roledist.command('attach')
    @commands.has_permissions(manage_roles=True)
    async def attach(self, ctx, message: MessageConverter, role: RoleConverter, emoji_name: UnicodeEmojiConverter):
        """Add a reaction message to the bot instance; enabling role assignment via reactions to the message."""
        message: discord.Message
        role: discord.Role
        emoji_name: str
        rm = ReactionMessage(mid=message.id, rid=role.id, rname=role.name, ename=emoji_name)
        self.reaction_messages.append(rm)
        await message.add_reaction(emoji_name)

    @roledist.command('detach')
    @commands.has_permissions(manage_roles=True)
    async def detach(self, ctx, message: MessageConverter, role: RoleConverter, emoji_name: UnicodeEmojiConverter):
        message: discord.Message
        role: discord.Role
        emoji_name: str
        bot: Bot = ctx.bot
        rm = ReactionMessage(mid=message.id, rid=role.id, rname=role.name, ename=emoji_name)
        try:
            self.reaction_messages.remove(rm)
            await message.remove_reaction(emoji_name, bot.user)
        except ValueError:
            await ctx.channel.send('Could not detach listener because none is attached.')

    @roledist.command('status')
    @commands.has_permissions(manage_roles=True)
    async def status(self, ctx):
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
            description=desc
        )
        await ctx.channel.send(embed=embed)


def setup(bot: Bot):
    bot.add_cog(RoleDistributor(bot))
