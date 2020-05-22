import unittest

import discord

# noinspection PyUnresolvedReferences
import test.context
from util.embed import create_overview_info_embed


class TestCreateOverviewInfoEmbed(unittest.TestCase):

    def test_create_overview_info_embed_returns_embed(self):
        embed = create_overview_info_embed()
        self.assertIsInstance(embed, discord.Embed)
