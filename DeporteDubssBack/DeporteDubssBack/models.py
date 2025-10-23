from django.db import models

class Permisos(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    estado = models.BooleanField()

class Rol(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=18)

class RolPermiso(models.Model):
    id = models.AutoField(primary_key=True)
    permiso = models.ForeignKey(Permisos, on_delete=models.CASCADE)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

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

class Jugador(models.Model):
    usuario = models.OneToOneField(Usuario, primary_key=True, on_delete=models.CASCADE)
    equipo = models.ForeignKey(Equipo, on_delete=models.CASCADE)

class Categoria(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=20)

class Deporte(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=20)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)

class Campeonato(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=30)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.BooleanField()
    organizador = models.ForeignKey(Organizador, on_delete=models.CASCADE)
    deporte = models.ForeignKey(Deporte, on_delete=models.CASCADE)

class Historial(models.Model):
    id = models.AutoField(primary_key=True)
    posicion = models.IntegerField()
    puntos = models.IntegerField()
    campeonato = models.ForeignKey(Campeonato, on_delete=models.CASCADE)
    equipo = models.ForeignKey(Equipo, on_delete=models.CASCADE)

class Fixture(models.Model):
    id = models.AutoField(primary_key=True)
    fecha = models.DateField()
    jornada = models.IntegerField()
    campeonato = models.ForeignKey(Campeonato, on_delete=models.CASCADE)

class Resultado(models.Model):
    id = models.AutoField(primary_key=True)
    marcador = models.CharField(max_length=8)

class Instalacion(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=30)
    ubicacion = models.CharField(max_length=100)
    estado = models.BooleanField()

class Partido(models.Model):
    id = models.AutoField(primary_key=True)
    fecha = models.DateField()
    fixture = models.ForeignKey(Fixture, on_delete=models.CASCADE)
    instalacion = models.ForeignKey(Instalacion, on_delete=models.CASCADE)
    resultado = models.ForeignKey(Resultado, on_delete=models.CASCADE)
    equipo_local = models.ForeignKey(Equipo, related_name='local', on_delete=models.CASCADE)
    equipo_visitante = models.ForeignKey(Equipo, related_name='visitante', on_delete=models.CASCADE)

class Incidencia(models.Model):
    id = models.AutoField(primary_key=True)
    tipo = models.CharField(max_length=20)
    descripcion = models.CharField(max_length=250)
    fecha = models.DateField()
    partido = models.ForeignKey(Partido, on_delete=models.CASCADE)
