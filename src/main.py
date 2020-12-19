#!/usr/bin/env python

"""
Usage:
    physicsbot run [--config=<CONFIG>] [--token=<TOKEN>]
"""

import discord
from pathlib import Path
from typing import Dict, Any

import discord
import yaml
from docopt import docopt

from bot import BotClient


def start_bot(token: str, config: Dict[str, Any]) -> None:
    intents = discord.Intents.default()
    intents.members = True
    bot = BotClient(config=config, intents=intents)
    bot.run(token)


def main() -> None:
    args = docopt(__doc__)
    config_path: str = args['--config'] or str(
        Path(__file__).parent / '../dev.config.yml')
    with open(config_path, 'r') as file:
        config: Dict[str, Any] = yaml.safe_load(file)
    if args['run']:
        token: str = args['--token'] or config['token']
        start_bot(token, config)


if __name__ == "__main__":
    main()
