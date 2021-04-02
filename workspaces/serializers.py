from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

from .models import Workspace, WorkspaceTab, WorkspaceApp, WorkspacePadApp, WorkspaceFileShareApp


class WorkspaceSerializer(serializers.ModelSerializer):
    # separate field for password for workspace user password
    password = serializers.CharField(
        label=_("Password"),
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True,
        allow_blank=True
    )
    nickname = serializers.CharField(allow_blank=True)
    expiration_date = serializers.DateTimeField(read_only=True)
    user_list_ws = serializers.ReadOnlyField(source='get_user_list_endpoint')
    is_password_protected = serializers.BooleanField(read_only=True)

    class Meta:
        model = Workspace
        fields = ('id', 'unique_id', 'nickname', 'created_at', 'anonymous_readable',
                  'password', 'expiration_date', 'user_list_ws', 'is_password_protected')

    def create(self, validated_data):
        # override default create method to use custom workspace manager create
        workspace = Workspace.objects.create_workspace(**validated_data)
        return workspace


class WorkspacePasswordChangeSerializer(serializers.Serializer):
    model = Workspace
    password = serializers.CharField(required=True, allow_blank=True, max_length=150)

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass


class WorkspaceTabSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceTab
        fields = ['unique_id', 'name']


class WorkspaceAppSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceApp
        fields = ['unique_id', 'name']


class WorkspacePadAppSerializer(WorkspaceAppSerializer, serializers.ModelSerializer):
    class Meta:
        model = WorkspacePadApp
        fields = WorkspaceAppSerializer.Meta.fields + ['iframe_url']


class WorkspaceFileShareAppSerializer(WorkspaceAppSerializer, serializers.ModelSerializer):
    class Meta:
        model = WorkspaceFileShareApp
        fields = WorkspaceAppSerializer.Meta.fields
