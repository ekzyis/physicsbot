import warnings
from unittest import mock

import aiounittest
from aiounittest.mock import AsyncMockIterator

# noinspection PyUnresolvedReferences
import test.context
from src.util import get_embed_with_title

with warnings.catch_warnings():
    """
    NOTE Used to fix deprecation warning about "@coroutine" in aiohttp module:
    venv/lib/python3.8/site-packages/aiohttp/helpers.py:107:
      DeprecationWarning: "@coroutine" decorator is deprecated since Python 3.8, use "async def" instead
    """
    warnings.filterwarnings("ignore", category=DeprecationWarning)
    # noinspection PyUnresolvedReferences
    import aiohttp


class TestGetLectureEmbed(aiounittest.AsyncTestCase):
    @mock.patch('discord.Embed')
    @mock.patch('discord.Message')
    @mock.patch('discord.TextChannel')
    async def test_that_it_returns_message_if_embed_exists_in_channel(self, channel, message, embed):
        embed.title = 'title'
        message.embeds = [embed]
        channel.history.return_value = AsyncMockIterator([message])
        found_message = await get_embed_with_title(channel, 'title')
        self.assertEqual(found_message, message)

    @mock.patch('discord.Message')
    @mock.patch('discord.TextChannel')
    async def test_that_it_returns_None_if_embed_does_not_exist_in_channel_with_messages(self, channel, message):
        message.embeds = []
        channel.history.return_value = AsyncMockIterator([message])
        found_message = await get_embed_with_title(channel, 'title')
        self.assertIsNone(found_message)
