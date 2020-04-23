from discord import Embed


async def add_role_to_member(member, role_id):
    """Adds the role given by its id to the member.
    The role id must be from a role of the guild of the member (if that's not obvious)"""
    role = member.guild.get_role(int(role_id))
    await member.add_roles(role)


async def remove_role_from_member(member, role_id):
    """Removes the role given by its id from the member.
    The role id must be from a role of the guild of the member (if that's not obvious)"""
    role = member.guild.get_role(int(role_id))
    await member.remove_roles(role)


async def get_embed_with_title(channel, embed_title):
    """Returns the message in the given channel which has an embed with the given title if it exists else None"""
    async for message in channel.history(limit=20):
        for embed in message.embeds:
            if embed.title == embed_title:
                return message
    return None


def create_lecture_embed(lecture):
    """Creates the embed for the given lecture."""
    return Embed(
        title=lecture['embed_title']
    )


def create_overview_info_embed():
    """Creates the info embed in the overview channel."""
    return Embed(
        title="Rollen"
    )
