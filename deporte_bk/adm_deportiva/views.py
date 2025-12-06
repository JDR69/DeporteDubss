from rest_framework import viewsets, permissions, filters
from deporte_bd.models import (
    Incidencia, Campeonato, Fixture, Resultado, 
    Partido, Historial, Equipo
)
from .serializers import (
    IncidenciaSerializer, CampeonatoSerializer, FixtureSerializer,
    ResultadoSerializer, PartidoSerializer, HistorialSerializer, EquipoSerializer
)


class CampeonatoViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Campeonato (championship management)"""
    queryset = Campeonato.objects.select_related('IDUsuario', 'IDDeporte').all().order_by('-Fecha_Inicio')
    serializer_class = CampeonatoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['Nombre', 'Estado']


class FixtureViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Fixture"""
    queryset = Fixture.objects.select_related('IDCampeonato').all()
    serializer_class = FixtureSerializer
    permission_classes = [permissions.IsAuthenticated]


class ResultadoViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Resultado (match results)"""
    queryset = Resultado.objects.all()
    serializer_class = ResultadoSerializer
    permission_classes = [permissions.IsAuthenticated]


class PartidoViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Partido (matches)"""
    queryset = Partido.objects.select_related(
        'IDFixture', 'IDInstalacion', 'IDResultado', 
        'IDEquipo_Local', 'IDEquipo_Visitante'
    ).all()
    serializer_class = PartidoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['IDEquipo_Local__Nombre', 'IDEquipo_Visitante__Nombre']


class HistorialViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Historial (championship standings)"""
    queryset = Historial.objects.select_related('IDCampeonato', 'IDEquipo').all().order_by('IDCampeonato', 'Posicion')
    serializer_class = HistorialSerializer
    permission_classes = [permissions.IsAuthenticated]


class EquipoViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Equipo (team registration)"""
    queryset = Equipo.objects.select_related('IDUsuario').all()
    serializer_class = EquipoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['Nombre']


class IncidenciaViewSet(viewsets.ModelViewSet):
	"""CRUD endpoints for Incidencia"""
	queryset = Incidencia.objects.select_related('IDPartido').all().order_by('-Fecha')
	serializer_class = IncidenciaSerializer
	permission_classes = [permissions.IsAuthenticated]
	filter_backends = [filters.SearchFilter]
	search_fields = ['Descripcion']

