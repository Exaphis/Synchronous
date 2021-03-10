from django.urls import path

from . import consumers

# possible problems with nesting routers when not using re_path
websocket_urlpatterns = [
    path('ws/<uuid:unique_id>/user-list/', consumers.UserListConsumer.as_asgi()),
]
