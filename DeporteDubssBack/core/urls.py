from django.urls import path, include
from rest_framework import routers
from .views import RolViewSet

router = routers.DefaultRouter()
router.register(r'roles', RolViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
