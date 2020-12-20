"""Base Cog Module."""

import discord
from discord.ext.commands import Cog, Context, CommandError


class BaseCog(Cog):
    """
    BaseCog. Extension of discord.ext.commands.Cog.

    All other cogs should inherit from this cog.
    Implements error handling for all other cogs.
    """
    async def cog_command_error(self, ctx: Context, error: CommandError):
        usage = ctx.command.help if ctx.command.help else "-"
        embed = discord.Embed(color=0xff0000)
        embed.add_field(name="Error", value=str(error), inline=False)
        embed.add_field(name="Usage", value=usage.replace(
            'Usage: ', ''), inline=False)
        await ctx.channel.send(embed=embed)
