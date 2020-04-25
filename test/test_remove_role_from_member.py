from unittest import mock

import aiounittest
from aiounittest import futurized

# noinspection PyUnresolvedReferences
import test.context
from src.util import remove_role_from_member


class TestRemoveRoleFromMember(aiounittest.AsyncTestCase):

    @mock.patch('discord.Role')
    @mock.patch('discord.Member')
    @mock.patch('discord.Guild')
    async def test_remove_role_from_member_removes_role_from_member_with_given_role_id_as_string(self, guild, member, role):
        member = futurized(member)
        guild.get_role.return_value = role
        member.guild = guild
        member.remove_roles = mock.Mock(futurized(None))
        await remove_role_from_member(member, '12345')
        member.remove_roles.assert_called_once_with(role)

    @mock.patch('discord.Role')
    @mock.patch('discord.Member')
    @mock.patch('discord.Guild')
    async def test_remove_role_from_member_removes_role_from_member_with_given_role_id_as_int(self, guild, member, role):
        member = futurized(member)
        guild.get_role.return_value = role
        member.guild = guild
        member.remove_roles = mock.Mock(futurized(None))
        await remove_role_from_member(member, 12345)
        member.remove_roles.assert_called_once_with(role)
