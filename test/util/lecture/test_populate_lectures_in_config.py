import unittest

from src.util.lecture import populate_lectures_in_config, Lecture


class TestPopulateLecturesInConfig(unittest.TestCase):

    def test_populate_lectures_in_config_with_all_keys_set(self):
        config_lectures = [
            {'name': 'NAME', 'role': '1234', 'emoji': '5678', 'embed_title': 'title', 'channel': 'channel_name'}
        ]
        lectures = populate_lectures_in_config(config_lectures)
        self.assertEqual(len(lectures), 1)
        lecture = lectures[0]
        self.assertIsInstance(lecture, Lecture)
        self.assertEqual(lecture.name, 'NAME')
        self.assertEqual(lecture.role, '1234')
        self.assertEqual(lecture.emoji, '5678')
        self.assertEqual(lecture.embed_title, 'title')
        self.assertEqual(lecture.channel, 'channel_name')

    def test_populate_lectures_in_config_with_only_mandatory_keys_set(self):
        config_lectures = [
            {'name': 'NAME', 'role': '1234', 'embed_title': 'title'}
        ]
        lectures = populate_lectures_in_config(config_lectures)
        self.assertEqual(len(lectures), 1)
        lecture = lectures[0]
        self.assertIsInstance(lecture, Lecture)
        self.assertEqual(lecture.name, 'NAME')
        self.assertEqual(lecture.role, '1234')
        self.assertEqual(lecture.emoji, None)
        self.assertEqual(lecture.embed_title, 'title')
        self.assertEqual(lecture.channel, None)

    def test_populate_lectures_in_config_raises_key_error_when_mandatory_key_not_set(self):
        with self.assertRaises(KeyError):
            populate_lectures_in_config([{'role': '1234', 'embed_title': 'title'}])
        with self.assertRaises(KeyError):
            populate_lectures_in_config([{'name': 'NAME', 'embed_title': 'title'}])
        with self.assertRaises(KeyError):
            populate_lectures_in_config([{'name': 'NAME', 'role': '1234'}])
