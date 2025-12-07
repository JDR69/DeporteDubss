"""
Comando único para cargar TODOS los datos del sistema desde archivos CSV a la base de datos.
Incluye: roles, usuarios, organizadores, delegados, jugadores, categorías, deportes, 
instalaciones, equipos, campeonatos, fixtures, partidos, resultados e historiales.
"""

import csv
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from django.contrib.auth.hashers import make_password

from deporte_bd.models import (
    Rol, Usuario, Organizador, Delegado, Jugador,
    Categoria, Deporte, Instalacion, Equipo,
    Campeonato, Historial, Fixture, Resultado, Partido
)


def parse_date(date_str):
    """Convierte fecha en formato DD/MM/YYYY a objeto date."""
    if not date_str or date_str.strip() == '':
        return None
    try:
        return datetime.strptime(date_str, '%d/%m/%Y').date()
    except ValueError:
        return None


class Command(BaseCommand):
    help = 'Importa TODOS los datos del sistema desde archivos CSV'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('\n' + '='*70))
        self.stdout.write(self.style.NOTICE('INICIANDO POBLACIÓN COMPLETA DE LA BASE DE DATOS'))
        self.stdout.write(self.style.NOTICE('='*70 + '\n'))

        try:
            # ============ MÓDULO DE USUARIOS ============
            self.stdout.write(self.style.WARNING('\n>>> MÓDULO DE USUARIOS\n'))
            
            # 1. ROLES
            self.import_roles()
            
            # 2. USUARIOS (incluye admin, organizadores, delegados y jugadores)
            self.import_usuarios()
            
            # ============ MÓDULO DEPORTIVO ============
            self.stdout.write(self.style.WARNING('\n>>> MÓDULO DEPORTIVO\n'))
            
            # 3. CATEGORÍAS
            self.import_categorias()
            
            # 4. DEPORTES
            self.import_deportes()
            
            # 5. INSTALACIONES
            self.import_instalaciones()
            
            # 6. EQUIPOS
            self.import_equipos()
            
            # 7. JUGADORES (relación Usuario-Equipo)
            self.import_jugadores()
            
            # ============ MÓDULO DE CAMPEONATOS ============
            self.stdout.write(self.style.WARNING('\n>>> MÓDULO DE CAMPEONATOS\n'))
            
            # 8. CAMPEONATOS
            self.import_campeonatos()
            
            # 9. FIXTURES (JORNADAS)
            self.import_fixtures()
            
            # 10. RESULTADOS
            self.import_resultados()
            
            # 11. PARTIDOS
            self.import_partidos()
            
            # 12. HISTORIALES
            self.import_historiales()
            
            self.stdout.write(self.style.SUCCESS('\n' + '='*70))
            self.stdout.write(self.style.SUCCESS('✓ POBLACIÓN COMPLETADA EXITOSAMENTE'))
            self.stdout.write(self.style.SUCCESS('='*70 + '\n'))

        except FileNotFoundError as e:
            self.stdout.write(self.style.ERROR(f'Error: Archivo no encontrado - {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error durante la importación: {e}'))
            import traceback
            traceback.print_exc()
            raise

    # ========== MÉTODOS DE IMPORTACIÓN DE USUARIOS ==========

    def import_roles(self):
        """Importa roles"""
        file_path = os.path.join(settings.BASE_DIR, 'usuarios', 'data', 'roles.csv')
        self.stdout.write('1. Importando Roles...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f, delimiter='\t')
                created = 0
                updated = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    rol, is_created = Rol.objects.update_or_create(
                        id=int(row['id']),
                        defaults={'Nombre': row['Nombre']}
                    )
                    if is_created:
                        created += 1
                    else:
                        updated += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Roles: {created} creados, {updated} actualizados\n'
            ))

    def import_usuarios(self):
        """Importa usuarios y crea sus roles específicos (Organizador, Delegado, Jugador)"""
        file_path = os.path.join(settings.BASE_DIR, 'usuarios', 'data', 'usuario.csv')
        self.stdout.write('2. Importando Usuarios...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                lines = f.readlines()
                if not lines:
                    self.stdout.write(self.style.WARNING('   ⚠ Archivo usuario.csv está vacío'))
                    return
                
                # Procesar encabezado
                header = lines[0].strip().split('\t')
                
                usuarios_created = 0
                usuarios_updated = 0
                organizadores_created = 0
                delegados_created = 0
                
                for line in lines[1:]:
                    if not line.strip():
                        continue
                    
                    values = line.strip().split('\t')
                    if len(values) != len(header):
                        continue
                    
                    row = dict(zip(header, values))
                    id_rol = int(row['IDRol'])
                    
                    # Hashear la contraseña
                    contrasena_hash = make_password(row['Contrasena'])
                    
                    # Crear o actualizar usuario
                    usuario, created = Usuario.objects.update_or_create(
                        Registro=int(row['Registro']),
                        defaults={
                            'IDRol_id': id_rol,
                            'Nombre': row['Nombre'],
                            'Apellido': row['Apellido'],
                            'Correo': row['Correo'],
                            'Contrasena': contrasena_hash,
                            'Fecha_Nacimiento': parse_date(row['Fecha_Nacimiento']),
                            'Genero': row['Genero'],
                            'Estado': int(row['Estado']),
                        }
                    )
                    
                    if created:
                        usuarios_created += 1
                    else:
                        usuarios_updated += 1
                    
                    # Crear las tablas de herencia según el rol
                    if id_rol == 2:  # Organizador
                        _, org_created = Organizador.objects.get_or_create(IDUsuario=usuario)
                        if org_created:
                            organizadores_created += 1
                    elif id_rol == 3:  # Delegado
                        _, del_created = Delegado.objects.get_or_create(IDUsuario=usuario)
                        if del_created:
                            delegados_created += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Usuarios: {usuarios_created} creados, {usuarios_updated} actualizados'
            ))
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Organizadores: {organizadores_created} creados'
            ))
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Delegados: {delegados_created} creados\n'
            ))

    # ========== MÉTODOS DE IMPORTACIÓN DEPORTIVA ==========

    def import_categorias(self):
        """Importa categorías"""
        file_path = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data', 'categorias.csv')
        self.stdout.write('3. Importando Categorías...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                created = 0
                updated = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    categoria, is_created = Categoria.objects.update_or_create(
                        id=int(row['id']),
                        defaults={'Nombre': row['nombre']}
                    )
                    if is_created:
                        created += 1
                    else:
                        updated += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Categorías: {created} creadas, {updated} actualizadas\n'
            ))

    def import_deportes(self):
        """Importa deportes"""
        file_path = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data', 'deportes.csv')
        self.stdout.write('4. Importando Deportes...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                created = 0
                updated = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    deporte, is_created = Deporte.objects.update_or_create(
                        id=int(row['id']),
                        defaults={
                            'IDCategoria_id': int(row['id_categoria']),
                            'Nombre': row['nombre']
                        }
                    )
                    if is_created:
                        created += 1
                    else:
                        updated += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Deportes: {created} creados, {updated} actualizados\n'
            ))

    def import_instalaciones(self):
        """Importa instalaciones"""
        file_path = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data', 'instalaciones.csv')
        self.stdout.write('5. Importando Instalaciones...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                created = 0
                updated = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    instalacion, is_created = Instalacion.objects.update_or_create(
                        id=int(row['id']),
                        defaults={
                            'Nombre': row['nombre'],
                            'Ubicacion': row['ubicacion'],
                            'Estado': int(row['estado'])
                        }
                    )
                    if is_created:
                        created += 1
                    else:
                        updated += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Instalaciones: {created} creadas, {updated} actualizadas\n'
            ))

    def import_equipos(self):
        """Importa equipos"""
        file_path = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data', 'equipos.csv')
        self.stdout.write('6. Importando Equipos...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                created = 0
                updated = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    try:
                        usuario = Usuario.objects.get(Registro=int(row['id_usuario']))
                        delegado = Delegado.objects.get(IDUsuario=usuario)
                        
                        equipo, is_created = Equipo.objects.update_or_create(
                            id=int(row['id']),
                            defaults={
                                'IDUsuario': delegado,
                                'Nombre': row['nombre'],
                                'Logo': row['logo'],
                                'Estado': int(row['estado'])
                            }
                        )
                        if is_created:
                            created += 1
                        else:
                            updated += 1
                    except (Usuario.DoesNotExist, Delegado.DoesNotExist):
                        pass
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Equipos: {created} creados, {updated} actualizados\n'
            ))

    def import_jugadores(self):
        """Importa jugadores (relación Usuario-Equipo)"""
        file_path = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data', 'usuarios_jugadores.csv')
        self.stdout.write('7. Importando Jugadores...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                created = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    correo = row['correo']
                    id_equipo = int(row['id_equipo'])
                    
                    try:
                        usuario = Usuario.objects.get(Correo=correo)
                        equipo = Equipo.objects.get(id=id_equipo)
                        
                        _, is_created = Jugador.objects.update_or_create(
                            IDUsuario=usuario,
                            defaults={'IDEquipo': equipo}
                        )
                        if is_created:
                            created += 1
                    except (Usuario.DoesNotExist, Equipo.DoesNotExist):
                        pass
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Jugadores: {created} creados\n'
            ))

    # ========== MÉTODOS DE IMPORTACIÓN DE CAMPEONATOS ==========

    def import_campeonatos(self):
        """Importa campeonatos"""
        file_path = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data', 'campeonatos.csv')
        self.stdout.write('8. Importando Campeonatos...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                created = 0
                updated = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    try:
                        usuario = Usuario.objects.get(Registro=int(row['id_usuario']))
                        organizador = Organizador.objects.get(IDUsuario=usuario)
                        
                        campeonato, is_created = Campeonato.objects.update_or_create(
                            id=int(row['id']),
                            defaults={
                                'IDUsuario': organizador,
                                'IDDeporte_id': int(row['id_deporte']),
                                'Nombre': row['nombre'],
                                'Fecha_Inicio': parse_date(row['fecha_inicio']),
                                'Fecha_Fin': parse_date(row['fecha_fin']),
                                'Estado': row['estado']
                            }
                        )
                        if is_created:
                            created += 1
                        else:
                            updated += 1
                    except (Usuario.DoesNotExist, Organizador.DoesNotExist):
                        pass
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Campeonatos: {created} creados, {updated} actualizados\n'
            ))

    def import_fixtures(self):
        """Importa fixtures (jornadas)"""
        file_path = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data', 'fixtures.csv')
        self.stdout.write('9. Importando Fixtures (Jornadas)...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                created = 0
                updated = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    fixture, is_created = Fixture.objects.update_or_create(
                        id=int(row['id']),
                        defaults={
                            'IDCampeonato_id': int(row['id_campeonato']),
                            'Numero': int(row['numero']),
                            'Fecha': parse_date(row['fecha'])
                        }
                    )
                    if is_created:
                        created += 1
                    else:
                        updated += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Fixtures: {created} creados, {updated} actualizados\n'
            ))

    def import_resultados(self):
        """Importa resultados"""
        file_path = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data', 'resultados.csv')
        self.stdout.write('10. Importando Resultados...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                created = 0
                updated = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    resultado, is_created = Resultado.objects.update_or_create(
                        id=int(row['id']),
                        defaults={
                            'Goles_Local': int(row['goles_local']),
                            'Goles_Visitante': int(row['goles_visitante'])
                        }
                    )
                    if is_created:
                        created += 1
                    else:
                        updated += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Resultados: {created} creados, {updated} actualizados\n'
            ))

    def import_partidos(self):
        """Importa partidos"""
        file_path = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data', 'partidos.csv')
        self.stdout.write('11. Importando Partidos...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                created = 0
                updated = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    partido, is_created = Partido.objects.update_or_create(
                        id=int(row['id']),
                        defaults={
                            'IDFixture_id': int(row['id_fixture']),
                            'IDInstalacion_id': int(row['id_instalacion']),
                            'IDResultado_id': int(row['id_resultado']),
                            'IDEquipo_Local_id': int(row['id_equipo_local']),
                            'IDEquipo_Visitante_id': int(row['id_equipo_visitante'])
                        }
                    )
                    if is_created:
                        created += 1
                    else:
                        updated += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Partidos: {created} creados, {updated} actualizados\n'
            ))

    def import_historiales(self):
        """Importa historiales (tablas de posiciones)"""
        file_path = os.path.join(settings.BASE_DIR, 'deporte_bd', 'data', 'historiales.csv')
        self.stdout.write('12. Importando Historiales (Tablas de Posiciones)...')
        
        with transaction.atomic():
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                created = 0
                updated = 0
                
                for row in reader:
                    row = {k.strip(): v for k, v in row.items()}
                    historial, is_created = Historial.objects.update_or_create(
                        id=int(row['id']),
                        defaults={
                            'IDCampeonato_id': int(row['id_campeonato']),
                            'IDEquipo_id': int(row['id_equipo']),
                            'Posicion': int(row['posicion']),
                            'Puntos': int(row['puntos']),
                            'PJ': int(row['pj']),
                            'PG': int(row['pg']),
                            'PE': int(row['pe']),
                            'PP': int(row['pp']),
                            'GF': int(row['gf']),
                            'GC': int(row['gc']),
                            'DG': int(row['dg'])
                        }
                    )
                    if is_created:
                        created += 1
                    else:
                        updated += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ Historiales: {created} creados, {updated} actualizados\n'
            ))
