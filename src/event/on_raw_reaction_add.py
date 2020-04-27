from const import WHITE_CHECK_MARK
from util import add_role_to_member


def on_raw_reaction_add(bot):
    """Higher order  function which returns the handler for the 'on_raw_reaction_add' event."""

    async def handler(raw_reaction):
        """If an user reacted appropriately to an lecture embed, the user is assigned the role associated
        with the lecture.
        """
        if raw_reaction.user_id == bot.user.id:
            # bot should not react to reactions from itself
            return
        member = raw_reaction.member
        emoji = raw_reaction.emoji.name
        message_id = raw_reaction.message_id
        # TODO populate logging info with actual message?
        bot.logger.info('User %s has reacted with %s to message with id %s' % (member, emoji, message_id))
        # check if the reaction belongs to an lecture embed
        lecture = bot.get_lecture_of_message_id(message_id)
        # check if reaction was the one we expect to for role assignment
        if emoji == WHITE_CHECK_MARK:
            if lecture is not None:
                bot.logger.info('Reaction was added to embed of lecture %s' % lecture['embed_title'])
                lecture_role_id = lecture['role']
                await add_role_to_member(member, lecture_role_id)
                bot.logger.info("Role added!")

    return handler
