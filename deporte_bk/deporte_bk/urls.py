"""
URL configuration for deporte_bk project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from usuarios.views import RolesList

urlpatterns = [
    path('admin/', admin.site.urls),
    # JWT auth endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Usuarios app auth endpoints
    path('api/auth/', include('usuarios.urls')),
    # adm_recursos app API (moved from deporte_bd)
    path('api/recursos/', include('adm_recursos.urls')),
    # adm_deportiva app API (incidencias CRUD)
    path('api/adm_deportiva/', include('adm_deportiva.urls')),
    # OpenAPI / Swagger
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # Roles list
    path('api/roles/', RolesList.as_view(), name='roles-list'),
    # Reportes / Admin dashboard
    path('api/reportes/', include('reportes.urls')),
]
