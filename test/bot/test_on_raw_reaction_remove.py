from unittest import mock

import aiounittest
from aiounittest import futurized

# noinspection PyUnresolvedReferences
import test.context
from src.const import WHITE_CHECK_MARK
from src.event.on_raw_reaction_remove import on_raw_reaction_remove


class TestOnRawReactionRemove(aiounittest.AsyncTestCase):

    @mock.patch('discord.Role', autospec=True)
    @mock.patch('discord.Member', autospec=True)
    @mock.patch('discord.Emoji', autospec=True)
    @mock.patch('discord.Guild', autospec=True)
    @mock.patch('discord.RawReactionActionEvent', autospec=True)
    @mock.patch('src.util.lecture.Lecture', autospec=True)
    @mock.patch('src.bot.BotClient', autospec=True)
    def setUp(self, bot, lecture, reaction, guild, emoji, member, role):
        bot.logger = mock.Mock()
        bot.user.id = '00000'
        self.bot = bot
        # when calling lecture.role, we want to get the "role id"
        lecture.role = '1234'
        lecture.embed_title = 'title'  # not needed to test behaviour but to fix unimportant AttributeError during test
        # bot#get_lecture_of_message_id should return the mocked lecture
        self.bot.get_lecture_of_message_id.return_value = lecture
        """member#remove_roles should always be awaitable even though we are not always expecting that this function will
        be called. The reason for this that we don't want to couple our test to tightly with the code; expecting more
        from the SUT (system under test) than we are testing.
        We assert that it was or was not alled but don't want to throw an error during testing just because it
        is not awaitable. The actual reason to fail the test should be that it was or was not called!
        """
        member.remove_roles = mock.Mock(futurized(None))
        # member.guild#get_role should return the mocked role
        member.guild.get_role.return_value = role
        # since in event "REACTION_REMOVE", the member is not added to the reaction, we get the member through the guild
        # See https://discordpy.readthedocs.io/en/latest/api.html#discord.RawReactionActionEvent
        guild.get_member.return_value = member
        # bot#get_guild will be called with the guild id of reaction and should return our mocked guild
        self.bot.get_guild.return_value = guild
        reaction.guild_id = 99999
        # add mock to reaction
        reaction.emoji = emoji
        # add mocks to instance so we can access them in the test cases
        self.reaction = reaction
        self.emoji = emoji
        self.member = member
        self.role = role
        self.lecture = lecture

    async def test_on_raw_reaction_remove_removes_role_when_removed_white_check_mark_reaction_from_lecture_embed(self):
        reaction, emoji, member, role = self.reaction, self.emoji, self.member, self.role
        # user removed reaction WHITE_CHECK_MARK
        emoji.name = WHITE_CHECK_MARK
        # user reacted to message with message id 5678
        reaction.message_id = '5678'
        # it was an actual user which reacted, not our bot
        reaction.user_id = '11111'  # not equal to bot.user.id

        await on_raw_reaction_remove(self.bot)(reaction)

        # assert that we tried to find the lecture via the message id
        self.bot.get_lecture_of_message_id.assert_called_once_with('5678')
        # assert that we got the role from the guild with its id as integer
        member.guild.get_role.assert_called_once_with(1234)
        # assert that we removed the role from the member
        member.remove_roles.assert_called_once_with(role)

    async def test_on_raw_reaction_remove_does_not_remove_role_when_removed_reaction_from_lecture_embed_was_not_white_check_mark(
            self):
        reaction, emoji, member = self.reaction, self.emoji, self.member
        # user removed another reaction
        emoji.name = WHITE_CHECK_MARK + "xx"  # TODO Create another actual emoji unicode character for usage here
        # user reacted to message with message id 5678
        reaction.message_id = '5678'
        # it was an actual user which reacted, not our bot
        reaction.user_id = '1111'  # not equal to bot.user.id

        await on_raw_reaction_remove(self.bot)(reaction)

        # assert that we did not call member#remove_roles
        member.add_roles.assert_not_called()

    async def test_on_raw_reaction_remove_ignores_reaction_from_bot(self):
        reaction, emoji, member = self.reaction, self.emoji, self.member
        # the reaction was from the bot itself
        reaction.user_id = self.bot.user.id
        # assume reaction was WHITE_CHECK_MARK
        emoji.name = WHITE_CHECK_MARK
        # and to message with id 5678
        reaction.message_id = '5678'

        await on_raw_reaction_remove(self.bot)(reaction)

        # assert that none of the following methods were called:
        self.bot.get_lecture_of_message_id.assert_not_called()
        member.guild.get_role.assert_not_called()
        member.add_roles.assert_not_called()
