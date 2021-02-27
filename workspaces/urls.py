from django.urls import path
from .views import main, get_workspace, create_workspace

urlpatterns = [
    path('', main, name='main'),
    path('workspace/', create_workspace, name='create-workspace'),
    path('workspace/<uuid:unique_id>/', get_workspace, name='get-workspace'),
]
