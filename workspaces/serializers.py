from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

from .models import Workspace


class WorkspaceSerializer(serializers.ModelSerializer):
    # separate field for password for workspace user password
    password = serializers.CharField(
        label=_("Password"),
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )

    class Meta:
        model = Workspace
        fields = ('id', 'unique_id', 'nickname', 'created_at', 'anonymous_readable', 'password')

    def create(self, validated_data):
        # override default create method to use custom workspace manager create
        workspace = Workspace.objects.create_workspace(**validated_data)
        return workspace
