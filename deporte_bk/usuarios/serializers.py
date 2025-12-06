from rest_framework import serializers
from deporte_bd.models import Usuario, Rol


class LoginSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    contrasena = serializers.CharField(write_only=True)


class UsuarioSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    Nombre = serializers.CharField()
    Apellido = serializers.CharField()
    Correo = serializers.EmailField()
    IDRol = serializers.IntegerField()


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    usuario = UsuarioSimpleSerializer()


class RolSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    Nombre = serializers.CharField()


class UsuarioSerializer(serializers.ModelSerializer):
    # Represent IDRol as integer PK
    IDRol = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all())
    # Read-only nested representation of the role
    Rol = RolSerializer(source='IDRol', read_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'IDRol', 'Rol', 'Nombre', 'Apellido', 'Registro', 'Correo', 'Fecha_Nacimiento', 'Genero', 'Estado']
        read_only_fields = ['id']
