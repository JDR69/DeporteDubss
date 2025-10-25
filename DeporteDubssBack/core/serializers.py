from .models import Usuario
from rest_framework import serializers
from .models import Rol, Equipo, Jugador, Campeonato, Historial, Deporte, Categoria, Usuario, Organizador

# Serializer para Usuario
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'registro', 'correo', 'contrasena', 'fecha_nacimiento', 'genero', 'estado', 'rol']
        extra_kwargs = {'contrasena': {'write_only': True}}


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre']

class JugadorSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    apellido = serializers.CharField(source='usuario.apellido', read_only=True)
    registro = serializers.IntegerField(source='usuario.registro', read_only=True)
    class Meta:
        model = Jugador
        fields = ['id', 'nombre', 'apellido', 'registro', 'equipo']

class EquipoSerializer(serializers.ModelSerializer):
    jugadores = serializers.SerializerMethodField()
    class Meta:
        model = Equipo
        fields = ['id', 'nombre', 'logo', 'estado', 'jugadores']

    def get_jugadores(self, obj):
        jugadores = Jugador.objects.filter(equipo=obj)
        return JugadorSerializer(jugadores, many=True).data

class DeporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deporte
        fields = ['id', 'nombre']


class CampeonatoSerializer(serializers.ModelSerializer):
    deporte = DeporteSerializer(read_only=True)
    categoria = CategoriaSerializer(read_only=True)
    deporte_id = serializers.PrimaryKeyRelatedField(queryset=Deporte.objects.all(), source='deporte', write_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all(), source='categoria', write_only=True)
    organizador_id = serializers.PrimaryKeyRelatedField(queryset=Organizador.objects.all(), source='organizador', write_only=True)

    class Meta:
        model = Campeonato
        fields = ['id', 'nombre', 'fecha_inicio', 'fecha_fin', 'logo', 'estado', 'deporte', 'categoria', 'deporte_id', 'categoria_id', 'organizador_id']

class HistorialSerializer(serializers.ModelSerializer):
    equipo = EquipoSerializer(read_only=True)
    campeonato = CampeonatoSerializer(read_only=True)
    class Meta:
        model = Historial
        fields = ['id', 'posicion', 'puntos', 'campeonato', 'equipo']
