import datetime
import uuid

from django.db import models
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.utils import timezone

from tusdfileshare.models import TusdFileShare
from . import etherpad_client


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


class WorkspaceTab(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)  # used for ordering
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)

    class Meta:
        ordering = ['created_at']


class WorkspaceApp(models.Model):
    tab = models.ForeignKey(WorkspaceTab, on_delete=models.CASCADE)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    # can't use an abstract class because we need to query all WorkspaceApps
    # of a tab

    def __str__(self):
        return f'WorkspaceApp({self.name}, {self.unique_id})'


class WorkspacePadAppManager(models.Manager):
    def create_pad(self, tab, name):
        """
        Create an Etherpad and return the model with a generated UUID.
        """
        app = self.model(tab=tab, name=name)

        resp = etherpad_client.createPad(
            padID=str(app.unique_id),
            text='Welcome to Synchronous!'
        )

        print('Created new pad, response:')
        print(resp)

        resp = etherpad_client.getReadOnlyID(
            padID=str(app.unique_id),
        )
        read_only_id = resp['readOnlyID']

        print('getReadOnlyID response:')
        print(read_only_id)

        app.pad_id = str(app.unique_id)
        app.read_only_id = read_only_id
        app.save()

        return app


class WorkspacePadApp(WorkspaceApp):
    objects = WorkspacePadAppManager()

    pad_id = models.CharField(max_length=255)
    read_only_id = models.CharField(max_length=255)

    def get_iframe_url(self):
        return f'http://etherpad.synchronous.localhost/p/{self.pad_id}'

    def get_iframe_url_read_only(self):
        return f'http://etherpad.synchronous.localhost/p/{self.read_only_id}'

    def __str__(self):
        return f'Etherpad({self.pad_id})'


@receiver(pre_delete, sender=WorkspacePadApp)
def delete_etherpad(sender, instance, **kwargs):
    print(f'Deleting etherpad {instance}...')
    etherpad_client.deletePad(padID=str(instance.unique_id))
    print('Pad deleted from Etherpad.')


class WorkspaceFileShareApp(WorkspaceApp):
    tusd_file_share = models.ForeignKey(
        TusdFileShare,
        on_delete=models.CASCADE
    )


# catch post-save signal for user to generate its token
@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
