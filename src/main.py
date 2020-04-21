#!/usr/bin/env python

"""Physicsbot.

Usage:
    physicsbot run [-c <CONFIG>] [--token=<TOKEN>]
    physicsbot config add <NAME> --role=<ROLE> --emoji=<EMOJI> --channel=<CHANNEL>
    physicsbot config update <NAME> [--role=<ROLE>] [--emoji=<EMOJI>] [--channel=<CHANNEL>]
    physicsbot config remove <NAME>
    physicsbot config write <FILE>
"""

from docopt import docopt

from bot import BotClient
from pathlib import Path
import yaml

if __name__ == "__main__":
    args = docopt(__doc__)
    config_path = str(Path(__file__).parent / '../config.yml')
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
    if args['run']:
        bot = BotClient()
        token = args['--token'] or config['token']
        bot.run(token)