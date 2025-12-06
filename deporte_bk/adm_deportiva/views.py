from rest_framework import viewsets, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
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


class InscribirEquipoView(APIView):
    """Inscribir un equipo a un campeonato creando entrada en Historial."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        equipo_id = request.data.get('equipo_id')
        
        if not equipo_id:
            return Response({'detail': 'equipo_id es requerido'}, status=400)
        
        try:
            campeonato = Campeonato.objects.get(pk=pk)
            equipo = Equipo.objects.get(pk=equipo_id)
        except Campeonato.DoesNotExist:
            return Response({'detail': 'Campeonato no encontrado'}, status=404)
        except Equipo.DoesNotExist:
            return Response({'detail': 'Equipo no encontrado'}, status=404)
        
        # Verificar si ya está inscrito
        if Historial.objects.filter(IDCampeonato=campeonato, IDEquipo=equipo).exists():
            return Response({'detail': 'El equipo ya está inscrito en este campeonato'}, status=400)
        
        # Crear entrada en historial
        historial = Historial.objects.create(
            IDCampeonato=campeonato,
            IDEquipo=equipo,
            Puntos=0,
            PJ=0, PG=0, PE=0, PP=0,
            GF=0, GC=0, DG=0
        )
        
        return Response({
            'detail': 'Equipo inscrito exitosamente',
            'historial_id': historial.id
        }, status=201)


class CampeonatoDetalleView(APIView):
    """Detalle enriquecido de un campeonato: deporte, categoría, equipos y partidos."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk: int):
        # Obtener campeonato
        try:
            campeonato = Campeonato.objects.select_related('IDUsuario', 'IDDeporte', 'IDDeporte__IDCategoria').get(pk=pk)
        except Campeonato.DoesNotExist:
            return Response({'detail': 'Campeonato no encontrado'}, status=404)

        # Deporte y categoría
        deporte = campeonato.IDDeporte
        categoria = deporte.IDCategoria if deporte else None

        # Equipos inscritos por historial del campeonato
        equipos_historial = Historial.objects.select_related('IDEquipo').filter(IDCampeonato=campeonato)
        equipos = [
            {
                'id': h.IDEquipo.id,
                'Nombre': h.IDEquipo.Nombre,
                'Logo': h.IDEquipo.Logo,
                'Posicion': h.Posicion,
                'Puntos': h.Puntos,
                'PJ': h.PJ,
                'PG': h.PG,
                'PE': h.PE,
                'PP': h.PP,
            }
            for h in equipos_historial
        ]

        # Partidos del campeonato: vía fixtures
        fixtures = list(Fixture.objects.filter(IDCampeonato=campeonato).values('id', 'Numero', 'Fecha'))
        fixture_ids = [f['id'] for f in fixtures]
        partidos_qs = Partido.objects.select_related('IDResultado', 'IDEquipo_Local', 'IDEquipo_Visitante', 'IDInstalacion').filter(IDFixture_id__in=fixture_ids)
        partidos = [
            {
                'id': p.id,
                'FixtureId': p.IDFixture_id,
                'Fecha': next((f['Fecha'] for f in fixtures if f['id'] == p.IDFixture_id), None),
                'Local': p.IDEquipo_Local.Nombre,
                'Visitante': p.IDEquipo_Visitante.Nombre,
                'Instalacion': p.IDInstalacion.Nombre if p.IDInstalacion else None,
                'Resultado': (
                    {'Goles_Local': p.IDResultado.Goles_Local, 'Goles_Visitante': p.IDResultado.Goles_Visitante}
                    if p.IDResultado else None
                )
            }
            for p in partidos_qs
        ]

        data = {
            'id': campeonato.id,
            'Nombre': campeonato.Nombre,
            'Fecha_Inicio': campeonato.Fecha_Inicio,
            'Fecha_Fin': campeonato.Fecha_Fin,
            'Estado': campeonato.Estado,
            'Deporte': {'id': deporte.id, 'Nombre': deporte.Nombre} if deporte else None,
            'Categoria': {'id': categoria.id, 'Nombre': categoria.Nombre} if categoria else None,
            'Equipos': equipos,
            'Fixtures': fixtures,
            'Partidos': partidos,
        }

        return Response(data)

