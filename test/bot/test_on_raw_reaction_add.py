from unittest import mock

import aiounittest
from aiounittest import futurized

# noinspection PyUnresolvedReferences
import test.context
from src.const import WHITE_CHECK_MARK
from src.event.on_raw_reaction_add import on_raw_reaction_add


class TestOnRawReactionAdd(aiounittest.AsyncTestCase):

    @classmethod
    @mock.patch('src.bot.BotClient')
    def setUpClass(cls, bot):
        bot.user.id = '00000'
        cls.bot = bot

    @mock.patch('discord.Role')
    @mock.patch('discord.Member')
    @mock.patch('discord.Emoji')
    @mock.patch('discord.RawReactionActionEvent')
    async def test_on_raw_reaction_add_adds_role_when_reacted_with_white_check_mark_on_lecture_embed(
            self, reaction, emoji, member, role
    ):
        lecture_mock = mock.MagicMock()
        lecture_mock.__getitem__.return_value = '1234'
        self.bot.get_lecture_of_message_id.return_value = lecture_mock
        member.add_roles = mock.Mock(futurized(None))
        member.guild.get_role.return_value = role
        emoji.name = WHITE_CHECK_MARK
        reaction.member = member
        reaction.emoji = emoji
        reaction.message_id = '5678'
        reaction.user_id = '11111'  # not equal to bot.user.id
        await on_raw_reaction_add(self.bot)(reaction)
        # assert that we tried to find the lecture via the message id
        self.bot.get_lecture_of_message_id.assert_called_once_with('5678')
        # assert that we accessed the role in the found lecture
        lecture_mock.__getitem__.assert_called_with('role')
        # assert that we got the role from the guild with its id as integer
        member.guild.get_role.assert_called_once_with(1234)
        # assert that we added the role to the member
        member.add_roles.assert_called_once_with(role)
