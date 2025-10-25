
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Rol, Equipo, Jugador, Campeonato, Historial, Usuario, Deporte, Categoria
from .serializers import RolSerializer, EquipoSerializer, JugadorSerializer, CampeonatoSerializer, HistorialSerializer, DeporteSerializer, CategoriaSerializer, UsuarioSerializer

# CRUD para Usuario
class UsuarioViewSet(viewsets.ModelViewSet):
	queryset = Usuario.objects.all()
	serializer_class = UsuarioSerializer


# CRUD completo para Categoria
class CategoriaViewSet(viewsets.ModelViewSet):
	queryset = Categoria.objects.all()
	serializer_class = CategoriaSerializer

# CRUD completo para Deporte
class DeporteViewSet(viewsets.ModelViewSet):
	queryset = Deporte.objects.all()
	serializer_class = DeporteSerializer

class RolViewSet(viewsets.ModelViewSet):
	queryset = Rol.objects.all()
	serializer_class = RolSerializer

class EquipoViewSet(viewsets.ModelViewSet):
	queryset = Equipo.objects.all()
	serializer_class = EquipoSerializer

	@action(detail=True, methods=['post'])
	def agregar_jugadores(self, request, pk=None):
		equipo = self.get_object()
		jugadores_data = request.data.get('jugadores', [])
		campeonato_id = request.data.get('campeonato_id')
		if not campeonato_id:
			return Response({'error': 'campeonato_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
		try:
			campeonato = Campeonato.objects.get(id=campeonato_id)
		except Campeonato.DoesNotExist:
			return Response({'error': 'Campeonato no encontrado'}, status=status.HTTP_404_NOT_FOUND)
		jugadores_agregados = []
		for jugador_info in jugadores_data:
			nombre = jugador_info.get('nombre')
			registro = jugador_info.get('registro')
			try:
				usuario = Usuario.objects.get(nombre=nombre, registro=registro)
				jugador = Jugador.objects.get(usuario=usuario)
				jugador.equipo = equipo
				jugador.save()
				jugadores_agregados.append(JugadorSerializer(jugador).data)
				# Registrar en historial (puedes ajustar posición y puntos según lógica de negocio)
				Historial.objects.get_or_create(equipo=equipo, campeonato=campeonato, defaults={'posicion': 0, 'puntos': 0})
			except (Usuario.DoesNotExist, Jugador.DoesNotExist):
				continue
		return Response({'jugadores_agregados': jugadores_agregados})


class CampeonatoViewSet(viewsets.ModelViewSet):
	queryset = Campeonato.objects.all()
	serializer_class = CampeonatoSerializer
