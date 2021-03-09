from celery.schedules import crontab
from celery.task import periodic_task
from django.utils import timezone
from django.core.mail import EmailMessage

@periodic_task(run_every=crontab(minute='*/5'))
def delete_old_workspace():
    # Query all the workspace in our database
    workspaces = workspace.objects.all()

    # Iterate through them
    for w in workspaces:

        # If the expiration date is bigger than now delete it
        if w.expiration_date < timezone.now():
            w.delete()
            # log deletion
    
        email = EmailMessage(
        'Workspace ' + w.unique_id + 'was deleted',
        'Your 24 hours for your workspace were up! hope you saved your progress :)',
        'synchronous307@gmail.com',
        ['sakshamj23@gmail.com'],
        reply_to=['synchronous307@gmail.com'],
        headers={'Message-ID': 'Synchronous'},
)

    return "completed deleting workspaces at {}".format(timezone.now())