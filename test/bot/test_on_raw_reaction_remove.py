from unittest import mock

import aiounittest

# noinspection PyUnresolvedReferences
import test.context
from src.event.on_raw_reaction_remove import on_raw_reaction_remove


class TestOnRawReactionAdd(aiounittest.AsyncTestCase):

    @mock.patch('discord.Role', autospec=True)
    @mock.patch('discord.Member', autospec=True)
    @mock.patch('discord.Emoji', autospec=True)
    @mock.patch('discord.RawReactionActionEvent', autospec=True)
    @mock.patch('src.bot.BotClient', autospec=True)
    def setUp(self, bot, reaction, emoji, member, role):
        pass

    def test_on_raw_reaction_remove_removes_role_when_removed_white_check_mark_reaction_from_lecture_embed(self):
        pass

    def test_on_raw_reaction_remove_does_not_remove_role_when_removed_reaction_from_lecture_embed_was_not_white_check_mark(self):
        pass

    def test_on_raw_reaction_remove_ignores_reaction_from_bot(self):
        pass
