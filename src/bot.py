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

    async def init_overview_channel(self):
        """Initializes the overview channel.
        Makes sure that an embed for every lecture exists such that users can react to it and
        the role can be assigned."""
        overview_channel = await self.fetch_channel(self.config['overview'])
        for lecture in self.config['lectures']:
            embed = get_lecture_embed(overview_channel, lecture)
            if embed is None:
                embed = create_lecture_embed()
                overview_channel.send(embed)
                pass
            else:
                # update overview embed if needed
                update_lecture_embed(embed)
