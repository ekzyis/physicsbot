from discord import Embed

from const import WHITE_CHECKMARK


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


async def create_lecture_embed(guild, lecture):
    """Creates the embed for the given lecture."""
    role = guild.get_role(int(lecture['role']))
    desc = "{}\n".format(role.mention)
    desc += "Du brauchst unbedingt diese Rolle? Dann gib mir hier ein {}!".format(WHITE_CHECKMARK)
    return Embed(
        # the embed title must be assigned since that's how we will find it in `get_embed_with_title`
        title=lecture['embed_title'],
        description=desc
    )


async def create_overview_info_embed(guild, lectures):
    """Creates the info embed in the overview channel.
    The guild instance is needed for fetching roles and emojis."""
    # create embed description
    desc = ""
    for lecture in lectures:
        # TODO According to discord.py docs, I should iterate over emojis instead of using `fetch_emoji`
        # I'm doing it anyway because I think only having to do it once on startup is not that big of an issue.
        # https://discordpy.readthedocs.io/en/latest/api.html#discord.Guild.fetch_emoji"""
        emoji = await guild.fetch_emoji(int(lecture['emoji']))
        role = guild.get_role(int(lecture['role']))
        desc += "{}: \t\t{}\n\n".format(role.mention, emoji)
    return Embed(
        title="Rollen",
        description=desc
    )
