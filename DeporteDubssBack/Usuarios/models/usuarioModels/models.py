from django.db import models
from Usuarios.models.rolModels.models import Rol


class Usuario(models.Model):
	id = models.AutoField(primary_key=True)
	nombre = models.CharField(max_length=50)
	apellido = models.CharField(max_length=50)
	registro = models.IntegerField()
	correo = models.CharField(max_length=100)
	contrasena = models.CharField(max_length=250)
	fecha_nacimiento = models.DateField()
	genero = models.CharField(max_length=10)
	estado = models.BooleanField()
	rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

class Organizador(models.Model):
	usuario = models.OneToOneField(Usuario, primary_key=True, on_delete=models.CASCADE)

class Equipo(models.Model):
	id = models.AutoField(primary_key=True)
	nombre = models.CharField(max_length=50)
	logo = models.CharField(max_length=100)
	estado = models.BooleanField()

class Delegado(models.Model):
	usuario = models.OneToOneField(Usuario, primary_key=True, on_delete=models.CASCADE)
	equipo = models.ForeignKey(Equipo, on_delete=models.CASCADE)