from typing import Union

import discord


async def add_role_to_member(member: discord.Member, role_id: Union[str, int]) -> None:
    """Adds the role given by its id to the member.
    The role id must be from a role of the guild of the member (if that's not obvious)"""
    role: discord.Role = member.guild.get_role(int(role_id))
    await member.add_roles(role)


async def remove_role_from_member(member: discord.Member, role_id: Union[str, int]) -> None:
    """Removes the role given by its id from the member.
    The role id must be from a role of the guild of the member (if that's not obvious)"""
    role: discord.Role = member.guild.get_role(int(role_id))
    await member.remove_roles(role)
