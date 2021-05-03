# https://realpython.com/asynchronous-tasks-with-django-and-celery/
from .celery import app as celery_app  # start celery

_all__ = ["celery_app"]
