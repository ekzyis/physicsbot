import discord


def on_member_join(bot):
    """Higher order function which returns the handler for the 'on_member_join' event."""

    async def handler(member):
        """Greets new member."""
        guild = member.guild
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
