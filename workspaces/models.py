import uuid

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from rest_framework.authtoken.models import Token


class WorkspaceManager(models.Manager):
    def create_workspace(self, nickname, password, anonymous_readable):
        """
        Creates and returns workspace with the given attributes.

        If the given password is blank, then a password is not required for editing.
        """
        workspace = self.model(nickname=nickname, anonymous_readable=anonymous_readable)
        workspace.save()

        if password:
            workspace.user = User.objects.create_user(workspace.unique_id, password=password)
            workspace.save()

        return workspace


# TODO: use validator to ensure nickname does not overlap with any unique ids
class Workspace(models.Model):
    objects = WorkspaceManager()

    unique_id = models.UUIDField(default=uuid.uuid4, editable=False)
    nickname = models.CharField(max_length=150, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    anonymous_readable = models.BooleanField(default=False)  # only matters if user is not None

    # user field for workspace authentication in order to use default Django auth methods
    user = models.OneToOneField(User, null=True, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.unique_id)


# catch post-save signal for user to generate its token
@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
