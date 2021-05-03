"""
ASGI config for synchronous project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "synchronous.settings")

http_app = get_asgi_application()

# import after get_asgi_application to prevent "Apps aren't loaded yet"
# https://stackoverflow.com/a/64973001
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import workspaces.routing

application = ProtocolTypeRouter(
    {
        "http": http_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(workspaces.routing.websocket_urlpatterns)
        ),
    }
)
