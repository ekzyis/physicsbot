import logging
import os
import sys


class MakeFileHandler(logging.FileHandler):
    """FileHandler class to automatically create folders needed for logs."""

    def __init__(self, filename: str, mode: str = 'a', encoding: str = 'utf-8', delay: bool = False):
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        super().__init__(filename, mode, encoding, delay)


def init_bot_logger(path: str = 'logs/physicsbot.log') -> None:
    bot_logger = logging.getLogger('bot')
    bot_logger.setLevel(logging.DEBUG)
    bot_file_handler = MakeFileHandler(filename=path, encoding='utf-8', mode='a')
    bot_file_handler.setFormatter(logging.Formatter('%(asctime)s:%(levelname)s: %(message)s'))
    bot_logger.addHandler(bot_file_handler)
    # also log to console
    bot_logger.addHandler(logging.StreamHandler(sys.stdout))


def init_discord_logger(path: str = 'logs/discord.log') -> None:
    d_logger = logging.getLogger('discord')
    d_logger.setLevel(logging.DEBUG)
    d_handler = MakeFileHandler(filename=path, encoding='utf-8', mode='a')
    d_handler.setFormatter(logging.Formatter('%(asctime)s:%(levelname)s:%(name)s: %(message)s'))
    d_logger.addHandler(d_handler)


def init_logger() -> None:
    """Initializes the discord logger and other loggers."""
    init_discord_logger()
    init_bot_logger()
