from unittest import mock

import aiounittest
from aiounittest import futurized

# noinspection PyUnresolvedReferences
import test.context
from src.util.member import add_role_to_member


class TestAddRoleToMember(aiounittest.AsyncTestCase):

    @mock.patch('discord.Role')
    @mock.patch('discord.Member')
    @mock.patch('discord.Guild')
    async def test_add_role_to_member_adds_role_to_member_with_given_role_id_as_string(self, guild, member, role):
        member = futurized(member)
        guild.get_role.return_value = role
        member.guild = guild
        member.add_roles = mock.Mock(futurized(None))
        await add_role_to_member(member, '12345')
        member.add_roles.assert_called_once_with(role)

    @mock.patch('discord.Role')
    @mock.patch('discord.Member')
    @mock.patch('discord.Guild')
    async def test_add_role_to_member_adds_role_to_member_with_given_role_id_as_int(self, guild, member, role):
        member = futurized(member)
        guild.get_role.return_value = role
        member.guild = guild
        member.add_roles = mock.Mock(futurized(None))
        await add_role_to_member(member, 12345)
        member.add_roles.assert_called_once_with(role)
