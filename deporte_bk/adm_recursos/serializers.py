from rest_framework import serializers
from deporte_bd.models import Categoria, Instalacion, Deporte


class CategoriaSerializer(serializers.ModelSerializer):
    IDCategoria = serializers.IntegerField(source='id', read_only=True)
    
    class Meta:
        model = Categoria
        # Include both id and IDCategoria for compatibility
        fields = ['id', 'IDCategoria', 'Nombre']
        read_only_fields = ['id', 'IDCategoria']


class InstalacionSerializer(serializers.ModelSerializer):
    IDInstalacion = serializers.IntegerField(source='id', read_only=True)
    
    class Meta:
        model = Instalacion
        fields = ['id', 'IDInstalacion', 'Nombre', 'Ubicacion', 'Estado']
        read_only_fields = ['id', 'IDInstalacion']


class DeporteSerializer(serializers.ModelSerializer):
    IDDeporte = serializers.IntegerField(source='id', read_only=True)
    
    class Meta:
        model = Deporte
        fields = ['id', 'IDDeporte', 'IDCategoria', 'Nombre']
        read_only_fields = ['id', 'IDDeporte']
