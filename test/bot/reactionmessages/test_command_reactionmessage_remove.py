from unittest import mock

import aiounittest

# noinspection PyUnresolvedReferences
import test.context
from command.reactionmessage import ReactionMessage, reactionmessage_remove


@mock.patch('discord.Emoji', autospec=True)
@mock.patch('discord.Role', autospec=True)
@mock.patch('discord.Message', autospec=True)
@mock.patch('src.bot.BotClient', autospec=True)
@mock.patch('discord.ext.commands.Context', autospec=True)
class TestCommandReactionMessageAdd(aiounittest.AsyncTestCase):
    """Test class for the function which is called when command `!reactionmessage add` is recognized.

    This does not test the following things:
        - converters
        - permissions
        - if the command is recognized
        - error handling
    """

    async def test_command_reactionmessage_remove_removes_ReactionMessage_to_bot_instance(self, ctx, bot, message, role,
                                                                                          emoji):
        ctx.bot = bot
        await reactionmessage_remove(ctx, message, role, emoji)
        rm = ReactionMessage(mid=message.id, role=role, emoji=emoji)
        bot.remove_reactionmessage.assert_called_with(rm)

    async def test_command_reactionmessage_remove_replies_with_error_if_ReactionMessage_does_not_exit(self, ctx, bot,
                                                                                                      message, role,
                                                                                                      emoji):
        ctx.bot = bot
        bot.remove_reactionmessage.side_effect = mock.Mock(side_effect=ValueError)
        await reactionmessage_remove(ctx, message, role, emoji)
        rm = ReactionMessage(mid=message.id, role=role, emoji=emoji)
        bot.remove_reactionmessage.assert_called_with(rm)
