from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from datetime import datetime

from deporte_bd.models import Usuario, Rol, Equipo, Campeonato, Partido, Incidencia, Bitacora


class AdminSummaryView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		usuarios_total = Usuario.objects.count()
		usuarios_por_rol = (
			Usuario.objects.values('IDRol__Nombre').annotate(count=Count('id')).order_by()
		)

		equipos_total = Equipo.objects.count()
		campeonatos_total = Campeonato.objects.count()
		campeonatos_activos = Campeonato.objects.filter(Estado='En Curso').count()
		partidos_total = Partido.objects.count()
		partidos_pendientes = Partido.objects.filter(IDResultado__isnull=True).count()
		incidencias_total = Incidencia.objects.count()

		# Opcional: últimos objetos para mostrar actividad reciente
		recientes = {
			'equipos': list(Equipo.objects.order_by('-id')[:5].values('id', 'Nombre')),
			'campeonatos': list(Campeonato.objects.order_by('-id')[:5].values('id', 'Nombre', 'Estado', 'Fecha_Inicio')),
			'partidos': list(Partido.objects.order_by('-id')[:5].values('id')),
			'incidencias': list(Incidencia.objects.order_by('-id')[:5].values('id', 'Descripcion', 'Fecha')),
		}

		return Response({
			'usuarios': {
				'total': usuarios_total,
				'porRol': list(usuarios_por_rol),
			},
			'equipos': equipos_total,
			'campeonatos': campeonatos_total,
			'campeonatos_activos': campeonatos_activos,
			'partidos': partidos_total,
			'partidos_pendientes': partidos_pendientes,
			'incidencias': incidencias_total,
			'recientes': recientes,
		})


class bitacora_controllers(APIView):
	"""Controlador para gestionar la bitácora del sistema."""
	permission_classes = [IsAuthenticated]

	def get(self, request):
		"""
		Obtiene logs filtrados según parámetros:
		- fecha: Fecha específica (formato YYYY-MM-DD)
		- usuario: ID del usuario o búsqueda por nombre/correo
		- accion: Tipo de acción (login, logout, crear, editar, eliminar, etc.)
		"""
		# Obtener parámetros de filtrado
		fecha_param = request.query_params.get('fecha', None)
		usuario_param = request.query_params.get('usuario', None)
		accion_param = request.query_params.get('accion', None)

		# Iniciar queryset
		logs = Bitacora.objects.all().select_related('IDUsuario', 'IDUsuario__IDRol')

		# Filtrar por fecha
		if fecha_param:
			try:
				fecha_obj = datetime.strptime(fecha_param, '%Y-%m-%d').date()
				logs = logs.filter(Fecha__date=fecha_obj)
			except ValueError:
				pass  # Si el formato es inválido, ignorar el filtro

		# Filtrar por usuario (por ID, nombre, apellido o correo)
		if usuario_param:
			# Intentar convertir a entero para buscar por ID
			try:
				usuario_id = int(usuario_param)
				logs = logs.filter(IDUsuario__id=usuario_id)
			except ValueError:
				# Si no es ID, buscar por nombre, apellido o correo
				logs = logs.filter(
					Q(IDUsuario__Nombre__icontains=usuario_param) |
					Q(IDUsuario__Apellido__icontains=usuario_param) |
					Q(IDUsuario__Correo__icontains=usuario_param)
				)

		# Filtrar por acción
		if accion_param:
			logs = logs.filter(Accion__icontains=accion_param)

		# Ordenar por fecha descendente (más recientes primero)
		logs = logs.order_by('-Fecha')

		# Construir respuesta con datos relevantes
		datos = []
		for log in logs:
			datos.append({
				'id': log.id,
				'usuario': {
					'id': log.IDUsuario.id,
					'nombre': log.IDUsuario.Nombre,
					'apellido': log.IDUsuario.Apellido,
					'correo': log.IDUsuario.Correo,
					'rol': log.IDUsuario.IDRol.Nombre if log.IDUsuario.IDRol else None,
				},
				'accion': log.Accion,
				'fecha': log.Fecha.isoformat(),
				'detalle': log.Detalle,
			})

		return Response({
			'total': logs.count(),
			'logs': datos
		})
