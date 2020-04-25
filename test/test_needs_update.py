import unittest
from unittest import mock

from src.util import needs_update


class TestNeedsUpdate(unittest.TestCase):
    @mock.patch('discord.Embed')
    @mock.patch('discord.Message')
    def test_needs_update_returns_true_when_message_has_no_embed(self, message, embed):
        message.embeds = []
        self.assertTrue(needs_update(message, embed))

    @mock.patch('discord.Embed')
    @mock.patch('discord.Embed')
    @mock.patch('discord.Message')
    def test_needs_update_returns_true_when_title_of_embed_in_message_does_not_match_title_of_given_embed(
            self, message, old_embed, new_embed
    ):
        old_embed.title = 'old_title'
        old_embed.description = 'description'
        new_embed.title = 'new_title'
        new_embed.description = 'description'
        message.embeds = [old_embed]
        self.assertTrue(needs_update(message, new_embed))

    @mock.patch('discord.Embed')
    @mock.patch('discord.Embed')
    @mock.patch('discord.Message')
    def test_needs_update_returns_true_when_description_of_embed_in_message_does_not_match_description_of_given_embed(
            self, message, old_embed, new_embed
    ):
        old_embed.title = 'title'
        old_embed.description = 'old_description'
        new_embed.title = 'title'
        new_embed.description = 'new_description'
        message.embeds = [old_embed]
        self.assertTrue(needs_update(message, new_embed))

    @mock.patch('discord.Embed')
    @mock.patch('discord.Embed')
    @mock.patch('discord.Message')
    def test_needs_update_returns_false_when_title_and_description_of_embed_in_message_is_equal_to_given_embed(
            self, message, old_embed, new_embed
    ):
        old_embed.title = 'title'
        old_embed.description = 'description'
        new_embed.title = 'title'
        new_embed.description = 'description'
        message.embeds = [old_embed]
        self.assertFalse(needs_update(message, new_embed))

    @mock.patch('discord.Embed')
    @mock.patch('discord.Embed')
    @mock.patch('discord.Message')
    def test_raises_runtime_warning_when_message_contains_more_than_1_embed(self, message, embed1, embed2):
        message.embeds = [embed1, embed2]
        with self.assertRaises(RuntimeWarning):
            needs_update(message, embed1)
