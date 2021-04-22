import io
import datetime
import uuid
from tempfile import NamedTemporaryFile

import requests
from django.db import models
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.utils import timezone

from tusdfileshare.models import TusdFileShare
from .api_types import AppType
from . import etherpad_client
from spacedeck_client import SpacedeckClient


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

    def get_ws_endpoint(self):
        return f'ws/{self.unique_id}/'

    def is_password_protected(self):
        return self.user is not None


class WorkspaceTab(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)  # used for ordering
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)

    class Meta:
        ordering = ['created_at']


def iter_specific_apps(app_iterable):
    for app in app_iterable:
        if hasattr(app, 'workspacepadapp'):
            yield app.workspacepadapp
        elif hasattr(app, 'workspacefileshareapp'):
            yield app.workspacefileshareapp
        elif hasattr(app, 'workspacewhiteboardapp'):
            yield app.workspacewhiteboardapp
        else:
            yield app


def get_type_from_app(app):
    if isinstance(app, WorkspacePadApp):
        return AppType.PAD
    elif isinstance(app, WorkspaceFileShareApp):
        return AppType.FILE_SHARE
    elif isinstance(app, WorkspaceWhiteboardApp):
        return AppType.WHITEBOARD
    return AppType.TEMPLATE


class WorkspaceApp(models.Model):
    tab = models.ForeignKey(WorkspaceTab, on_delete=models.CASCADE)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    # can't use an abstract class because we need to query all WorkspaceApps
    # of a tab

    def __str__(self):
        return f'WorkspaceApp({self.name}, {self.unique_id})'

    def download_data(self):
        """
        Download an importable version of the app, whose contents can be passed to import_data().
        Return the file path to the downloaded data.
        """
        return None

    def import_data(self, data: bytes):
        """
        Set the content of the given app using the bytes given.
        Returns whether or not the import succeeded.
        """
        pass


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

    def download_data(self):
        with NamedTemporaryFile(delete=False) as out_file:
            resp = requests.get(f'http://etherpad:9001/p/{self.pad_id}/export/etherpad')
            out_file.write(resp.content)
            return out_file.name

    def import_data(self, data: bytes):
        print('importing pad...')
        file_stream = io.BytesIO(data)
        file_stream.name = 'stream.etherpad'  # must add .etherpad so it recognizes format
        resp = requests.post(
            f'http://etherpad:9001/p/{self.pad_id}/import',
            files={'file': file_stream}
        )
        print(resp.text)
        return resp.ok

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


class WorkspaceWhiteboardAppManager(models.Manager):
    def create_whiteboard(self, tab, name):
        """
        Create an space in Spacedeck and return the model.
        """
        app = self.model(tab=tab, name=name)
        print('Creating Spacedeck space...')

        # SpacedeckClient is a singleton, so not much overhead
        spacedeck = SpacedeckClient()
        app.space_id = str(app.unique_id)
        space = spacedeck.create_space(app.space_id)
        app.edit_hash = space.edit_hash
        print(space)
        print('Space created.')
        app.save()

        return app


class WorkspaceWhiteboardApp(WorkspaceApp):
    objects = WorkspaceWhiteboardAppManager()

    space_id = models.CharField(max_length=255)
    edit_hash = models.CharField(max_length=255)

    def get_iframe_url(self):
        return f'http://spacedeck.synchronous.localhost/spaces/{self.space_id}?spaceAuth={self.edit_hash}'

    def get_iframe_url_read_only(self):
        return f'http://spacedeck.synchronous.localhost/spaces/{self.space_id}'

    def download_data(self):
        client = SpacedeckClient()
        artifacts = client.get_artifacts(self.space_id)

        with NamedTemporaryFile(delete=False) as out_file:
            out_file.write(artifacts.encode('utf-8'))
            return out_file.name

    def import_data(self, data: bytes):
        client = SpacedeckClient()
        return client.set_artifacts(self.unique_id, data)

    def __str__(self):
        return f'Whiteboard({self.space_id})'


@receiver(pre_delete, sender=WorkspaceWhiteboardApp)
def delete_etherpad(sender, instance, **kwargs):
    spacedeck = SpacedeckClient()
    print(f'Deleting space {instance}...')
    spacedeck.delete_space(str(instance.unique_id))
    print('Space deleted from Spacedeck.')


# catch post-save signal for user to generate its token
@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
