from rest_framework import serializers
from deporte_bd.models import (
    Incidencia, Partido, Campeonato, Fixture, Resultado, 
    Historial, Equipo, Organizador, Deporte, Instalacion, Delegado
)


class CampeonatoSerializer(serializers.ModelSerializer):
    """Serializer for Campeonato (championship management)"""
    IDCampeonato = serializers.IntegerField(source='id', read_only=True)
    IDUsuario = serializers.PrimaryKeyRelatedField(queryset=Organizador.objects.all())
    IDDeporte = serializers.PrimaryKeyRelatedField(queryset=Deporte.objects.all())
    
    class Meta:
        model = Campeonato
        fields = ['id', 'IDCampeonato', 'IDUsuario', 'IDDeporte', 'Nombre', 'Fecha_Inicio', 'Fecha_Fin', 'Estado']
        read_only_fields = ['id', 'IDCampeonato']


class FixtureSerializer(serializers.ModelSerializer):
    """Serializer for Fixture"""
    IDFixture = serializers.IntegerField(source='id', read_only=True)
    IDCampeonato = serializers.PrimaryKeyRelatedField(queryset=Campeonato.objects.all())
    
    class Meta:
        model = Fixture
        fields = ['id', 'IDFixture', 'IDCampeonato']
        read_only_fields = ['id', 'IDFixture']


class ResultadoSerializer(serializers.ModelSerializer):
    """Serializer for Resultado (match results)"""
    IDResultado = serializers.IntegerField(source='id', read_only=True)
    
    class Meta:
        model = Resultado
        fields = ['id', 'IDResultado', 'Goles_Local', 'Goles_Visitante']
        read_only_fields = ['id', 'IDResultado']


class PartidoSerializer(serializers.ModelSerializer):
    """Serializer for Partido (matches)"""
    IDPartido = serializers.IntegerField(source='id', read_only=True)
    IDFixture = serializers.PrimaryKeyRelatedField(queryset=Fixture.objects.all())
    IDInstalacion = serializers.PrimaryKeyRelatedField(queryset=Instalacion.objects.all())
    IDResultado = serializers.PrimaryKeyRelatedField(queryset=Resultado.objects.all(), required=False, allow_null=True)
    IDEquipo_Local = serializers.PrimaryKeyRelatedField(queryset=Equipo.objects.all())
    IDEquipo_Visitante = serializers.PrimaryKeyRelatedField(queryset=Equipo.objects.all())
    
    class Meta:
        model = Partido
        fields = ['id', 'IDPartido', 'IDFixture', 'IDInstalacion', 'IDResultado', 'IDEquipo_Local', 'IDEquipo_Visitante']
        read_only_fields = ['id', 'IDPartido']

    def validate(self, data):
        # Ensure local and visitor teams are different
        if data.get('IDEquipo_Local') == data.get('IDEquipo_Visitante'):
            raise serializers.ValidationError('Los equipos local y visitante deben ser diferentes')
        return data


class HistorialSerializer(serializers.ModelSerializer):
    """Serializer for Historial (championship standings/history)"""
    IDHistorial = serializers.IntegerField(source='id', read_only=True)
    IDCampeonato = serializers.PrimaryKeyRelatedField(queryset=Campeonato.objects.all())
    IDEquipo = serializers.PrimaryKeyRelatedField(queryset=Equipo.objects.all())
    
    class Meta:
        model = Historial
        fields = ['id', 'IDHistorial', 'IDCampeonato', 'IDEquipo', 'Posicion', 'Puntos']
        read_only_fields = ['id', 'IDHistorial']


class EquipoSerializer(serializers.ModelSerializer):
    """Serializer for Equipo (team registration)"""
    IDEquipo = serializers.IntegerField(source='id', read_only=True)
    IDUsuario = serializers.PrimaryKeyRelatedField(queryset=Delegado.objects.all())
    
    class Meta:
        model = Equipo
        fields = ['id', 'IDEquipo', 'IDUsuario', 'Nombre', 'Logo', 'Estado']
        read_only_fields = ['id', 'IDEquipo']


class IncidenciaSerializer(serializers.ModelSerializer):
    # Represent IDPartido by its PK for create/update
    IDIncidencia = serializers.IntegerField(source='id', read_only=True)
    IDPartido = serializers.PrimaryKeyRelatedField(queryset=Partido.objects.all())

    class Meta:
        model = Incidencia
        fields = ['id', 'IDIncidencia', 'IDPartido', 'Tipo', 'Descripcion', 'Fecha']
        read_only_fields = ['id', 'IDIncidencia', 'Fecha']

    def validate_Tipo(self, value):
        # Basic validation: Tipo must be non-negative if provided
        if value is not None and value < 0:
            raise serializers.ValidationError('Tipo must be non-negative')
        return value
