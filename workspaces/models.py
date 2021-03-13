import uuid

from django.db import models
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.utils import timezone
import datetime


class WorkspaceManager(models.Manager):
    def create_workspace(self, nickname=None, password=None, anonymous_readable=False):
        """
        Creates and returns workspace with the given attributes.

        If the given password is blank, then a password is not required for editing.
        """
        if not nickname:
            nickname = None

        if not password:
            anonymous_readable = False

        workspace = self.model(nickname=nickname, anonymous_readable=anonymous_readable)
        workspace.expiration_date = timezone.now() + datetime.timedelta(minutes=2)
        workspace.save()

        if password:
            workspace.user = User.objects.create_user(workspace.unique_id, password=password)
            workspace.save()

        return workspace


class Workspace(models.Model):
    objects = WorkspaceManager()

    unique_id = models.UUIDField(default=uuid.uuid4, editable=False)
    nickname = models.CharField(max_length=150, unique=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    anonymous_readable = models.BooleanField(default=False)  # only matters if user is not None
    expiration_date = models.DateTimeField()
    emailed_expires = models.BooleanField(default=False)  # have we emailed the user already
    # user field for workspace authentication in order to use default Django auth methods
    user = models.OneToOneField(User, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return str(self.unique_id)

    def get_user_list_endpoint(self):
        return f'ws/{self.unique_id}/user-list/'

    def is_password_protected(self):
        return self.user is not None


# catch pre-save signal for workspace to ensure anonymous_readable is set to false when
# user is none
# TODO: fix this it breaks things
# @receiver(pre_save, sender=Workspace)
# def workspace_save_hook(sender, instance=None, **kwargs):
#     if instance is not None and instance.user is None:
#         instance.anonymous_readable = False


# catch post-save signal for user to generate its token
@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
