import unittest
from unittest import mock

import discord

# noinspection PyUnresolvedReferences
import test.context
from util.embed import create_lecture_embed
from util.lecture import Lecture


class TestCreateLectureEmbed(unittest.TestCase):
    @mock.patch('discord.Role')
    @mock.patch('discord.Guild')
    def test_create_lecture_embed_returns_embed_with_correct_title_and_description(self, guild, role):
        lecture = Lecture(name='name', role='12345', emoji='00000', embed_title='title', channel='00000')
        role.mention = 'ROLE'
        guild.get_role.return_value = role
        embed = create_lecture_embed(guild, lecture)
        self.assertEqual(embed.title, 'title')
        self.assertIn('ROLE', embed.description)

    @mock.patch('discord.Role')
    @mock.patch('discord.Guild')
    def test_create_lecture_embed_returns_embed(self, guild, role):
        lecture = Lecture(name='name', role='12345', emoji='00000', embed_title='title', channel='00000')
        role.mention = 'ROLE'
        guild.get_role.return_value = role
        embed = create_lecture_embed(guild, lecture)
        self.assertIsInstance(embed, discord.Embed)