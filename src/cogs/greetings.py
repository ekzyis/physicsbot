"""Greetings Cog Module."""

import discord
from discord.ext import commands
from discord.ext.commands import Bot as DiscordBot

from cogs.base import BaseCog


class Greetings(BaseCog):
    """Greetings. extension of cogs.base.BaseCog."""

    def __init__(self, bot: DiscordBot) -> None:
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member) -> None:
        """Greet new members."""
        channel = member.guild.system_channel
        if channel is not None:
            greeting = discord.Embed(
                title="{}, willkommen auf {}!".format(
                    str(member), str(member.guild))
            )
            await channel.send(greeting)


def setup(bot: DiscordBot) -> None:
    """Add Greetings extension to bot."""
    bot.add_cog(Greetings(bot))
