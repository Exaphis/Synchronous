from django.apps import AppConfig
from django.db.utils import OperationalError


class UsersConfig(AppConfig):
    name = 'users'

    def ready(self):
        from .models import WorkspaceUser

        # delete all workspace users on server start (nobody's connected yet!)
        # must occur because if django stops accidentally, users will not be deleted
        # from the database.
        try:
            WorkspaceUser.objects.all().delete()
        except OperationalError:  # errors if migrating from empty database, ignore
            pass
