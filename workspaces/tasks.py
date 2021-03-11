from django.utils import timezone
# from django.core.mail import EmailMessage

from workspaces.inform_using_mail import send_mail_to

from .models import Workspace

from synchronous import celery_app


@celery_app.task(name='delete_old_workspace')
def delete_old_workspace():
    print('deleting workspaces')
    # Query all the workspace in our database
    workspaces = Workspace.objects.all()

    # Iterate through them
    for w in workspaces:
        # If the expiration date is bigger than now delete it
        if w.expiration_date < timezone.now():
            w.delete()
            # log deletion
        elif timezone.now() < w.expiration_date < timezone.now() + timezone.timedelta(hours=1) and \
                not w.emailed_expires:
            # email = EmailMessage(
            # 'Workspace ' + w.unique_id + 'will be deleted in an hour',
            # 'Your 24 hours for your workspace are about to be up! Save your progress! :)',
            # 'synchronous307@gmail.com',
            # ['sakshamj23@gmail.com'],
            # fail_silently=False
            # )
            subject = 'Workspace ' + str(w.unique_id) + 'will be deleted in an hour'
            message = 'The 24 hours for your workspace are about to be up! Save your progress! :)'
            receiver = 'sakshamj23@gmail.com'
            w.emailed_expires = True
            w.save()
            send_mail_to(subject, message, [receiver])

    return "completed deleting workspaces at {}".format(timezone.now())
