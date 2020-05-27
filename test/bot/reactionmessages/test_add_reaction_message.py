import unittest
from unittest import mock

# noinspection PyUnresolvedReferences
import test.context


class TestAddReactionMessage(unittest.TestCase):

    @mock.patch('discord.Emoji', autospec=True)
    @mock.patch('discord.Role', autospec=True)
    @mock.patch('discord.Message', autospec=True)
    @mock.patch('src.bot.BotClient', autospec=True)
    def test_sending_command_message_adds_reaction_message_handler(self, bot, message, role, emoji):
        pass
