from django.test import TestCase
from django.db.utils import IntegrityError

from .models import Workspace


class WorkspaceTestCase(TestCase):
    def setUp(self):
        pass

    def test_nickname_collision(self):
        Workspace.objects.create_workspace(nickname='test')

        with self.assertRaises(IntegrityError):
            Workspace.objects.create_workspace(nickname='test')

    def test_null_nickname_success(self):
        Workspace.objects.create_workspace(nickname='')

        try:
            Workspace.objects.create_workspace(nickname='')
        except IntegrityError:
            self.fail('Empty nickname raised IntegrityError')
