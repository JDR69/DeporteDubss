from rest_framework import viewsets, permissions
from deporte_bd.models import Categoria, Instalacion, Deporte
from .serializers import CategoriaSerializer, InstalacionSerializer, DeporteSerializer


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Permite acceso de solo lectura (GET) a usuarios no autenticados,
    pero requiere autenticación para otras operaciones (POST, PUT, DELETE)
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class CategoriaViewSet(viewsets.ModelViewSet):
	"""CRUD for Categoria (adm_recursos)"""
	queryset = Categoria.objects.all()
	serializer_class = CategoriaSerializer
	permission_classes = [IsAuthenticatedOrReadOnly]


class InstalacionViewSet(viewsets.ModelViewSet):
	"""CRUD for Instalacion (adm_recursos)"""
	queryset = Instalacion.objects.all()
	serializer_class = InstalacionSerializer
	permission_classes = [IsAuthenticatedOrReadOnly]


class DeporteViewSet(viewsets.ModelViewSet):
	"""CRUD for Deporte (adm_recursos)"""
	queryset = Deporte.objects.all()
	serializer_class = DeporteSerializer
	permission_classes = [IsAuthenticatedOrReadOnly]
