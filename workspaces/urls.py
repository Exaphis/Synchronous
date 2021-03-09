from django.urls import path
from . import views

urlpatterns = [
    path('workspace/', views.WorkspaceCreateView.as_view()),
    path('workspace/<uuid:unique_id>/', views.WorkspaceRetrieveView.as_view()),
    path('workspace/<str:nickname>/', views.WorkspaceNicknameRetrieveView.as_view()),
    path('api-token-auth/', views.CustomAuthToken.as_view())
]

# POST api-token-auth with unique_id and password data to get token
# GET workspace with header 'Authorization: Token xxxx' to get workspace data
