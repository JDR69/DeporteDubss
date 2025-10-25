from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from Usuarios.models.permisosModels.models import Permisos
from Usuarios.serializers.permisosSerializers.serializers import PermisosSerializers


@api_view(['POST'])
def create_permiso(request):
    serializer = PermisosSerializers(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"mensaje": "Permiso creado" }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)