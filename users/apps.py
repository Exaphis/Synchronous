from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = 'users'

    def ready(self):
        from .models import WorkspaceUser

        # delete all workspace users on server start (nobody's connected yet!)
        # must occur because if django stops accidentally, users will not be deleted
        # from the database.
        WorkspaceUser.objects.all().delete()
