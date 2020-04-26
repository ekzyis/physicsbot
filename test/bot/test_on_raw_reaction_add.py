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

    @mock.patch('discord.Member')
    @mock.patch('discord.Emoji')
    @mock.patch('discord.RawReactionActionEvent')
    async def test_on_raw_reaction_add_adds_role_when_reacted_with_white_check_mark_on_lecture_embed(
            self, reaction, emoji, member
    ):
        self.bot.lecture_message_tuples = [({'role': '1234'}, '5678')]
        member.add_roles = mock.Mock(futurized(None))
        emoji.name = WHITE_CHECK_MARK
        reaction.member = member
        reaction.emoji = emoji
        reaction.message_id = '5678'
        reaction.user_id = '11111'  # not equal to bot.user.id
        await on_raw_reaction_add(self.bot)(reaction)
        member.add_roles.assert_called_once()
