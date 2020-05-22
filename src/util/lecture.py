from collections import defaultdict
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
    Lecture objects with which we can work in a more handy way.
    Following keys are mandatory: 'name', 'role', 'embed_title'
    Following keys are optional: 'emoji', 'channel'"""
    mandatory_members = ['name', 'role', 'embed_title']

    def create_lecture_default_dict(lecture):
        class LectureDefaultDict(defaultdict):
            """Implements the mandatory and optional specification of lecture members."""

            def __missing__(self, key):
                if key in mandatory_members:
                    raise KeyError
                return self.default_factory

        return LectureDefaultDict(None, [*lecture.items()])

    return [
        Lecture(l['name'], l['role'], l['emoji'], l['embed_title'], l['channel'])
        for l in map(create_lecture_default_dict, config_lectures)
    ]