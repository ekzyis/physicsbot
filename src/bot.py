import logging

import discord

logging.basicConfig(level=logging.INFO)


class BotClient(discord.Client):

    def __init__(self, **options):
        super().__init__(**options)

    async def on_ready(self):
        """Executed when bot is logged in and ready."""
        print('Logged in as %s with id %s' % (self.user.name, self.user.id))
