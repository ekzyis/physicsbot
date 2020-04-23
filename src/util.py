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
    async for message in channel.history(limit=100):
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
    desc = """Willkommen im **Rollen-Verteiler**.

    Hier könnt ihr angeben was ihr studiert und Kurse "belegen" \
    in dem ihr auf die Nachrichten unter dieser Nachricht *reagiert*.

    Das ganze dient zur Übersicht und schaltet für die einzelnen Kurse bestimmte Text[- und Sprach]kanäle frei, \
    die ihr jetzt noch nicht sehen könnt.

    Reagieren ist ganz einfach: Klickt einfach auf die grün-weißen Häckchen bei der Rolle, die ihr haben \
    wollt. Dadurch erscheinen neue Textkanäle, in denen du dich mit deinen Kommilitonen austauschen kannst. \
    Dies ist auch reversibel; das heißt ihr könnt hier auch eine Rolle durch einfaches Klicken wieder entfernen, \
    um z.B. über LA oder ANA nicht mehr informiert zu werden bzw. diese Kanäle nicht mehr zu sehen.
    """
    return Embed(
        title="Rollen",
        description=desc
    )
