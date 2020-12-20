"""Status Cog Module."""

import os

import discord
from discord.ext import commands
from discord.ext.commands import Bot as DiscordBot, Context

from cogs.base import BaseCog


def commit_hyperlink(commit: str) -> str:
    """Wrap input string with a link to the commit on Github if input is not '-'."""
    if commit == '-':
        return "-"
    return "[%s](%s)" % (commit, "https://github.com/ekzyis/physicsbot/commit/%s" % commit)


class Status(BaseCog):
    """
    Status. Extension of cogs.base.BaseCog.

    Implements commands to report back current bot status to users via discord.
    """

    def __init__(self, bot: DiscordBot) -> None:
        self.bot = bot
        try:
            self._commit = os.environ['GIT_COMMIT']
        except KeyError:
            self._commit = '-'

    @commands.command()
    async def status(self, ctx: Context) -> None:
        """Status command implementation."""
        desc = 'Commit: %s' % commit_hyperlink(self._commit)
        embed = discord.Embed(
            title='Status',
            description=desc,
            color=0xe1e100
        )
        await ctx.channel.send(embed=embed)


def setup(bot: DiscordBot) -> None:
    """Add Status extension to bot."""
    bot.add_cog(Status(bot))
