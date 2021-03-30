from django.db import models
from workspaces.models import Workspace


class TusdFileShare(models.Model):
    workspace = models.OneToOneField(Workspace, on_delete=models.CASCADE)


class TusdFile(models.Model):
    # TODO: delete files when deleted
    created_at = models.DateTimeField(auto_now_add=True)
    file_share = models.ForeignKey(TusdFileShare, on_delete=models.CASCADE)
    file_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)

    def __str__(self):
        return f'TusdFile(name={self.name}, id={self.file_id}'
