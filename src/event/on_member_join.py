from typing import Coroutine, Callable

import discord

from bot import BotClient


def on_member_join(bot: BotClient) -> Callable[[discord.Member], Coroutine]:
    """Higher order function which returns the handler for the 'on_member_join' event."""

    async def handler(member: discord.Member) -> None:
        """Greets new member."""
        guild: discord.Guild = member.guild
        bot.logger.info('User %s has joined guild %s' % (member.user.name, member.guild))
        if guild.system_channel is not None:
            greeting = discord.Embed(
                title="{}, willkommen auf {}!".format(str(member), str(guild))
            )
            await guild.system_channel.send(greeting)
            bot.logger.info('Greeting sent!')
        else:
            # logging + raising: is this good style?
            bot.logger.warning('System channel not found!')
            raise RuntimeWarning('System channel not found!')

    return handler
