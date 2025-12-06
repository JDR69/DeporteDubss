import csv
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from django.contrib.auth.hashers import make_password
from deporte_bd.models import Rol, Usuario, Organizador, Delegado, Jugador


# Ruta a la carpeta 'data' dentro de la aplicación 'usuarios'
DATA_DIR = os.path.join(settings.BASE_DIR, 'usuarios', 'data')


def parse_date(date_str):
    """Convierte fecha en formato DD/MM/YYYY a objeto date."""
    if not date_str or date_str.strip() == '':
        return None
    try:
        return datetime.strptime(date_str, '%d/%m/%Y').date()
    except ValueError:
        return None


class Command(BaseCommand):
    help = 'Importa datos iniciales desde archivos CSV a los modelos de la app "usuarios".'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('--- INICIANDO IMPORTACIÓN DE DATOS ---'))

        try:
            # Importar Roles
            roles_file = os.path.join(DATA_DIR, 'roles.csv')
            
            with transaction.atomic():
                self.stdout.write('Importando Roles...')
                
                with open(roles_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f, delimiter='\t')
                    roles_created = 0
                    roles_updated = 0
                    
                    for row in reader:
                        rol, created = Rol.objects.update_or_create(
                            id=int(row['id']),
                            defaults={
                                'Nombre': row['Nombre'],
                            }
                        )
                        if created:
                            roles_created += 1
                        else:
                            roles_updated += 1
                
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Roles: {roles_created} creados, {roles_updated} actualizados'
                ))

            # Importar Usuarios
            usuarios_file = os.path.join(DATA_DIR, 'usuario.csv')
            
            with transaction.atomic():
                self.stdout.write('Importando Usuarios...')
                
                with open(usuarios_file, 'r', encoding='utf-8') as f:
                    # Leer el archivo y limpiar los nombres de columna
                    lines = f.readlines()
                    if not lines:
                        self.stdout.write(self.style.WARNING('⚠ Archivo usuario.csv está vacío'))
                        return
                    
                    # Procesar encabezado
                    header = lines[0].strip().split('\t')
                    self.stdout.write(f'  Columnas detectadas: {header}')
                    
                    usuarios_created = 0
                    usuarios_updated = 0
                    organizadores_created = 0
                    delegados_created = 0
                    jugadores_created = 0
                    
                    rows_read = 0
                    for line in lines[1:]:  # Saltar encabezado
                        if not line.strip():
                            continue
                        
                        values = line.strip().split('\t')
                        if len(values) != len(header):
                            self.stdout.write(self.style.WARNING(f'⚠ Fila inválida (columnas esperadas: {len(header)}, recibidas: {len(values)}): {line[:50]}...'))
                            continue
                        
                        row = dict(zip(header, values))
                        rows_read += 1
                        
                        if rows_read <= 3:  # Mostrar primeras 3 filas para debug
                            self.stdout.write(f'  Procesando fila {rows_read}: {row.get("Nombre", "?")} {row.get("Apellido", "?")}...')
                        
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
                        if id_rol == 1:  # Administrador (en realidad no tiene tabla de herencia en tu modelo)
                            pass
                        elif id_rol == 2:  # Organizador
                            _, org_created = Organizador.objects.get_or_create(
                                IDUsuario=usuario
                            )
                            if org_created:
                                organizadores_created += 1
                        elif id_rol == 3:  # Delegado
                            _, del_created = Delegado.objects.get_or_create(
                                IDUsuario=usuario
                            )
                            if del_created:
                                delegados_created += 1
                        elif id_rol == 4:  # Jugador (sin equipo por ahora)
                            # Nota: Jugador requiere IDEquipo, se debe asignar después
                            # Por ahora no creamos jugadores hasta que existan equipos
                            pass
                
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Total de filas leídas: {rows_read}'
                ))
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Usuarios: {usuarios_created} creados, {usuarios_updated} actualizados'
                ))
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Organizadores: {organizadores_created} creados'
                ))
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Delegados: {delegados_created} creados'
                ))
                self.stdout.write(self.style.WARNING(
                    f'⚠ Jugadores: Se omiten por requerir equipos (crear equipos primero)'
                ))

            self.stdout.write(self.style.SUCCESS('\n=== IMPORTACIÓN COMPLETADA EXITOSAMENTE ==='))

        except FileNotFoundError as e:
            self.stdout.write(self.style.ERROR(f'Error: Archivo no encontrado - {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error durante la importación: {e}'))
            raise
