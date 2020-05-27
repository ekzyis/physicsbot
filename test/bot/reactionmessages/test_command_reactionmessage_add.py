from unittest import mock

import aiounittest
from aiounittest import futurized

# noinspection PyUnresolvedReferences
import test.context
from command.reactionmessage import reactionmessage_add, ReactionMessage


class TestCommandReactionMessageAdd(aiounittest.AsyncTestCase):
    """Test class for the function which is called when command `!reactionmessage add` is recognized.

    This does not test the following things:
        - converters
        - permissions
        - if the command is recognized
        - error handling
    """

    @mock.patch('src.bot.BotClient', autospec=True)
    @mock.patch('discord.ext.commands.Context')
    def setUp(self, ctx, bot):
        ctx.bot = bot
        ctx.channel.send = mock.Mock(futurized(None))
        self.ctx, self.bot = ctx, bot

    @mock.patch('discord.Emoji', autospec=True)
    @mock.patch('discord.Role', autospec=True)
    @mock.patch('discord.Message', autospec=True)
    async def test_command_reactionmessage_add_adds_ReactionMessage_to_bot_instance(self, message, role,
                                                                                    emoji):
        ctx, bot = self.ctx, self.bot
        await reactionmessage_add(ctx, message, role, emoji)
        rm = ReactionMessage(mid=message.id, rid=role.id, rname=role.name, ename=emoji)
        bot.add_reactionmessage.assert_called_with(rm)

    @mock.patch('discord.Emoji', autospec=True)
    @mock.patch('discord.Role', autospec=True)
    @mock.patch('discord.Message', autospec=True)
    async def test_command_reactionmessage_add_informs_user_if_successful(self, message, role, emoji):
        ctx, bot = self.ctx, self.bot
        ctx.channel.send.return_value = mock.Mock(futurized(None))
        await reactionmessage_add(ctx, message, role, emoji)
        ctx.channel.send.assert_called_once()
