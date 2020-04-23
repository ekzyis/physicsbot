import logging
import sys


def init_bot_logger():
    bot_logger = logging.getLogger('bot')
    bot_logger.setLevel(logging.DEBUG)
    # TODO cmd option to clear log on startup?
    bot_file_handler = logging.FileHandler(filename='physicsbot.log', encoding='utf-8', mode='a')
    bot_file_handler.setFormatter(logging.Formatter('%(asctime)s:%(levelname)s: %(message)s'))
    bot_logger.addHandler(bot_file_handler)
    # also log to console
    bot_logger.addHandler(logging.StreamHandler(sys.stdout))


def init_discord_logger():
    d_logger = logging.getLogger('discord')
    d_logger.setLevel(logging.DEBUG)
    # TODO cmd option to clear log on startup?
    d_handler = logging.FileHandler(filename='discord.log', encoding='utf-8', mode='a')
    d_handler.setFormatter(logging.Formatter('%(asctime)s:%(levelname)s:%(name)s: %(message)s'))
    d_logger.addHandler(d_handler)


def init_logger():
    """Initializes the discord logger and other loggers."""
    init_discord_logger()
    init_bot_logger()
