from cogs.base import BaseCog
import discord
import os
from discord.ext import commands
from discord.ext.commands import Bot as DiscordBot, Context


def commit_hyperlink(commit: str) -> str:
    if commit == '-':
        return "-"
    else:
        return "[%s](%s)" % (commit, "https://github.com/ekzyis/physicsbot/commit/%s" % commit)


class Status(commands.Cog):
    def __init__(self, bot: DiscordBot) -> None:
        self.bot = bot
        try:
            self._commit = os.environ['GIT_COMMIT']
        except KeyError:
            self._commit = '-'

    @commands.command()
    async def status(self, ctx: Context) -> None:
        desc = 'Commit: %s' % commit_hyperlink(self._commit)
        embed = discord.Embed(
            title='Status',
            description=desc,
            color=0xe1e100
        )
        await ctx.channel.send(embed=embed)


def setup(bot: DiscordBot) -> None:
    bot.add_cog(Status(bot))
