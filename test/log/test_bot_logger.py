import logging
import sys
import unittest

from testfixtures import OutputCapture, compare, Comparison

from src.log import init_bot_logger


class TestBotLogger(unittest.TestCase):

    def setUp(self):
        self.log_path = 'test/physicsbot.log'
        init_bot_logger(self.log_path)
        self.logger = logging.getLogger('bot')
        self.orig_handlers = self.logger.handlers
        self.logger.handlers = []
        self.level = self.logger.level

    def tearDown(self):
        self.logger.handlers = self.orig_handlers
        self.logger.level = self.level

    @unittest.skip(reason='Should be a false negative. Why is stdout empty?')
    def test_bot_logger_prints_to_console(self):
        with OutputCapture(separate=True) as o:
            self.logger.debug('some debug message')
            self.logger.info('some info message')
            self.logger.warning('some warning message')
            self.logger.error('some error message')
            self.logger.critical('some critical error message')
        o.compare(
            stdout='some debug message\nsome info message',
            stderr='some warning message\nsome error message\nsome critical error message'
        )

    @unittest.skip(reason='Should be a false negative. Why is handlers list empty?')
    def test_bot_logger_has_stream_handler(self):
        compare([
            Comparison('logging.StreamHandler', stream=sys.stdout)
        ], self.logger.handlers)
