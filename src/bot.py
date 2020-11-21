import logging
from typing import Dict, Any

import discord
import discord.ext

from cogs.greetings import Greetings
from log import init_logger


class BotClient(discord.ext.commands.Bot):

    def __init__(self, config: Dict[str, Any], **options: Any):
        super().__init__(**options, command_prefix="!")
        self.config = config
        self.guild: discord.Guild = self.get_guild(int(self.config['guild']))
        init_logger()
        self.logger: logging.Logger = logging.getLogger('bot')

        self.add_cog(Greetings(self))

    async def on_ready(self) -> None:
        """Executed when bot is logged in and ready."""
        self.logger.info('Logged in as %s with id %s' % (self.user.name, self.user.id))
