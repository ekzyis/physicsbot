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


def start_bot(token, config):
    """Starts the bot and runs the guild initialisation process.
    Consists of making sure that for every lecture, there is an embed in the overview channel.
    """
    bot = BotClient(config=config)
    bot.loop.create_task(bot.init_overview_channel())
    bot.run(token)


def main():
    args = docopt(__doc__)
    config_path = args['--config'] or str(Path(__file__).parent / '../test.config.yml')
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
    if args['run']:
        token = args['--token'] or config['token']
        start_bot(token, config)


if __name__ == "__main__":
    main()
