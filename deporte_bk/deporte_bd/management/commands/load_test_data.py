# Script para poblar datos de prueba en el sistema

from django.core.management.base import BaseCommand
from deporte_bd.models import Categoria, Deporte, Instalacion, Rol, Usuario
from django.contrib.auth.hashers import make_password


class Command(BaseCommand):
    help = 'Carga datos de prueba en la base de datos'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando carga de datos de prueba...'))

        # Crear Categorías
        categorias_data = [
            'Deportes de Equipo',
            'Deportes Individuales',
            'Deportes de Combate',
            'Deportes Acuáticos',
            'Deportes de Raqueta'
        ]
        
        for nombre in categorias_data:
            categoria, created = Categoria.objects.get_or_create(Nombre=nombre)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Categoría creada: {nombre}'))
            else:
                self.stdout.write(f'  Categoría ya existe: {nombre}')

        # Crear Deportes
        categoria_equipo = Categoria.objects.get(Nombre='Deportes de Equipo')
        categoria_individual = Categoria.objects.get(Nombre='Deportes Individuales')
        categoria_raqueta = Categoria.objects.get(Nombre='Deportes de Raqueta')
        
        deportes_data = [
            ('Fútbol', categoria_equipo),
            ('Baloncesto', categoria_equipo),
            ('Voleibol', categoria_equipo),
            ('Atletismo', categoria_individual),
            ('Natación', categoria_individual),
            ('Tenis', categoria_raqueta),
            ('Tenis de Mesa', categoria_raqueta),
        ]
        
        for nombre, categoria in deportes_data:
            deporte, created = Deporte.objects.get_or_create(
                Nombre=nombre,
                defaults={'IDCategoria': categoria}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Deporte creado: {nombre}'))
            else:
                self.stdout.write(f'  Deporte ya existe: {nombre}')

        # Crear Instalaciones
        instalaciones_data = [
            ('Cancha Principal', 'Edificio A - Piso 1', 1),
            ('Cancha Auxiliar', 'Edificio A - Piso 2', 1),
            ('Gimnasio', 'Edificio B', 1),
            ('Piscina Olímpica', 'Edificio C', 1),
            ('Pista de Atletismo', 'Exterior', 1),
        ]
        
        for nombre, ubicacion, estado in instalaciones_data:
            instalacion, created = Instalacion.objects.get_or_create(
                Nombre=nombre,
                defaults={'Ubicacion': ubicacion, 'Estado': estado}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Instalación creada: {nombre}'))
            else:
                self.stdout.write(f'  Instalación ya existe: {nombre}')

        # Crear Roles
        roles_data = [
            'Administrador',
            'Organizador',
            'Delegado',
            'Jugador'
        ]
        
        for nombre in roles_data:
            rol, created = Rol.objects.get_or_create(Nombre=nombre)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Rol creado: {nombre}'))
            else:
                self.stdout.write(f'  Rol ya existe: {nombre}')

        # Crear Usuario Admin de prueba
        try:
            rol_admin = Rol.objects.get(Nombre='Administrador')
            usuario, created = Usuario.objects.get_or_create(
                Correo='admin@deportedubss.com',
                defaults={
                    'IDRol': rol_admin,
                    'Nombre': 'Admin',
                    'Apellido': 'Sistema',
                    'Contrasena': make_password('admin123'),
                    'Genero': 'O',
                    'Estado': 1
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Usuario admin creado'))
                self.stdout.write(self.style.WARNING(f'  Email: admin@deportedubss.com'))
                self.stdout.write(self.style.WARNING(f'  Password: admin123'))
            else:
                self.stdout.write(f'  Usuario admin ya existe')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al crear usuario admin: {e}'))

        self.stdout.write(self.style.SUCCESS('\n¡Datos de prueba cargados exitosamente!'))
