from typing import Optional

import discord

from const import WHITE_CHECK_MARK
from util.lecture import Lecture


def create_overview_info_embed() -> discord.Embed:
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
    return discord.Embed(
        title="Rollen",
        description=desc
    )


def create_lecture_embed(guild: discord.Guild, lecture: Lecture) -> discord.Embed:
    """Creates the embed for the given lecture."""
    role: discord.Role = guild.get_role(int(lecture.role))
    desc: str = "{}\n".format(role.mention)
    desc += "Du brauchst unbedingt diese Rolle? Dann gib mir hier ein {}!".format(WHITE_CHECK_MARK)
    return discord.Embed(
        # the embed title must be assigned since that's how we will find it in `get_embed_with_title`
        title=lecture.embed_title,
        description=desc
    )


def embed_in_message_needs_update(message: discord.Message, embed: discord.Embed) -> bool:
    """Check if the embed of the given message needs an update. The given embed is the up-to-date version.
    Comparison is done by checking if the embed title and description do match."""
    if len(message.embeds) == 0:
        return True
    if len(message.embeds) > 1:
        raise RuntimeWarning("Called needs_update with message which contains multiple embeds.")
    old_embed: discord.Embed = message.embeds[0]
    return old_embed.title != embed.title or old_embed.description != embed.description


async def get_embed_with_title(channel: discord.TextChannel, embed_title: str) -> Optional[discord.Message]:
    """Returns the message in the given channel which has an embed with the given title if it exists else None"""
    message: discord.Message
    async for message in channel.history(limit=100):
        embed: discord.Embed
        for embed in message.embeds:
            if embed.title == embed_title:
                return message
    return None
