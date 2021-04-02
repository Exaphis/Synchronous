from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
import requests


class TusdFileShare(models.Model):
    # one file share per workspace
    workspace = models.OneToOneField(
        'workspaces.Workspace',  # avoids circular import error
        on_delete=models.CASCADE
    )


class TusdFile(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    file_share = models.ForeignKey(TusdFileShare, on_delete=models.CASCADE)
    file_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'TusdFile(name={self.name}, id={self.file_id})'

    def get_docker_tusd_url(self):
        return f'http://tusd:1080/files/{self.file_id}'


@receiver(pre_delete, sender=TusdFile)
def delete_tusd_file(sender, instance, **kwargs):
    print(f'Deleting tusd file {instance} from server...')
    resp = requests.delete(
        instance.get_docker_tusd_url(),
        headers={'Tus-Resumable': '1.0.0'}
    )
    print(resp.text)
