from rest_framework import viewsets, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from datetime import datetime
from django.db.models import Q
        
from deporte_bd.models import (
    Incidencia, Campeonato, Fixture, Resultado, 
    Partido, Historial, Equipo
)
from .serializers import (
    IncidenciaSerializer, CampeonatoSerializer, FixtureSerializer,
    ResultadoSerializer, PartidoSerializer, HistorialSerializer, EquipoSerializer
)


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Permite acceso de solo lectura (GET) a usuarios no autenticados,
    pero requiere autenticación para otras operaciones (POST, PUT, DELETE)
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class CampeonatoViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Campeonato (championship management)"""
    queryset = Campeonato.objects.select_related('IDUsuario', 'IDDeporte').all().order_by('-Fecha_Inicio')
    serializer_class = CampeonatoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['Nombre', 'Estado']


class FixtureViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Fixture"""
    queryset = Fixture.objects.select_related('IDCampeonato').all()
    serializer_class = FixtureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ResultadoViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Resultado (match results)"""
    queryset = Resultado.objects.all()
    serializer_class = ResultadoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class PartidoViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Partido (matches)"""
    queryset = Partido.objects.select_related(
        'IDFixture', 'IDInstalacion', 'IDResultado', 
        'IDEquipo_Local', 'IDEquipo_Visitante'
    ).all()
    serializer_class = PartidoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['IDEquipo_Local__Nombre', 'IDEquipo_Visitante__Nombre']


class HistorialViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Historial (championship standings)"""
    queryset = Historial.objects.select_related('IDCampeonato', 'IDEquipo').all().order_by('IDCampeonato', '-Puntos', '-DG')
    serializer_class = HistorialSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class EquipoViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Equipo (team registration)"""
    queryset = Equipo.objects.select_related('IDUsuario').all()
    serializer_class = EquipoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
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

class fixture_controllers(APIView):
    """Controlador para gestionar los fixtures (jornadas) del sistema."""
    permission_classes = [IsAuthenticatedOrReadOnly]  # Requiere autenticación para modificar.

    def get(self, request):
        """Obtener listado de fixtures con filtros opcionales."""
        # Obtener parámetros de filtrado.
        campeonato_param = request.query_params.get('campeonato', None)
        numero_param = request.query_params.get('numero', None)
        fecha_param = request.query_params.get('fecha', None)
        
        # Inicializar consulta de fixtures.
        fixtures = Fixture.objects.all().select_related('IDCampeonato')
        # Filtrar por campeonato.
        if campeonato_param:
            try:
                campeonato_id = int(campeonato_param)
                fixtures = fixtures.filter(IDCampeonato__id=campeonato_id)
            except ValueError:
                # Buscar por nombre del campeonato
                fixtures = fixtures.filter(IDCampeonato__Nombre__icontains=campeonato_param)

        # Filtrar por número de jornada.
        if numero_param:
            try:
                numero = int(numero_param)
                fixtures = fixtures.filter(Numero=numero)
            except ValueError:
                pass  # Si el formato es inválido, ignorar el filtro.

        # Filtrar por fecha.
        if fecha_param:
            try:
                from datetime import datetime
                fecha_obj = datetime.strptime(fecha_param, '%Y-%m-%d').date()
                fixtures = fixtures.filter(Fecha=fecha_obj)
            except ValueError:
                pass  # Si el formato es inválido, ignorar el filtro.

        # Ordenar por campeonato y número de jornada.
        fixtures = fixtures.order_by('IDCampeonato', 'Numero')

        # Construcción de datos para la respuesta.
        datos = []
        for fixture in fixtures:
            datos.append({
                'id': fixture.id,
                'IDFixture': fixture.id,
                'campeonato': {
                    'id': fixture.IDCampeonato.id,
                    'nombre': fixture.IDCampeonato.Nombre,
                    'estado': fixture.IDCampeonato.Estado,
                    'fecha_inicio': fixture.IDCampeonato.Fecha_Inicio.isoformat() if fixture.IDCampeonato.Fecha_Inicio else None,
                    'fecha_fin': fixture.IDCampeonato.Fecha_Fin.isoformat() if fixture.IDCampeonato.Fecha_Fin else None,
                },
                'numero': fixture.Numero,
                'fecha': fixture.Fecha.isoformat() if fixture.Fecha else None,
            })

        # Retornar respuesta con datos y número total de registros.
        return Response({
            'total': fixtures.count(),
            'fixtures': datos
        })

    def post(self, request):
        """Crear un nuevo fixture."""
        # Obtener datos del request.
        campeonato_id = request.data.get('IDCampeonato')
        numero = request.data.get('Numero')
        fecha = request.data.get('Fecha')

        # Validar campos requeridos.
        if not campeonato_id or not numero:
            return Response(
                {'detail': 'IDCampeonato y Numero son requeridos'}, 
                status=400
            )

        # Validar que el campeonato existe.
        try:
            campeonato = Campeonato.objects.get(id=campeonato_id)
        except Campeonato.DoesNotExist:
            return Response({'detail': 'Campeonato no encontrado'}, status=404)

        # Crear el fixture.
        fixture = Fixture.objects.create(
            IDCampeonato=campeonato,
            Numero=numero,
            Fecha=fecha if fecha else None
        )

        # Retornar el fixture creado.
        return Response({
            'detail': 'Fixture creado exitosamente',
            'fixture': {
                'id': fixture.id,
                'IDFixture': fixture.id,
                'IDCampeonato': fixture.IDCampeonato.id,
                'Numero': fixture.Numero,
                'Fecha': fixture.Fecha.isoformat() if fixture.Fecha else None,
            }
        }, status=201)

    def put(self, request, pk):
        """Actualizar un fixture existente."""
        # Buscar el fixture.
        try:
            fixture = Fixture.objects.get(pk=pk)
        except Fixture.DoesNotExist:
            return Response({'detail': 'Fixture no encontrado'}, status=404)

        # Actualizar campos.
        if 'IDCampeonato' in request.data:
            try:
                campeonato = Campeonato.objects.get(id=request.data['IDCampeonato'])
                fixture.IDCampeonato = campeonato
            except Campeonato.DoesNotExist:
                return Response({'detail': 'Campeonato no encontrado'}, status=404)

        if 'Numero' in request.data:
            fixture.Numero = request.data['Numero']

        if 'Fecha' in request.data:
            fixture.Fecha = request.data['Fecha'] if request.data['Fecha'] else None

        # Guardar cambios.
        fixture.save()

        # Retornar fixture actualizado.
        return Response({
            'detail': 'Fixture actualizado exitosamente',
            'fixture': {
                'id': fixture.id,
                'IDFixture': fixture.id,
                'IDCampeonato': fixture.IDCampeonato.id,
                'Numero': fixture.Numero,
                'Fecha': fixture.Fecha.isoformat() if fixture.Fecha else None,
            }
        })

    def delete(self, request, pk):
        """Eliminar un fixture."""
        # Buscar el fixture.
        try:
            fixture = Fixture.objects.get(pk=pk)
        except Fixture.DoesNotExist:
            return Response({'detail': 'Fixture no encontrado'}, status=404)

        # Eliminar el fixture.
        fixture.delete()

        return Response({
            'detail': 'Fixture eliminado exitosamente'
        }, status=204)
    

class incidencia_controllers(APIView):
    """Controlador para gestionar las incidencias de los partidos."""
    permission_classes = [permissions.IsAuthenticated]  # Requiere autenticación.

    def get(self, request):
        """Obtener listado de incidencias con filtros opcionales."""
        # Obtener parámetros de filtrado.
        partido_param = request.query_params.get('partido', None)
        tipo_param = request.query_params.get('tipo', None)
        fecha_param = request.query_params.get('fecha', None)
        campeonato_param = request.query_params.get('campeonato', None)
        
        # Inicializar consulta de incidencias.
        incidencias = Incidencia.objects.select_related(
            'IDPartido',
            'IDPartido__IDFixture',
            'IDPartido__IDFixture__IDCampeonato',
            'IDPartido__IDEquipo_Local',
            'IDPartido__IDEquipo_Visitante'
        ).all()

        # Filtrar por partido.
        if partido_param:
            try:
                partido_id = int(partido_param)
                incidencias = incidencias.filter(IDPartido__id=partido_id)
            except ValueError:
                pass  # Si el formato es inválido, ignorar el filtro.

        # Filtrar por tipo de incidencia.
        if tipo_param:
            try:
                tipo = int(tipo_param)
                incidencias = incidencias.filter(Tipo=tipo)
            except ValueError:
                pass  # Si el formato es inválido, ignorar el filtro.

        # Filtrar por fecha.
        if fecha_param:
            try:
                fecha_obj = datetime.strptime(fecha_param, '%Y-%m-%d').date()
                incidencias = incidencias.filter(Fecha__date=fecha_obj)
            except ValueError:
                pass  # Si el formato es inválido, ignorar el filtro.

        # Filtrar por campeonato.
        if campeonato_param:
            try:
                campeonato_id = int(campeonato_param)
                incidencias = incidencias.filter(IDPartido__IDFixture__IDCampeonato__id=campeonato_id)
            except ValueError:
                # Buscar por nombre del campeonato
                incidencias = incidencias.filter(IDPartido__IDFixture__IDCampeonato__Nombre__icontains=campeonato_param)

        # Ordenar las incidencias más recientes primero.
        incidencias = incidencias.order_by('-Fecha')

        # Construcción de datos para la respuesta.
        datos = []
        for incidencia in incidencias:
            datos.append({
                'id': incidencia.id,
                'IDIncidencia': incidencia.id,
                'partido': {
                    'id': incidencia.IDPartido.id,
                    'equipo_local': incidencia.IDPartido.IDEquipo_Local.Nombre,
                    'equipo_visitante': incidencia.IDPartido.IDEquipo_Visitante.Nombre,
                    'fixture_numero': incidencia.IDPartido.IDFixture.Numero if incidencia.IDPartido.IDFixture else None,
                    'campeonato': incidencia.IDPartido.IDFixture.IDCampeonato.Nombre if incidencia.IDPartido.IDFixture else None,
                },
                'tipo': incidencia.Tipo,
                'descripcion': incidencia.Descripcion,
                'fecha': incidencia.Fecha.isoformat(),
            })

        # Retornar respuesta con datos y número total de registros.
        return Response({
            'total': incidencias.count(),
            'incidencias': datos
        })

    def post(self, request):
        """Registrar una nueva incidencia en un partido."""
        # Obtener datos del request.
        partido_id = request.data.get('IDPartido')
        tipo = request.data.get('Tipo')
        descripcion = request.data.get('Descripcion')

        # Validar campos requeridos.
        if not partido_id or descripcion is None:
            return Response(
                {'detail': 'IDPartido y Descripcion son requeridos'}, 
                status=400
            )

        # Validar que el partido existe.
        try:
            partido = Partido.objects.get(id=partido_id)
        except Partido.DoesNotExist:
            return Response({'detail': 'Partido no encontrado'}, status=404)

        # Crear la incidencia.
        incidencia = Incidencia.objects.create(
            IDPartido=partido,
            Tipo=tipo if tipo is not None else None,
            Descripcion=descripcion
        )

        # Retornar la incidencia creada.
        return Response({
            'detail': 'Incidencia registrada exitosamente',
            'incidencia': {
                'id': incidencia.id,
                'IDIncidencia': incidencia.id,
                'IDPartido': incidencia.IDPartido.id,
                'Tipo': incidencia.Tipo,
                'Descripcion': incidencia.Descripcion,
                'Fecha': incidencia.Fecha.isoformat(),
            }
        }, status=201)

    def put(self, request, pk):
        """Actualizar una incidencia existente."""
        # Buscar la incidencia.
        try:
            incidencia = Incidencia.objects.get(pk=pk)
        except Incidencia.DoesNotExist:
            return Response({'detail': 'Incidencia no encontrada'}, status=404)

        # Actualizar campos.
        if 'IDPartido' in request.data:
            try:
                partido = Partido.objects.get(id=request.data['IDPartido'])
                incidencia.IDPartido = partido
            except Partido.DoesNotExist:
                return Response({'detail': 'Partido no encontrado'}, status=404)

        if 'Tipo' in request.data:
            incidencia.Tipo = request.data['Tipo']

        if 'Descripcion' in request.data:
            incidencia.Descripcion = request.data['Descripcion']

        # Guardar cambios.
        incidencia.save()

        # Retornar incidencia actualizada.
        return Response({
            'detail': 'Incidencia actualizada exitosamente',
            'incidencia': {
                'id': incidencia.id,
                'IDIncidencia': incidencia.id,
                'IDPartido': incidencia.IDPartido.id,
                'Tipo': incidencia.Tipo,
                'Descripcion': incidencia.Descripcion,
                'Fecha': incidencia.Fecha.isoformat(),
            }
        })

    def delete(self, request, pk):
        """Eliminar una incidencia."""
        # Buscar la incidencia.
        try:
            incidencia = Incidencia.objects.get(pk=pk)
        except Incidencia.DoesNotExist:
            return Response({'detail': 'Incidencia no encontrada'}, status=404)

        # Eliminar la incidencia.
        incidencia.delete()

        return Response({
            'detail': 'Incidencia eliminada exitosamente'
        }, status=204)