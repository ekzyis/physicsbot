#!/usr/bin/env python

"""
Usage:
    physicsbot run [--config=<CONFIG>] [--token=<TOKEN>]
"""

from pathlib import Path
from typing import Dict, Any

import discord
import yaml
from docopt import docopt

from bot import BotClient


def start_bot(token: str, config: Dict[str, Any]) -> None:
    """Starts the bot and runs the guild initialisation process.
    Consists of making sure that for every lecture, there is an embed in the overview channel.
    """
    intents = discord.Intents.default()
    intents.members = True
    bot = BotClient(config=config, intents=intents)
    # TODO Refactor lecture code into separate module!
    #   https://github.com/ekzyis/physicsbot/issues/51
    if 'lectures' in config:
        bot.loop.create_task(bot.init_overview_channel())
    bot.loop.create_task(bot.load_reactionmessages())
    bot.run(token)


def main() -> None:
    args = docopt(__doc__)
    config_path: str = args['--config'] or str(Path(__file__).parent / '../dev.config.yml')
    with open(config_path, 'r') as file:
        config: Dict[str, Any] = yaml.safe_load(file)
    if args['run']:
        token: str = args['--token'] or config['token']
        start_bot(token, config)


if __name__ == "__main__":
    main()
