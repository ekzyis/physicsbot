#!/usr/bin/env python

"""Physicsbot.

Usage:
    physicsbot run [--config=<CONFIG>] [--token=<TOKEN>]
    physicsbot config add <NAME> --role=<ROLE> --emoji=<EMOJI> --channel=<CHANNEL>
    physicsbot config update <NAME> [--role=<ROLE>] [--emoji=<EMOJI>] [--channel=<CHANNEL>]
    physicsbot config remove <NAME>
    physicsbot config write <FILE>
"""

from pathlib import Path

import yaml
from docopt import docopt

from bot import BotClient

if __name__ == "__main__":
    args = docopt(__doc__)
    config_path = args['--config'] or str(Path(__file__).parent / '../config.yml')
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
    if args['run']:
        bot = BotClient(config=config)
        token = args['--token'] or config['token']
        bot.run(token)
