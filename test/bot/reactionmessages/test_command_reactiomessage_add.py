from unittest import mock

import aiounittest

# noinspection PyUnresolvedReferences
import test.context
from command.reactionmessage import reactionmessage_add, ReactionMessage


class TestCommandReactionMessageAdd(aiounittest.AsyncTestCase):
    """Test class for the function which is called by the discord API when a command is recognized.

    This does not test the following things:
        - converters
        - permissions
        - if the command is recognized
        - error handling
    """

    @mock.patch('discord.Emoji', autospec=True)
    @mock.patch('discord.Role', autospec=True)
    @mock.patch('discord.Message', autospec=True)
    @mock.patch('src.bot.BotClient', autospec=True)
    @mock.patch('discord.ext.commands.Context', autospec=True)
    async def test_command_reactionmessage_add_adds_ReactionMessage_to_bot_instance(self, ctx, bot, message, role,
                                                                                    emoji):
        ctx.bot = bot
        await reactionmessage_add(ctx, message, role, emoji)
        rm = ReactionMessage(mid=message.id, role=role, emoji=emoji)
        bot.add_reactionmessage.assert_called_with(rm)
