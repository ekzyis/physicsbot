"""Send Cog Module."""

import discord
from discord.ext import commands
from discord.ext.commands import Context, Bot as DiscordBot

from cogs.base import BaseCog


class Send(BaseCog):
    """
    Send. Extension of cogs.base.BaseCog.

    Enables users to format messages as embeds using a command.
    The bot replies with a formatted embed.
    """

    def __init__(self, bot: DiscordBot) -> None:
        self.bot = bot

    @commands.group()
    async def send(self, ctx: Context) -> None:
        """Implements command group with name `send`."""

    @send.command(name='embed',
                  help='Usage: !?!send embed <TITLE> <DESCRIPTION>')
    async def embed(self, ctx: Context, title: str, *descriptions: str) -> None:
        """Send a formatted embed."""
        embed = discord.Embed(title=title, description="\n".join(descriptions))
        await ctx.channel.send(embed=embed)


def setup(bot: DiscordBot) -> None:
    """Add Send extension to bot."""
    bot.add_cog(Send(bot))
