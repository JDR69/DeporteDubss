import csv
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from django.contrib.auth.hashers import make_password
from deporte_bd.models import (
    Categoria, Deporte, Instalacion, Equipo, Jugador, Campeonato, 
    Fixture, Partido, Resultado, Historial, Rol, Usuario, Delegado, Organizador, Incidencia
)

# Ruta a la carpeta 'data' dentro de la aplicación 'deporte_bd'
DATA_DIR = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data')

def parse_date(date_str):
    """Convierte fecha en formato YYYY-MM-DD a objeto date."""
    if not date_str or date_str.strip() == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return None

def parse_datetime(date_str):
    """Convierte fecha en formato YYYY-MM-DD HH:MM:SS a objeto datetime."""
    if not date_str or date_str.strip() == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
    except ValueError:
        return None

class Command(BaseCommand):
    help = 'Importa datos completos para el sistema deportivo.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('--- INICIANDO CARGA COMPLETA DE DATOS ---'))

        try:
            with transaction.atomic():
                # 0. Limpiar datos existentes
                self.flush_data()

                # 1. Categorias
                self.load_categorias()
                # 2. Deportes
                self.load_deportes()
                # 3. Instalaciones
                self.load_instalaciones()
                # 3.5 Usuarios Organizadores
                self.load_organizadores()
                # 4. Usuarios Delegados
                self.load_delegados()
                # 5. Equipos
                self.load_equipos()
                # 6. Usuarios Jugadores
                self.load_jugadores()
                # 7. Campeonatos
                self.load_campeonatos()
                # 8. Partidos y Resultados
                self.load_partidos()
                # 9. Calcular Posiciones
                self.calculate_positions()
                
            self.stdout.write(self.style.SUCCESS('\n=== CARGA COMPLETA FINALIZADA EXITOSAMENTE ==='))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error durante la carga: {e}'))
            # No re-raise para ver el error formateado, o sí si queremos stacktrace
            raise e

    def flush_data(self):
        self.stdout.write('Limpiando base de datos...')
        # Eliminar datos en orden inverso a las dependencias
        Incidencia.objects.all().delete()
        Partido.objects.all().delete()
        Resultado.objects.all().delete()
        Historial.objects.all().delete()
        Fixture.objects.all().delete()
        Campeonato.objects.all().delete()
        Jugador.objects.all().delete()
        Equipo.objects.all().delete()
        
        # Eliminar usuarios asociados a roles específicos para no borrar superusuarios
        # Asumiendo IDs de roles: 3=Delegado, 4=Jugador. Organizador también si se carga.
        # Organizador (si existe rol)
        Delegado.objects.all().delete()
        Organizador.objects.all().delete()
        
        # Borrar usuarios que no sean superusuarios (o filtrar por rol si es más seguro)
        # Aquí borramos usuarios que tengan rol de Delegado, Jugador, etc.
        # Para simplificar y no borrar admin:
        Usuario.objects.exclude(IDRol__Nombre='Administrador').delete()

        Instalacion.objects.all().delete()
        Deporte.objects.all().delete()
        Categoria.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('✓ Base de datos limpiada'))

    def load_organizadores(self):
        self.stdout.write('Cargando Organizadores...')
        path = os.path.join(DATA_DIR, 'usuarios_organizadores.csv')
        # Buscar o crear rol Organizador
        rol_organizador, _ = Rol.objects.get_or_create(id=2, defaults={'Nombre': 'Organizador'})
        
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    usuario, created = Usuario.objects.update_or_create(
                        Registro=int(row['Registro']),
                        defaults={
                            'IDRol': rol_organizador,
                            'Nombre': row['Nombre'],
                            'Apellido': row['Apellido'],
                            'Correo': row['Correo'],
                            'Contrasena': make_password(row['Contrasena']),
                            'Fecha_Nacimiento': parse_date(row['Fecha_Nacimiento']),
                            'Genero': row['Genero'],
                            'Estado': int(row['Estado'])
                        }
                    )
                    Organizador.objects.get_or_create(IDUsuario=usuario)
            self.stdout.write(self.style.SUCCESS('✓ Organizadores cargados'))
        else:
            self.stdout.write(self.style.WARNING('Archivo usuarios_organizadores.csv no encontrado'))

    def load_categorias(self):
        self.stdout.write('Cargando Categorias...')
        path = os.path.join(DATA_DIR, 'categorias.csv')
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                Categoria.objects.update_or_create(
                    id=int(row['id']),
                    defaults={'Nombre': row['nombre']}
                )
        self.stdout.write(self.style.SUCCESS('✓ Categorias cargadas'))

    def load_deportes(self):
        self.stdout.write('Cargando Deportes...')
        path = os.path.join(DATA_DIR, 'deportes.csv')
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                Deporte.objects.update_or_create(
                    id=int(row['id']),
                    defaults={
                        'IDCategoria_id': int(row['id_categoria']),
                        'Nombre': row['nombre']
                    }
                )
        self.stdout.write(self.style.SUCCESS('✓ Deportes cargados'))

    def load_instalaciones(self):
        self.stdout.write('Cargando Instalaciones...')
        path = os.path.join(DATA_DIR, 'instalaciones.csv')
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                Instalacion.objects.update_or_create(
                    id=int(row['id']),
                    defaults={
                        'Nombre': row['nombre'],
                        'Ubicacion': row['ubicacion'],
                        'Estado': int(row['estado'])
                    }
                )
        self.stdout.write(self.style.SUCCESS('✓ Instalaciones cargadas'))

    def load_delegados(self):
        self.stdout.write('Cargando Delegados...')
        path = os.path.join(DATA_DIR, 'usuarios_delegados.csv')
        rol_delegado = Rol.objects.get(id=3) # Asumiendo ID 3 es Delegado
        
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                usuario, created = Usuario.objects.update_or_create(
                    Registro=int(row['Registro']),
                    defaults={
                        'IDRol': rol_delegado,
                        'Nombre': row['Nombre'],
                        'Apellido': row['Apellido'],
                        'Correo': row['Correo'],
                        'Contrasena': make_password(row['Contrasena']),
                        'Fecha_Nacimiento': parse_date(row['Fecha_Nacimiento']),
                        'Genero': row['Genero'],
                        'Estado': int(row['Estado'])
                    }
                )
                Delegado.objects.get_or_create(IDUsuario=usuario)
        self.stdout.write(self.style.SUCCESS('✓ Delegados cargados'))

    def load_equipos(self):
        self.stdout.write('Cargando Equipos...')
        path = os.path.join(DATA_DIR, 'equipos.csv')
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Buscar delegado por correo
                try:
                    usuario_delegado = Usuario.objects.get(Correo=row['correo_delegado'])
                    delegado = Delegado.objects.get(IDUsuario=usuario_delegado)
                    
                    Equipo.objects.update_or_create(
                        id=int(row['id']),
                        defaults={
                            'IDUsuario': delegado,
                            'Nombre': row['nombre'],
                            'Logo': row['logo'],
                            'Estado': int(row['estado'])
                        }
                    )
                except Usuario.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Delegado no encontrado: {row['correo_delegado']}"))

        self.stdout.write(self.style.SUCCESS('✓ Equipos cargados'))

    def load_jugadores(self):
        self.stdout.write('Cargando Jugadores...')
        path = os.path.join(DATA_DIR, 'usuarios_jugadores.csv')
        rol_jugador = Rol.objects.get(id=4) # Asumiendo ID 4 es Jugador
        
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Crear Usuario
                usuario, created = Usuario.objects.update_or_create(
                    Registro=int(row['Registro']),
                    defaults={
                        'IDRol': rol_jugador,
                        'Nombre': row['Nombre'],
                        'Apellido': row['Apellido'],
                        'Correo': row['Correo'],
                        'Contrasena': make_password(row['Contrasena']),
                        'Fecha_Nacimiento': parse_date(row['Fecha_Nacimiento']),
                        'Genero': row['Genero'],
                        'Estado': int(row['Estado'])
                    }
                )
                
                # Buscar Equipo
                try:
                    equipo = Equipo.objects.get(Nombre=row['Nombre_Equipo'])
                    Jugador.objects.update_or_create(
                        IDUsuario=usuario,
                        defaults={
                            'IDEquipo': equipo,
                            'Observacion': 'Carga Inicial'
                        }
                    )
                except Equipo.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Equipo no encontrado: {row['Nombre_Equipo']}"))

        self.stdout.write(self.style.SUCCESS('✓ Jugadores cargados'))

    def load_campeonatos(self):
        self.stdout.write('Cargando Campeonatos...')
        path = os.path.join(DATA_DIR, 'campeonatos.csv')
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    usuario_org = Usuario.objects.get(Correo=row['correo_organizador'])
                    organizador = Organizador.objects.get(IDUsuario=usuario_org)
                    deporte = Deporte.objects.get(Nombre=row['nombre_deporte'])
                    
                    campeonato, created = Campeonato.objects.update_or_create(
                        id=int(row['id']),
                        defaults={
                            'IDUsuario': organizador,
                            'IDDeporte': deporte,
                            'Nombre': row['nombre'],
                            'Fecha_Inicio': parse_date(row['fecha_inicio']),
                            'Fecha_Fin': parse_date(row['fecha_fin']),
                            'Estado': row['estado']
                        }
                    )
                    
                    # Generar Fixture Completo (Round Robin)
                    self.generate_fixture_round_robin(campeonato)
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error cargando campeonato {row['nombre']}: {e}"))

        self.stdout.write(self.style.SUCCESS('✓ Campeonatos cargados'))

    def generate_fixture_round_robin(self, campeonato):
        self.stdout.write(f'Generando Fixture para {campeonato.Nombre}...')
        equipos = list(Equipo.objects.all()) # Asumimos todos los equipos participan
        
        if not equipos:
            return

        # Inicializar Historial para todos los equipos
        for eq in equipos:
            Historial.objects.get_or_create(IDCampeonato=campeonato, IDEquipo=eq)

        # Algoritmo Round Robin
        if len(equipos) % 2 != 0:
            equipos.append(None) # Bye team

        n = len(equipos)
        rounds = n - 1
        matches_per_round = n // 2
        
        # Instalación por defecto (la primera que encontremos)
        instalacion_default = Instalacion.objects.first()

        for r in range(rounds):
            # Crear Fixture (Jornada)
            fixture = Fixture.objects.create(
                IDCampeonato=campeonato,
                Numero=r + 1,
                Fecha=datetime.now().date() # Fecha placeholder
            )
            
            for i in range(matches_per_round):
                t1 = equipos[i]
                t2 = equipos[n - 1 - i]
                
                if t1 and t2:
                    # Crear Partido Pendiente
                    Partido.objects.create(
                        IDFixture=fixture,
                        IDInstalacion=instalacion_default,
                        IDResultado=None, # Pendiente
                        IDEquipo_Local=t1,
                        IDEquipo_Visitante=t2
                    )
            
            # Rotar equipos (mantener el primero fijo)
            equipos = [equipos[0]] + [equipos[-1]] + equipos[1:-1]

    def load_partidos(self):
        self.stdout.write('Actualizando Resultados de Partidos...')
        path = os.path.join(DATA_DIR, 'partidos.csv')
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    campeonato = Campeonato.objects.get(Nombre=row['nombre_campeonato'])
                    equipo_local = Equipo.objects.get(Nombre=row['nombre_equipo_local'])
                    equipo_visitante = Equipo.objects.get(Nombre=row['nombre_equipo_visitante'])
                    
                    # Buscar el partido generado
                    partido = Partido.objects.filter(
                        IDFixture__IDCampeonato=campeonato,
                        IDEquipo_Local=equipo_local,
                        IDEquipo_Visitante=equipo_visitante
                    ).first()
                    
                    if not partido:
                        # Intentar buscar invertido (si el fixture lo generó al revés)
                        partido = Partido.objects.filter(
                            IDFixture__IDCampeonato=campeonato,
                            IDEquipo_Local=equipo_visitante,
                            IDEquipo_Visitante=equipo_local
                        ).first()
                        # Si se encontró invertido, intercambiamos goles al cargar
                        invertido = True
                    else:
                        invertido = False

                    if partido:
                        goles_local = int(row['goles_local'])
                        goles_visitante = int(row['goles_visitante'])
                        
                        if invertido:
                            # Si el partido en BD es Visitante vs Local, pero CSV es Local vs Visitante
                            # Entonces Goles_Local del CSV son Goles_Visitante en BD
                            goles_real_local = goles_visitante
                            goles_real_visitante = goles_local
                        else:
                            goles_real_local = goles_local
                            goles_real_visitante = goles_visitante

                        # Crear o Actualizar Resultado
                        resultado = Resultado.objects.create(
                            Goles_Local=goles_real_local,
                            Goles_Visitante=goles_real_visitante
                        )
                        partido.IDResultado = resultado
                        partido.save()
                        
                        # Actualizar Historial
                        # Nota: update_historial debe recibir los equipos tal cual jugaron en el CSV para sumar correctamente
                        # O mejor, usamos los equipos del partido en BD y sus goles correspondientes
                        self.update_historial(campeonato, partido.IDEquipo_Local, goles_real_local, goles_real_visitante)
                        self.update_historial(campeonato, partido.IDEquipo_Visitante, goles_real_visitante, goles_real_local)
                    else:
                        self.stdout.write(self.style.WARNING(f"Partido no encontrado en fixture: {row['nombre_equipo_local']} vs {row['nombre_equipo_visitante']}"))
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error cargando partido {row['nombre_equipo_local']} vs {row['nombre_equipo_visitante']}: {e}"))

        self.stdout.write(self.style.SUCCESS('✓ Resultados actualizados'))

    def update_historial(self, campeonato, equipo, goles_favor, goles_contra):
        historial, created = Historial.objects.get_or_create(
            IDCampeonato=campeonato,
            IDEquipo=equipo,
            defaults={'Puntos': 0, 'Posicion': 0, 'PJ': 0, 'PG': 0, 'PE': 0, 'PP': 0, 'GF': 0, 'GC': 0, 'DG': 0}
        )
        
        historial.PJ += 1
        historial.GF += goles_favor
        historial.GC += goles_contra
        historial.DG = historial.GF - historial.GC
        
        if goles_favor > goles_contra:
            historial.PG += 1
            historial.Puntos += 3
        elif goles_favor == goles_contra:
            historial.PE += 1
            historial.Puntos += 1
        else:
            historial.PP += 1
            
        historial.save()

    def calculate_positions(self):
        self.stdout.write('Calculando Posiciones...')
        campeonatos = Campeonato.objects.all()
        for campeonato in campeonatos:
            # Ordenar por Puntos (desc), Diferencia de Goles (desc), Goles a Favor (desc)
            historiales = Historial.objects.filter(IDCampeonato=campeonato).order_by('-Puntos', '-DG', '-GF')
            
            posicion = 1
            for historial in historiales:
                historial.Posicion = posicion
                historial.save()
                posicion += 1
        self.stdout.write(self.style.SUCCESS('✓ Posiciones calculadas'))

