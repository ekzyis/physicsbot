import discord
from discord.ext import commands


class Greetings(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member):
        channel = member.guild.system_channel
        if channel is not None:
            greeting = discord.Embed(
                title="{}, willkommen auf {}!".format(str(member), str(member.guild))
            )
            await channel.send(greeting)
