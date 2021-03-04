from django.urls import path
from .views import main, get_workspace, create_workspace, WorkspaceCreateView, WorkspaceRetrieveView

urlpatterns = [
    path('', main, name='main'),
    path('workspace_test/', WorkspaceCreateView.as_view()),
    path('workspace_test/<uuid:unique_id>/', WorkspaceRetrieveView.as_view()),
    path('workspace/', create_workspace, name='create-workspace'),
    path('workspace/<uuid:unique_id>/', get_workspace, name='get-workspace'),
]
