from rest_framework import serializers
from deporte_bd.models import (
    Incidencia, Partido, Campeonato, Fixture, Resultado, 
    Historial, Equipo, Organizador, Deporte, Instalacion, Delegado
)


class CampeonatoSerializer(serializers.ModelSerializer):
    """Serializer for Campeonato (championship management)"""
    IDUsuario = serializers.PrimaryKeyRelatedField(queryset=Organizador.objects.all())
    IDDeporte = serializers.PrimaryKeyRelatedField(queryset=Deporte.objects.all())
    
    class Meta:
        model = Campeonato
        fields = ['id', 'IDUsuario', 'IDDeporte', 'Nombre', 'Fecha_Inicio', 'Fecha_Fin', 'Estado']
        read_only_fields = ['id']


class FixtureSerializer(serializers.ModelSerializer):
    """Serializer for Fixture"""
    IDCampeonato = serializers.PrimaryKeyRelatedField(queryset=Campeonato.objects.all())
    
    class Meta:
        model = Fixture
        fields = ['id', 'IDCampeonato']
        read_only_fields = ['id']


class ResultadoSerializer(serializers.ModelSerializer):
    """Serializer for Resultado (match results)"""
    
    class Meta:
        model = Resultado
        fields = ['id', 'Goles_Local', 'Goles_Visitante']
        read_only_fields = ['id']


class PartidoSerializer(serializers.ModelSerializer):
    """Serializer for Partido (matches)"""
    IDFixture = serializers.PrimaryKeyRelatedField(queryset=Fixture.objects.all())
    IDInstalacion = serializers.PrimaryKeyRelatedField(queryset=Instalacion.objects.all())
    IDResultado = serializers.PrimaryKeyRelatedField(queryset=Resultado.objects.all(), required=False, allow_null=True)
    IDEquipo_Local = serializers.PrimaryKeyRelatedField(queryset=Equipo.objects.all())
    IDEquipo_Visitante = serializers.PrimaryKeyRelatedField(queryset=Equipo.objects.all())
    
    class Meta:
        model = Partido
        fields = ['id', 'IDFixture', 'IDInstalacion', 'IDResultado', 'IDEquipo_Local', 'IDEquipo_Visitante']
        read_only_fields = ['id']

    def validate(self, data):
        # Ensure local and visitor teams are different
        if data.get('IDEquipo_Local') == data.get('IDEquipo_Visitante'):
            raise serializers.ValidationError('Los equipos local y visitante deben ser diferentes')
        return data


class HistorialSerializer(serializers.ModelSerializer):
    """Serializer for Historial (championship standings/history)"""
    IDCampeonato = serializers.PrimaryKeyRelatedField(queryset=Campeonato.objects.all())
    IDEquipo = serializers.PrimaryKeyRelatedField(queryset=Equipo.objects.all())
    
    class Meta:
        model = Historial
        fields = ['id', 'IDCampeonato', 'IDEquipo', 'Posicion', 'Puntos']
        read_only_fields = ['id']


class EquipoSerializer(serializers.ModelSerializer):
    """Serializer for Equipo (team registration)"""
    IDUsuario = serializers.PrimaryKeyRelatedField(queryset=Delegado.objects.all())
    
    class Meta:
        model = Equipo
        fields = ['id', 'IDUsuario', 'Nombre', 'Logo', 'Estado']
        read_only_fields = ['id']


class IncidenciaSerializer(serializers.ModelSerializer):
    # Represent IDPartido by its PK for create/update
    IDPartido = serializers.PrimaryKeyRelatedField(queryset=Partido.objects.all())

    class Meta:
        model = Incidencia
        fields = ['id', 'IDPartido', 'Tipo', 'Descripcion', 'Fecha']
        read_only_fields = ['id', 'Fecha']

    def validate_Tipo(self, value):
        # Basic validation: Tipo must be non-negative if provided
        if value is not None and value < 0:
            raise serializers.ValidationError('Tipo must be non-negative')
        return value
