import unittest

from . import SpacedeckClient


class TestApi(unittest.TestCase):
    def test_create_delete(self):
        sc = SpacedeckClient()
        space = sc.create_space()

        self.assertTrue(space.access_mode == 'public')
        self.assertTrue(sc.delete_space(space._id))
