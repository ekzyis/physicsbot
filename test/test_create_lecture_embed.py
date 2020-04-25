import unittest
from unittest import mock

# noinspection PyUnresolvedReferences
import test.context
from src.util import create_lecture_embed


class TestCreateLectureEmbed(unittest.TestCase):
    @mock.patch('discord.Guild')
    @mock.patch('discord.Role')
    def test_create_lecture_embed_returns_correct_embed(self, guild, role):
        lecture = {'role': '12345', 'embed_title': 'title'}
        role.mention = 'ROLE'
        guild.get_role.return_value = role
        embed = create_lecture_embed(guild, lecture)
        self.assertEqual(embed.title, 'title')
        self.assertIn('ROLE', embed.description)
