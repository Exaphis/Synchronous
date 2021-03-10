from rest_framework import serializers

from .models import WorkspaceUser


class WorkspaceUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceUser
        fields = ('nickname', 'color')  # ignore foreign key
