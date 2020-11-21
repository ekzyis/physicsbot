import discord
from discord.ext import commands
from discord.ext.commands import Context


class BaseCog(commands.Cog):
    async def cog_command_error(self, ctx: Context, error: commands.CommandError):
        usage = ctx.command.help if ctx.command.help else "-"
        embed = discord.Embed(color=0xff0000)
        embed.add_field(name="Error", value=str(error), inline=False)
        embed.add_field(name="Usage", value=usage.replace('Usage: ', ''), inline=False)
        await ctx.channel.send(embed=embed)
