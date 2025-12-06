from django.urls import path
from .views import (
    IncidenciaViewSet, CampeonatoViewSet, FixtureViewSet,
    ResultadoViewSet, PartidoViewSet, HistorialViewSet, EquipoViewSet
)

# Explicit URL patterns to avoid multiple DRF router registrations which
# can cause "Converter 'drf_format_suffix' is already registered." errors

# Campeonato (Championship Management)
campeonato_list = CampeonatoViewSet.as_view({'get': 'list', 'post': 'create'})
campeonato_detail = CampeonatoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

# Fixture
fixture_list = FixtureViewSet.as_view({'get': 'list', 'post': 'create'})
fixture_detail = FixtureViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

# Resultado (Match Results)
resultado_list = ResultadoViewSet.as_view({'get': 'list', 'post': 'create'})
resultado_detail = ResultadoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

# Partido (Matches)
partido_list = PartidoViewSet.as_view({'get': 'list', 'post': 'create'})
partido_detail = PartidoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

# Historial (Championship Standings)
historial_list = HistorialViewSet.as_view({'get': 'list', 'post': 'create'})
historial_detail = HistorialViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

# Equipo (Team Registration)
equipo_list = EquipoViewSet.as_view({'get': 'list', 'post': 'create'})
equipo_detail = EquipoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

# Incidencia
incidencia_list = IncidenciaViewSet.as_view({'get': 'list', 'post': 'create'})
incidencia_detail = IncidenciaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

urlpatterns = [
    # Gestión de Campeonatos
    path('campeonatos/', campeonato_list, name='campeonato-list'),
    path('campeonatos/<int:pk>/', campeonato_detail, name='campeonato-detail'),
    
    # Fixtures
    path('fixtures/', fixture_list, name='fixture-list'),
    path('fixtures/<int:pk>/', fixture_detail, name='fixture-detail'),
    
    # Resultados
    path('resultados/', resultado_list, name='resultado-list'),
    path('resultados/<int:pk>/', resultado_detail, name='resultado-detail'),
    
    # Partidos
    path('partidos/', partido_list, name='partido-list'),
    path('partidos/<int:pk>/', partido_detail, name='partido-detail'),
    
    # Historial
    path('historial/', historial_list, name='historial-list'),
    path('historial/<int:pk>/', historial_detail, name='historial-detail'),
    
    # Inscripción de Equipos
    path('equipos/', equipo_list, name='equipo-list'),
    path('equipos/<int:pk>/', equipo_detail, name='equipo-detail'),
    
    # Incidencias
    path('incidencias/', incidencia_list, name='incidencia-list'),
    path('incidencias/<int:pk>/', incidencia_detail, name='incidencia-detail'),
]
