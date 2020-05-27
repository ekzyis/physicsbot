from unittest import mock

import aiounittest

# noinspection PyUnresolvedReferences
import test.context
from event.on_raw_reaction_add.reactionmessage_role_assignment import reactionmessage_role_assignment


class TestReactionMessageRoleAssignment(aiounittest.AsyncTestCase):

    @mock.patch('discord.Role', autospec=True)
    @mock.patch('discord.Member', autospec=True)
    @mock.patch('discord.Emoji', autospec=True)
    @mock.patch('discord.RawReactionActionEvent', autospec=True)
    @mock.patch('src.bot.BotClient', autospec=True)
    def setUp(self, bot, reaction, emoji, member, role):
        bot.user.id = '00000'
        reaction.member = member
        reaction.emoji = emoji
        reaction.message_id = '1234'
        self.bot, self.reaction, self.emoji, self.member, self.role = bot, reaction, emoji, member, role

    async def test_on_raw_reaction_add_adds_role_if_reacted_with_valid_emoji_to_reaction_message(self):
        bot, reaction, member, role = self.bot, self.reaction, self.member, self.role
        rm = mock.Mock()
        rm.role = role
        bot.get_reactionmessage.return_value = rm
        await reactionmessage_role_assignment(bot)(reaction)
        member.add_roles.assert_called_once_with(role)

    async def test_on_raw_reaction_add_does_nothing_if_message_is_not_a_reaction_message(self):
        bot, reaction, member = self.bot, self.reaction, self.member
        bot.get_reactionmessage.return_value = None
        await reactionmessage_role_assignment(bot)(reaction)
        member.add_roles.assert_not_called()
