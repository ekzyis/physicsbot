from typing import Coroutine, Callable, TYPE_CHECKING

import discord

if TYPE_CHECKING:
    from bot import BotClient


def greet_member(bot: 'BotClient') -> Callable[[discord.Member], Coroutine]:
    """Return the handler for the 'on_member_join' event to greet members."""

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
