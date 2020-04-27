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

    @mock.patch('discord.Role')
    @mock.patch('discord.Member')
    @mock.patch('discord.Emoji')
    @mock.patch('discord.RawReactionActionEvent')
    def setUp(self, reaction, emoji, member, role):
        # setup the lecture mock we will receive when calling bot#get_lecture_of_message_id
        lecture_mock = mock.MagicMock()
        # when calling lecture['role'], we want to get the "role id"
        lecture_mock.__getitem__.return_value = '1234'
        # bot#get_lecture_of_message_id should return the mocked lecture
        self.bot.get_lecture_of_message_id.return_value = lecture_mock
        """member#add_roles should always be awaitable even though we are not always expecting that this function will
        be called. The reason for this that we don't want to couple our test to tightly with the code; expecting more
        from the SUT (system under test) than we are testing.
        We assert that it was or was not alled but don't want to throw an error during testing just because it
        is not awaitable. The actual reason to fail the test should be that it was or was not called!
        """
        member.add_roles = mock.Mock(futurized(None))
        # guild#get_role should return the mocked role
        member.guild.get_role.return_value = role
        # add mocks to reaction
        reaction.member = member
        reaction.emoji = emoji
        # add mocks to instance so we can access them in the test cases
        self.reaction = reaction
        self.emoji = emoji
        self.member = member
        self.role = role
        self.lecture_mock = lecture_mock

    async def test_on_raw_reaction_add_adds_role_when_reacted_with_white_check_mark_on_lecture_embed(self):
        reaction, emoji, member, role, lecture_mock = \
            (self.reaction, self.emoji, self.member, self.role, self.lecture_mock)
        # user reacted with WHITE_CHECK_MARCK
        emoji.name = WHITE_CHECK_MARK
        # user reacted to message with message id 5678
        reaction.message_id = '5678'
        # it was an actual user which reacted, not our bot
        reaction.user_id = '11111'  # not equal to bot.user.id

        await on_raw_reaction_add(self.bot)(reaction)

        # assert that we tried to find the lecture via the message id
        self.bot.get_lecture_of_message_id.assert_called_once_with('5678')
        # assert that we accessed the role in the found lecture
        lecture_mock.__getitem__.assert_called_with('role')
        # assert that we got the role from the guild with its id as integer
        member.guild.get_role.assert_called_once_with(1234)
        # assert that we added the role to the member
        member.add_roles.assert_called_once_with(role)

    async def test_on_raw_reaction_add_does_not_add_role_when_not_reacted_with_white_check_mark_on_lecture_embed(self):
        reaction, emoji, member, role, lecture_mock = \
            (self.reaction, self.emoji, self.member, self.role, self.lecture_mock)
        # user reacted with something else than WHITE_CHECK_MARK
        emoji.name = WHITE_CHECK_MARK + "xx"  # TODO Create another actual emoji unicode character for usage here
        # user reacted to message with message id 5678
        reaction.message_id = '5678'
        # it was an actual user which reacted, not our bot
        reaction.user_id = '11111'  # not equal to bot.user.id

        await on_raw_reaction_add(self.bot)(reaction)

        # assert that we did not call member#add_role
        member.add_roles.assert_not_called()
