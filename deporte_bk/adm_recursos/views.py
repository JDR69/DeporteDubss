from rest_framework import viewsets, permissions
from deporte_bd.models import Categoria, Instalacion, Deporte
from .serializers import CategoriaSerializer, InstalacionSerializer, DeporteSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
	"""CRUD for Categoria (adm_recursos)"""
	queryset = Categoria.objects.all()
	serializer_class = CategoriaSerializer
	permission_classes = [permissions.IsAuthenticated]


class InstalacionViewSet(viewsets.ModelViewSet):
	"""CRUD for Instalacion (adm_recursos)"""
	queryset = Instalacion.objects.all()
	serializer_class = InstalacionSerializer
	permission_classes = [permissions.IsAuthenticated]


class DeporteViewSet(viewsets.ModelViewSet):
	"""CRUD for Deporte (adm_recursos)"""
	queryset = Deporte.objects.all()
	serializer_class = DeporteSerializer
	permission_classes = [permissions.IsAuthenticated]
