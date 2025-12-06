from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class UsuarioJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication that resolves tokens to the `deporte_bd.Usuario` model.

    SimpleJWT's default `get_user` looks up the Django `AUTH_USER_MODEL`. Since this
    project uses a custom `Usuario` model stored in `deporte_bd`, we override the
    lookup so `request.user` and permission checks work with that model.
    """

    def get_user(self, validated_token):
        # validated_token is a dict-like with the user id claim (usually 'user_id')
        # Some SimpleJWT versions set `self.user_id_claim`, but to remain compatible
        # we attempt to read the common claim names directly and fall back safely.
        try:
            from django.conf import settings
            claim_name = getattr(self, 'user_id_claim', None) or settings.SIMPLE_JWT.get('USER_ID_CLAIM', 'user_id')
        except Exception:
            claim_name = 'user_id'

        user_id = validated_token.get(claim_name) or validated_token.get('user_id')
        if user_id is None:
            raise AuthenticationFailed('Token contained no recognizable user identification', code='no_user_id')

        try:
            from deporte_bd.models import Usuario
            return Usuario.objects.get(pk=user_id)
        except Exception:
            raise AuthenticationFailed('User not found', code='user_not_found')
