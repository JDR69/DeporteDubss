from django.urls import path
from .views import AuthController, LogoutController, UserDetail, UsersList

urlpatterns = [
    path('login/', AuthController.as_view(), name='auth_login'),
    path('logout/', LogoutController.as_view(), name='auth_logout'),
    path('users/', UsersList.as_view(), name='users-list'),
    path('users/<int:pk>/', UserDetail.as_view(), name='user-detail'),
]
