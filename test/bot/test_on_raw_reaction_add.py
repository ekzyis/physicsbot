from unittest import mock

import aiounittest
from aiounittest import futurized

# noinspection PyUnresolvedReferences
import test.context
from src.bot import BotClient
from src.const import WHITE_CHECK_MARK
from src.event.on_raw_reaction_add import on_raw_reaction_add


class TestOnRawReactionAdd(aiounittest.AsyncTestCase):

    @classmethod
    @mock.patch('discord.Client')
    def setUpClass(cls, client):
        """
        According to https://stackoverflow.com/a/39307310, this does not work because when importing,
        the definition of BotClient including the inheritance is executed.
        """
        user = mock.Mock()
        user.id = '00000'
        client.user = user
        """Using the import here didn't work either. Don't know why."""
        # from src.bot import BotClient
        cls.bot = BotClient()

    @mock.patch('discord.Member')
    @mock.patch('discord.Emoji')
    @mock.patch('discord.RawReactionActionEvent')
    async def test_on_raw_reaction_add_adds_role_when_reacted_with_white_check_mark_on_lecture_embed(
            self, reaction, emoji, member
    ):
        """
        Fails with
            AttributeError: 'NoneType' object has no attribute 'id'
        because the bot is not logged in thus there is no user.
        See https://discordpy.readthedocs.io/en/latest/api.html#discord.Client.user
        """
        self.bot.lecture_message_tuples = [({'role': '1234'}, '5678')]
        member.add_roles = mock.Mock(futurized(None))
        emoji.name = WHITE_CHECK_MARK
        reaction.member = member
        reaction.emoji = emoji
        reaction.message_id = '5678'
        await on_raw_reaction_add(self.bot)(reaction)
        member.add_roles.assert_called_once()
