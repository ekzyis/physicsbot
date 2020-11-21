import logging
from typing import Dict, Any

import discord
from discord.ext.commands import Bot

from log import init_logger


class BotClient(Bot):

    def __init__(self, config: Dict[str, Any], **options: Any):
        super().__init__(**options, command_prefix="!")
        self.config = config
        self.guild: discord.Guild = self.get_guild(int(self.config['guild']))
        init_logger()
        self.logger: logging.Logger = logging.getLogger('bot')

        self.load_extension('cogs.role_distributor')

    async def on_ready(self) -> None:
        """Executed when bot is logged in and ready."""
        self.logger.info('Logged in as %s with id %s' % (self.user.name, self.user.id))
