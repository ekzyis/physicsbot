import logging

import discord

logging.basicConfig(level=logging.INFO)


class BotClient(discord.Client):

    def __init__(self, config=None, **options):
        super().__init__(**options)
        self.config = config

    async def on_ready(self):
        """Executed when bot is logged in and ready."""
        print('Logged in as %s with id %s' % (self.user.name, self.user.id))

    @staticmethod
    async def on_member_join(member):
        """Greets new member."""
        guild = member.guild
        if guild.system_channel is not None:
            greeting = discord.Embed(
                title="{}, willkommen auf {}!".format(str(member), str(guild))
            )
            await guild.system_channel.send(greeting)
