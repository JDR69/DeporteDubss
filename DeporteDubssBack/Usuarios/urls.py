from django.urls import path
from Usuarios.controllers.permisosControllers.controllers import create_permiso

urlpatterns = [
    path('crear-permiso/', create_permiso),
]