import os

from celery import Celery

import synchronous.settings as settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "synchronous.settings")
app = Celery("synchronous")

app.config_from_object("django.conf:settings")
app.autodiscover_tasks()

# make sure to run `celery -A synchronous worker -B -l info`
# as well as set up rabbitmq (rabbitmq-server)
