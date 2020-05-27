from unittest import mock

# noinspection PyUnresolvedReferences
import aiounittest

# noinspection PyUnresolvedReferences
import test.context
from command.reactionmessage import add_reactionmessage, ReactionMessage


class TestCommandAddReactionMessage(aiounittest.AsyncTestCase):

    @mock.patch('discord.Emoji', autospec=True)
    @mock.patch('discord.Role', autospec=True)
    @mock.patch('discord.Message', autospec=True)
    @mock.patch('src.bot.BotClient', autospec=True)
    @mock.patch('discord.ext.commands.Context', autospec=True)
    async def test_command_add_reactionmessage_adds_ReactionMessage_to_bot_instance(self, ctx, bot, message, role,
                                                                                    emoji):
        ctx.bot = bot
        await add_reactionmessage(ctx, message, role, emoji)
        rm = ReactionMessage(mid=message.id, role=role, emoji=emoji)
        bot.add_reactionmessage.assert_called_with(rm)
