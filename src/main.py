#!/usr/bin/env python

"""Physicsbot.

Usage:
    physicsbot run [-c <CONFIG>] --token=<TOKEN>
    physicsbot config add <NAME> --role=<ROLE> --emoji=<EMOJI> --channel=<CHANNEL>
    physicsbot config update <NAME> [--role=<ROLE>] [--emoji=<EMOJI>] [--channel=<CHANNEL>]
    physicsbot config remove <NAME>
    physicsbot config write <FILE>
"""

from docopt import docopt

from bot import BotClient

if __name__ == "__main__":
    args = docopt(__doc__)
    if args['run']:
        bot = BotClient()
        token = args['--token']
        bot.run(token)
