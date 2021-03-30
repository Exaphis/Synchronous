from rest_framework import serializers

from .models import TusdFile


class TusdFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TusdFile
        fields = ('created_at', 'file_id', 'name')
