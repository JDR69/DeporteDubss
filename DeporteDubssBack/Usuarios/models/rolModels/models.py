from django.db import models
from Usuarios.models.permisosModels.models import Permisos

class Rol(models.Model):
	id = models.AutoField(primary_key=True)
	nombre = models.CharField(max_length=18)
 
class RolPermiso(models.Model):
	id = models.AutoField(primary_key=True)
	permiso = models.ForeignKey(Permisos, on_delete=models.CASCADE)
	rol = models.ForeignKey(Rol, on_delete=models.CASCADE)
