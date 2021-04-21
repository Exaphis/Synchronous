from django.urls import path
from . import views

urlpatterns = [
    path('workspace/', views.WorkspaceCreateView.as_view()),
    path('workspace/<uuid:unique_id>/', views.WorkspaceDetailView.as_view()),
    path('workspace/<uuid:unique_id>/password/', views.ChangePasswordView.as_view()),
    path('workspace/nickname/', views.nickname_to_unique_id),
    path('api-token-auth/', views.CustomAuthToken.as_view()),
    path('send-mail/', views.send_message),
    path('heartbeat/', views.heartbeat)
]

# POST api-token-auth with unique_id and password data to get token
# GET workspace with header 'Authorization: Token xxxx' to get workspace data
