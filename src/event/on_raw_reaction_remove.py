from const import WHITE_CHECK_MARK
from util import remove_role_from_member


def on_raw_reaction_remove(bot):
    """Higher order  function which returns the handler for the 'on_raw_reaction_add' event."""

    # TODO this code is very similar to the one in `on_raw_reaction_add`
    async def handler(raw_reaction):
        """Handles users removing reactions from messages.
        If an user removed his previous reaction from a lecture embed, the associated role is removed."""
        if raw_reaction.user_id == bot.user.id:
            # bot should not react to reactions from itself
            return
        guild = bot.get_guild(raw_reaction.guild_id)
        member = guild.get_member(raw_reaction.user_id)
        emoji = raw_reaction.emoji.name
        message_id = raw_reaction.message_id
        # TODO populate logging info with actual message?
        bot.logger.info('User %s has removed reaction %s from message with id %s' % (member, emoji, message_id))
        # check if reaction was the one we expect to assign the role
        if emoji == '\u2705':  # \u2705 is :white_check_mark:
            # check if the reaction belongs to an lecture embed
            lecture = bot.get_lecture_of_message_id(message_id)
            if lecture is not None:
                bot.logger.info('Reaction was removed from embed of lecture %s' % lecture['embed_title'])
                lecture_role_id = lecture['role']
                await remove_role_from_member(member, lecture_role_id)
                bot.logger.info("Role removed!")

    return handler
