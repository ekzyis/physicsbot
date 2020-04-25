import unittest
from unittest import mock

# noinspection PyUnresolvedReferences
import test.context
from src.util import create_lecture_embed


class TestCreateLectureEmbed(unittest.TestCase):
    @mock.patch('discord.Role')
    @mock.patch('discord.Guild')
    def test_create_lecture_embed_returns_embed_with_correct_title_and_description(self, guild, role):
        lecture = {'role': '12345', 'embed_title': 'title'}
        role.mention = 'ROLE'
        guild.get_role.return_value = role
        embed = create_lecture_embed(guild, lecture)
        self.assertEqual(embed.title, 'title')
        self.assertIn('ROLE', embed.description)
