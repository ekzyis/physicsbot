from dataclasses import dataclass


@dataclass
class Lecture:
    """Data container class which holds values for lectures."""
    name: str  # name of lecture. For example 'PEP1'
    role: str  # id of role this lecture is associated with
    emoji: str  # id of emoji this lecture is associated with
    embed_title: str  # title of the embed to which users can react to get the role for this lecture
    channel: str  # id of channel this lecture is associated with


def populate_lectures_in_config(config_lectures):
    """This function "populates" the lectures list in the configuration into a list of actual
    Lecture objects with which we can work in a more handy way."""
    return [
        Lecture(l['name'], l['role'], l['emoji'], l['embed_title'], l['channel'])
        for l in config_lectures
    ]
