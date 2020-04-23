import logging


def init_logger():
    """Initializes the discord logger and other loggers."""
    d_logger = logging.getLogger('discord')
    d_logger.setLevel(logging.DEBUG)
    # TODO cmd option to clear log on startup?
    d_handler = logging.FileHandler(filename='discord.log', encoding='utf-8', mode='a')
    d_handler.setFormatter(logging.Formatter('%(asctime)s:%(levelname)s:%(name)s: %(message)s'))
    d_logger.addHandler(d_handler)
