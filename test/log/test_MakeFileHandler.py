import os
import unittest

from src.log import MakeFileHandler


def remove_paths(*paths):
    """Remove paths, ignoring if they don't exist."""
    for path in paths:
        try:
            os.remove(path)
        except FileNotFoundError:
            pass


class TestMakeFileHandler(unittest.TestCase):

    def setUp(self):
        self.test_path1 = 'test1/test.log'
        self.test_path2 = 'test1/test2/test.log'
        remove_paths(self.test_path1, self.test_path2)
        self.handler = None

    def test_make_file_handler_creates_path_with_single_directory_if_it_does_not_exist(self):
        test_path = self.test_path1
        self.assertFalse(os.path.exists(test_path))
        self.handler = MakeFileHandler(test_path)
        self.assertTrue(os.path.isfile(test_path))

    def test_make_file_handler_creates_path_with_multiple_directories_if_they_do_not_exist(self):
        test_path = self.test_path2
        self.assertFalse(os.path.exists(test_path))
        self.handler = MakeFileHandler(test_path)
        self.assertTrue(os.path.isfile(test_path))

    def test_make_file_handler_is_instance_of_logging_file_handler(self):
        import logging
        self.handler = MakeFileHandler(self.test_path1)
        self.assertIsInstance(self.handler, logging.FileHandler)

    def tearDown(self):
        remove_paths(self.test_path1, self.test_path2)
        self.handler.close()
        self.handler = None
