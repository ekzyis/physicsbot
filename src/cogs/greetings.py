import discord
from discord.ext import commands
from discord.ext.commands import Bot as DiscordBot


class Greetings(commands.Cog):
    def __init__(self, bot: DiscordBot) -> None:
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member) -> None:
        channel = member.guild.system_channel
        if channel is not None:
            greeting = discord.Embed(
                title="{}, willkommen auf {}!".format(
                    str(member), str(member.guild))
            )
            await channel.send(greeting)


def setup(bot: DiscordBot) -> None:
    bot.add_cog(Greetings(bot))
