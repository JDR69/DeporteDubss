from django.shortcuts import render
from django.contrib.auth.hashers import check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from deporte_bd.models import Usuario, Bitacora
from drf_spectacular.utils import extend_schema
from .serializers import LoginSerializer, TokenResponseSerializer
from .serializers import RolSerializer
from rest_framework import generics
from deporte_bd.models import Rol
from .serializers import UsuarioSerializer
from .permissions import IsAdminOrOrganizer
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from usuarios.authentication import UsuarioJWTAuthentication


class AuthController(APIView):
	permission_classes = [permissions.AllowAny]

	@extend_schema(request=LoginSerializer, responses=TokenResponseSerializer)
	def post(self, request, *args, **kwargs):
		"""Login: espera 'correo' y 'contrasena' en JSON."""
		data = request.data
		correo = data.get('correo') or data.get('Correo')
		contrasena = data.get('contrasena') or data.get('Contrasena')

		if not correo or not contrasena:
			return Response({'detail': 'Correo y contraseña son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			usuario = Usuario.objects.get(Correo=correo)
		except Usuario.DoesNotExist:
			return Response({'detail': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

		# Verificar contraseña (almacenada como hash)
		if not check_password(contrasena, usuario.Contrasena):
			# registrar intento fallido en bitácora
			Bitacora.objects.create(IDUsuario=usuario, Accion='login_fail', Detalle='Credenciales inválidas')
			return Response({'detail': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

		# Crear tokens JWT
		refresh = RefreshToken.for_user(usuario)
		access = str(refresh.access_token)
		refresh_token = str(refresh)

		# Registrar éxito en bitácora
		Bitacora.objects.create(IDUsuario=usuario, Accion='login', Detalle='Inicio de sesión exitoso')

		return Response({
			'access': access,
			'refresh': refresh_token,
			'usuario': {
				'id': usuario.id,
				'Nombre': usuario.Nombre,
				'Apellido': usuario.Apellido,
				'Correo': usuario.Correo,
				'IDRol': usuario.IDRol_id,
			}
		}, status=status.HTTP_200_OK)


class LogoutController(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, *args, **kwargs):
		# Registrar cierre de sesión en bitácora
		user = request.user
		# Nuestro token puede no mapear a un Usuario Django; intentamos hallar Usuario por pk en request.user
		try:
			usuario = Usuario.objects.get(id=getattr(user, 'id', None))
			Bitacora.objects.create(IDUsuario=usuario, Accion='logout', Detalle='Cierre de sesión')
		except Exception:
			pass

		return Response({'detail': 'Sesión cerrada'}, status=status.HTTP_200_OK)



class RolesList(generics.ListAPIView):
	"""Devuelve la lista de todos los roles."""
	permission_classes = [permissions.AllowAny]
	queryset = Rol.objects.all()
	serializer_class = RolSerializer

	@extend_schema(responses=RolSerializer(many=True))
	def get(self, request, *args, **kwargs):
		return super().get(request, *args, **kwargs)


class UserDetail(RetrieveUpdateDestroyAPIView):
	"""Recuperar, actualizar o eliminar un Usuario. Solo roles 1 y 2 pueden actualizar/eliminar."""
	queryset = Usuario.objects.all()
	serializer_class = UsuarioSerializer
	# Use custom authentication that resolves tokens to `deporte_bd.Usuario`
	authentication_classes = (UsuarioJWTAuthentication,)
	permission_classes = (IsAdminOrOrganizer,)

	def perform_update(self, serializer):
		# Evitar actualización de contrasena desde este endpoint: ignore field si llega
		if 'Contrasena' in self.request.data:
			# No permitimos cambiar contraseña aquí
			pass
		usuario_actualizado = serializer.save()

		# Registrar en bitácora: actor obtenido desde token
		token = getattr(self.request, 'auth', None)
		actor = None
		try:
			user_id = token.get('user_id') if hasattr(token, 'get') else getattr(token, 'user_id', None)
			if user_id:
				actor = Usuario.objects.filter(id=user_id).first()
		except Exception:
			actor = None

		detalle = f'Usuario actualizado: id={usuario_actualizado.id}'
		if actor:
			Bitacora.objects.create(IDUsuario=actor, Accion='update_user', Detalle=detalle)
		else:
			# registrar con el mismo usuario objetivo si no se conoce actor
			Bitacora.objects.create(IDUsuario=usuario_actualizado, Accion='update_user', Detalle=detalle)

	def perform_destroy(self, instance):
		# Registrar antes de borrar
		token = getattr(self.request, 'auth', None)
		actor = None
		try:
			user_id = token.get('user_id') if hasattr(token, 'get') else getattr(token, 'user_id', None)
			if user_id:
				actor = Usuario.objects.filter(id=user_id).first()
		except Exception:
			actor = None

		detalle = f'Usuario eliminado: id={instance.id}'
		if actor:
			Bitacora.objects.create(IDUsuario=actor, Accion='delete_user', Detalle=detalle)
		else:
			Bitacora.objects.create(IDUsuario=instance, Accion='delete_user', Detalle=detalle)

		instance.delete()



class UsersList(generics.ListAPIView):
	"""Lista todos los usuarios con su rol embebido."""
	permission_classes = [permissions.AllowAny]
	queryset = Usuario.objects.select_related('IDRol').all()
	serializer_class = UsuarioSerializer

	@extend_schema(responses=UsuarioSerializer(many=True))
	def get(self, request, *args, **kwargs):
		return super().get(request, *args, **kwargs)
