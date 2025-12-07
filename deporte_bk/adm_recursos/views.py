from rest_framework import viewsets, permissions
from deporte_bd.models import Categoria, Instalacion, Deporte
from .serializers import CategoriaSerializer, InstalacionSerializer, DeporteSerializer
from deporte_bd.models import Partido
from rest_framework.views import APIView

class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Permite acceso de solo lectura (GET) a usuarios no autenticados,
    pero requiere autenticación para otras operaciones (POST, PUT, DELETE)
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class CategoriaViewSet(viewsets.ModelViewSet):
	"""CRUD for Categoria (adm_recursos)"""
	queryset = Categoria.objects.all()
	serializer_class = CategoriaSerializer
	permission_classes = [IsAuthenticatedOrReadOnly]


class InstalacionViewSet(viewsets.ModelViewSet):
	"""CRUD for Instalacion (adm_recursos)"""
	queryset = Instalacion.objects.all()
	serializer_class = InstalacionSerializer
	permission_classes = [IsAuthenticatedOrReadOnly]


class DeporteViewSet(viewsets.ModelViewSet):
	"""CRUD for Deporte (adm_recursos)"""
	queryset = Deporte.objects.all()
	serializer_class = DeporteSerializer
	permission_classes = [IsAuthenticatedOrReadOnly]
 
class calendario_controllers(APIView):
    """Controlador para gestionar el calendario de partidos del sistema."""
    permission_classes = [IsAuthenticatedOrReadOnly]  # Requiere autenticación para modificar.

    def get(self, request):
        """Obtener calendario de partidos con filtros opcionales."""
        from datetime import datetime
        from django.db.models import Q
        
        # Obtener parámetros de filtrado.
        fecha_inicio_param = request.query_params.get('fecha_inicio', None)
        fecha_fin_param = request.query_params.get('fecha_fin', None)
        campeonato_param = request.query_params.get('campeonato', None)
        equipo_param = request.query_params.get('equipo', None)
        instalacion_param = request.query_params.get('instalacion', None)
        
        # Inicializar consulta de partidos con fixtures que tienen fecha.
        partidos = Partido.objects.select_related(
            'IDFixture', 
            'IDFixture__IDCampeonato',
            'IDInstalacion', 
            'IDResultado',
            'IDEquipo_Local', 
            'IDEquipo_Visitante'
        ).filter(IDFixture__Fecha__isnull=False)

        # Filtrar por rango de fechas.
        if fecha_inicio_param:
            try:
                fecha_inicio = datetime.strptime(fecha_inicio_param, '%Y-%m-%d').date()
                partidos = partidos.filter(IDFixture__Fecha__gte=fecha_inicio)
            except ValueError:
                pass  # Si el formato es inválido, ignorar el filtro.

        if fecha_fin_param:
            try:
                fecha_fin = datetime.strptime(fecha_fin_param, '%Y-%m-%d').date()
                partidos = partidos.filter(IDFixture__Fecha__lte=fecha_fin)
            except ValueError:
                pass  # Si el formato es inválido, ignorar el filtro.

        # Filtrar por campeonato.
        if campeonato_param:
            try:
                campeonato_id = int(campeonato_param)
                partidos = partidos.filter(IDFixture__IDCampeonato__id=campeonato_id)
            except ValueError:
                # Buscar por nombre del campeonato
                partidos = partidos.filter(IDFixture__IDCampeonato__Nombre__icontains=campeonato_param)

        # Filtrar por equipo (local o visitante).
        if equipo_param:
            try:
                equipo_id = int(equipo_param)
                partidos = partidos.filter(
                    Q(IDEquipo_Local__id=equipo_id) | Q(IDEquipo_Visitante__id=equipo_id)
                )
            except ValueError:
                # Buscar por nombre del equipo
                partidos = partidos.filter(
                    Q(IDEquipo_Local__Nombre__icontains=equipo_param) | 
                    Q(IDEquipo_Visitante__Nombre__icontains=equipo_param)
                )

        # Filtrar por instalación.
        if instalacion_param:
            try:
                instalacion_id = int(instalacion_param)
                partidos = partidos.filter(IDInstalacion__id=instalacion_id)
            except ValueError:
                # Buscar por nombre de la instalación
                partidos = partidos.filter(IDInstalacion__Nombre__icontains=instalacion_param)

        # Ordenar por fecha del fixture.
        partidos = partidos.order_by('IDFixture__Fecha', 'IDFixture__Numero', 'id')

        # Construcción de datos para la respuesta.
        datos = []
        for partido in partidos:
            datos.append({
                'id': partido.id,
                'IDPartido': partido.id,
                'fecha': partido.IDFixture.Fecha.isoformat() if partido.IDFixture.Fecha else None,
                'fixture': {
                    'id': partido.IDFixture.id,
                    'numero': partido.IDFixture.Numero,
                },
                'campeonato': {
                    'id': partido.IDFixture.IDCampeonato.id,
                    'nombre': partido.IDFixture.IDCampeonato.Nombre,
                    'estado': partido.IDFixture.IDCampeonato.Estado,
                    'deporte': partido.IDFixture.IDCampeonato.IDDeporte.Nombre if partido.IDFixture.IDCampeonato.IDDeporte else None,
                },
                'equipo_local': {
                    'id': partido.IDEquipo_Local.id,
                    'nombre': partido.IDEquipo_Local.Nombre,
                    'logo': partido.IDEquipo_Local.Logo,
                },
                'equipo_visitante': {
                    'id': partido.IDEquipo_Visitante.id,
                    'nombre': partido.IDEquipo_Visitante.Nombre,
                    'logo': partido.IDEquipo_Visitante.Logo,
                },
                'instalacion': {
                    'id': partido.IDInstalacion.id,
                    'nombre': partido.IDInstalacion.Nombre,
                    'ubicacion': partido.IDInstalacion.Ubicacion,
                } if partido.IDInstalacion else None,
                'resultado': {
                    'goles_local': partido.IDResultado.Goles_Local,
                    'goles_visitante': partido.IDResultado.Goles_Visitante,
                } if partido.IDResultado else None,
            })

        # Retornar respuesta con datos y número total de registros.
        return Response({
            'total': partidos.count(),
            'partidos': datos
        })
