from rest_framework.permissions import BasePermission
from deporte_bd.models import Usuario


class IsAdminOrOrganizer(BasePermission):
    """Permiso que permite acceso solo si el usuario autenticado tiene rol 1 o 2."""

    def has_permission(self, request, view):
        # Si la autenticación ya pobló request.user, úsalo directamente
        user = getattr(request, 'user', None)
        if user is None:
            return False
        # Aseguramos que sea una instancia del modelo Usuario (tiene atributo IDRol_id)
        rol_id = getattr(user, 'IDRol_id', None)
        if rol_id is None:
            return False
        return rol_id in (1, 2)
