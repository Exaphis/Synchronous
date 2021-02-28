import uuid

from django.db import models


class Workspace(models.Model):
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
