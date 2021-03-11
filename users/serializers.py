from rest_framework import serializers

from .models import WorkspaceUser


class WorkspaceUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceUser
        fields = ('nickname', 'color', 'active', 'id', 'went_inactive_at')  # ignore foreign key
