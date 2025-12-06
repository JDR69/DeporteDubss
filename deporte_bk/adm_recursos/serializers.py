from rest_framework import serializers
from deporte_bd.models import Categoria, Instalacion, Deporte


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'Nombre']


class InstalacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instalacion
        fields = ['id', 'Nombre', 'Ubicacion', 'Estado']


class DeporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deporte
        fields = ['id', 'IDCategoria', 'Nombre']
