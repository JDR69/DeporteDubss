from rest_framework import serializers
from Usuarios.models.permisosModels.models import Permisos

class PermisosSerializers(serializers.ModelSerializer):
    class Meta:
        model = Permisos
        fields = ['id', 'nombre', 'estado']
