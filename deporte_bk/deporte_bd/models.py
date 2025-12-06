from django.db import models
from django.contrib.auth.models import User # Si quieres usar el User de Django, si no, usa una clase Usuario personalizada.
# Para este ejemplo, vamos a definir una clase Usuario personalizada que hereda de models.Model para simplificar.

# --- Módulo de Seguridad y Usuarios ---

class Rol(models.Model):
    # IDRol SERIAL PRIMARY KEY (se crea automáticamente en Django)
    Nombre = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.Nombre

class Permiso(models.Model):
    # IDPermiso SERIAL PRIMARY KEY
    Nombre = models.CharField(max_length=100, unique=True)
    Estado = models.CharField(max_length=20, blank=True, null=True) # Puede ser 'Activo', 'Inactivo', etc.

    def __str__(self):
        return self.Nombre

class RolPermiso(models.Model):
    # IDRol_Permiso SERIAL PRIMARY KEY
    IDRol = models.ForeignKey(Rol, on_delete=models.CASCADE)
    IDPermiso = models.ForeignKey(Permiso, on_delete=models.CASCADE)

    class Meta:
        # Esto asegura que no pueda haber el mismo Rol y Permiso más de una vez
        unique_together = (('IDRol', 'IDPermiso'),)
        verbose_name = "Rol y Permiso"
        verbose_name_plural = "Roles y Permisos"

class Usuario(models.Model):
    # IDUsuario SERIAL PRIMARY KEY
    IDRol = models.ForeignKey(Rol, on_delete=models.PROTECT) # PROTECT para evitar borrar Rol si tiene Usuarios asociados
    Nombre = models.CharField(max_length=100)
    Apellido = models.CharField(max_length=100)
    Registro = models.IntegerField(unique=True, blank=True, null=True) # UNIQUE
    Correo = models.EmailField(max_length=150, unique=True) # UNIQUE, campo optimizado para correos
    Contrasena = models.CharField(max_length=255) # Django se encarga del hashing con su sistema de autenticación, pero si usas este campo, guardas el hash aquí.
    Fecha_Nacimiento = models.DateField(blank=True, null=True)
    GENERO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]
    Genero = models.CharField(max_length=20, choices=GENERO_CHOICES, blank=True, null=True)
    Estado = models.SmallIntegerField(default=1) # 1: Activo, 0: Inactivo

    def __str__(self):
        return f"{self.Nombre} {self.Apellido}"

# Tablas con herencia: Organizador y Delegado son tipos de Usuario (Relación One-to-One)

class Organizador(models.Model):
    # IDUsuario INTEGER PRIMARY KEY
    IDUsuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)

    def __str__(self):
        return f"Organizador: {self.IDUsuario.Nombre}"

class Delegado(models.Model):
    # IDUsuario INTEGER PRIMARY KEY
    IDUsuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)

    def __str__(self):
        return f"Delegado: {self.IDUsuario.Nombre}"


# --- Módulo de Deportes y Estructura ---

class Categoria(models.Model):
    # IDCategoria SERIAL PRIMARY KEY
    Nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.Nombre

class Deporte(models.Model):
    # IDDeporte SERIAL PRIMARY KEY
    IDCategoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)
    Nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.Nombre

class Instalacion(models.Model):
    # IDInstalacion SERIAL PRIMARY KEY
    Nombre = models.CharField(max_length=100, unique=True)
    Ubicacion = models.CharField(max_length=255, blank=True, null=True)
    Estado = models.SmallIntegerField(default=1)

    def __str__(self):
        return self.Nombre

class Equipo(models.Model):
    # IDEquipo SERIAL PRIMARY KEY
    IDUsuario = models.ForeignKey(Delegado, on_delete=models.PROTECT) # Referencia al Delegado
    Nombre = models.CharField(max_length=100)
    Logo = models.CharField(max_length=255, blank=True, null=True)
    Estado = models.SmallIntegerField(default=1)

    def __str__(self):
        return self.Nombre

class Jugador(models.Model):
    # IDUsuario INTEGER PRIMARY KEY
    IDUsuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True) # Jugador es un tipo de Usuario
    IDEquipo = models.ForeignKey(Equipo, on_delete=models.PROTECT)
    Observacion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Jugador: {self.IDUsuario.Nombre} - Equipo: {self.IDEquipo.Nombre}"


# --- Módulo de Campeonatos y Partidos ---

class Campeonato(models.Model):
    # IDCampeonato SERIAL PRIMARY KEY
    IDUsuario = models.ForeignKey(Organizador, on_delete=models.PROTECT) # Referencia al Organizador
    IDDeporte = models.ForeignKey(Deporte, on_delete=models.PROTECT)
    Nombre = models.CharField(max_length=150)
    Fecha_Inicio = models.DateField(blank=True, null=True)
    Fecha_Fin = models.DateField(blank=True, null=True)
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('En Curso', 'En Curso'),
        ('Finalizado', 'Finalizado'),
    ]
    Estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Pendiente')

    def __str__(self):
        return self.Nombre

class Historial(models.Model):
    # IDHistorial SERIAL PRIMARY KEY
    IDCampeonato = models.ForeignKey(Campeonato, on_delete=models.CASCADE)
    IDEquipo = models.ForeignKey(Equipo, on_delete=models.PROTECT)
    Posicion = models.IntegerField(blank=True, null=True)
    Puntos = models.IntegerField(blank=True, null=True)

    class Meta:
        unique_together = (('IDCampeonato', 'IDEquipo'),) # Un equipo solo puede tener una entrada por campeonato
        verbose_name = "Historial del Campeonato"
        verbose_name_plural = "Historiales de Campeonatos"

class Fixture(models.Model):
    # IDFixture SERIAL PRIMARY KEY
    IDCampeonato = models.OneToOneField(Campeonato, on_delete=models.CASCADE) # Un Fixture por Campeonato

    def __str__(self):
        return f"Fixture de: {self.IDCampeonato.Nombre}"

class Resultado(models.Model):
    # IDResultado SERIAL PRIMARY KEY
    Goles_Local = models.IntegerField(default=0)
    Goles_Visitante = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.Goles_Local} - {self.Goles_Visitante}"

class Partido(models.Model):
    # IDPartido SERIAL PRIMARY KEY
    IDFixture = models.ForeignKey(Fixture, on_delete=models.CASCADE)
    IDInstalacion = models.ForeignKey(Instalacion, on_delete=models.PROTECT)
    IDResultado = models.OneToOneField(Resultado, on_delete=models.SET_NULL, null=True, blank=True)
    IDEquipo_Local = models.ForeignKey(Equipo, on_delete=models.PROTECT, related_name='partidos_local')
    IDEquipo_Visitante = models.ForeignKey(Equipo, on_delete=models.PROTECT, related_name='partidos_visitante')

    def __str__(self):
        return f"{self.IDEquipo_Local.Nombre} vs {self.IDEquipo_Visitante.Nombre}"

class Incidencia(models.Model):
    # IDIncidencia SERIAL PRIMARY KEY
    IDPartido = models.ForeignKey(Partido, on_delete=models.CASCADE)
    Tipo = models.IntegerField(blank=True, null=True) # Se podría usar choices o un modelo aparte si hay muchos tipos
    Descripcion = models.TextField()
    Fecha = models.DateTimeField(auto_now_add=True) # Se establece automáticamente al crear el registro

    def __str__(self):
        return f"Incidencia en Partido {self.IDPartido.id} (Tipo: {self.Tipo})"


class Bitacora(models.Model):
    """Registro de eventos de autenticación y acciones de usuarios."""
    IDUsuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    Accion = models.CharField(max_length=100)  # Ej: 'login', 'logout'
    Fecha = models.DateTimeField(auto_now_add=True)
    Detalle = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'Bitácora'
        verbose_name_plural = 'Bitácoras'

    def __str__(self):
        return f"{self.IDUsuario.Correo} - {self.Accion} @ {self.Fecha}"