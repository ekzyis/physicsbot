"""
Main Bot module.

Exports the bot client which implements discord API communication.
"""

import logging
import sys
from typing import Dict, Any

from discord.ext.commands import Bot


class BotClient(Bot):
    """
    BotClient. Extension of discord.ext.commands.Bot.

    This bot is designed to be highly modular.
    All commands are implemented with Cogs. They are then loaded with `load_extension`.
    """

    def __init__(self, config: Dict[str, Any], **options: Any):
        super().__init__(**options, command_prefix="!?!")
        self.config = config

        self.logger: logging.Logger = logging.getLogger('bot')
        self.logger.setLevel(logging.DEBUG)
        self.logger.addHandler(logging.StreamHandler(sys.stdout))

        self.load_extension('cogs.role_distributor')
        self.load_extension('cogs.send')
        self.load_extension('cogs.status')

    async def on_ready(self) -> None:
        """Executed when bot is logged in and ready."""
        self.logger.info('Logged in as %s with id %s',
                         self.user.name, self.user.id)
