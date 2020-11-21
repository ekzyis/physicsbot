import discord
from discord.ext import commands
from discord.ext.commands import Context, Bot as DiscordBot

from cogs.base import BaseCog


class Send(BaseCog):
    def __init__(self, bot: DiscordBot) -> None:
        self.bot = bot

    @commands.group()
    async def send(self, ctx: Context) -> None:
        pass

    @send.command(name='embed',
                  help='Usage: !?!send embed <TITLE> <DESCRIPTION>')
    async def embed(self, ctx: Context, title: str, *descriptions: str) -> None:
        embed = discord.Embed(title=title, description="\n".join(descriptions))
        await ctx.channel.send(embed=embed)


def setup(bot: DiscordBot) -> None:
    bot.add_cog(Send(bot))
