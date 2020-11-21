import discord
from discord.ext import commands


class RoleDistributor(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.group()
    async def roledist(self, ctx):
        pass

    @roledist.command('attach')
    async def attach(self, ctx):
        print("comand invoked!")


def setup(bot: discord.ext.commands.Bot):
    bot.add_cog(RoleDistributor(bot))
