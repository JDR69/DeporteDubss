# 📋 Implementación de Gestión de Bitácora (CU19)

## Descripción
Sistema completo de visualización y filtrado de logs/eventos del sistema según el diagrama de análisis CU19.

## Arquitectura Implementada

### Backend (Django REST Framework)

#### 1. Modelo de Datos
- **Modelo**: `Bitacora` (ya existía en `deporte_bd/models.py`)
  - `IDUsuario` (ForeignKey a Usuario)
  - `Accion` (CharField - tipo de evento)
  - `Fecha` (DateTimeField - timestamp automático)
  - `Detalle` (TextField - información adicional)

#### 2. Controlador (View)
- **Archivo**: `deporte_bk/reportes/views.py`
- **Clase**: `bitacora_controllers` (APIView)
  - **Método**: `GET`
  - **Endpoint**: `/api/reportes/bitacora/`
  - **Autenticación**: Requiere token JWT

**Funcionalidad**:
- ✅ **filtrarHistorial(fecha, usuario, accion)** - Filtrado múltiple
  - `fecha`: Filtro por fecha específica (formato YYYY-MM-DD)
  - `usuario`: Búsqueda por ID, nombre, apellido o correo
  - `accion`: Filtro por tipo de acción (login, logout, crear, etc.)
- ✅ **solicitarLogs()** - Obtiene registros con optimización (select_related)
- ✅ **consultarDatos()** - Retorna datos completos de cada log
- ✅ **consultarPorCriterio(filtros)** - Aplicación dinámica de filtros con Q objects

**Respuesta**:
```json
{
  "total": 100,
  "logs": [
    {
      "id": 1,
      "usuario": {
        "id": 5,
        "nombre": "Juan",
        "apellido": "Pérez",
        "correo": "juan@mail.com",
        "rol": "Administrador"
      },
      "accion": "login",
      "fecha": "2025-12-06T14:30:00Z",
      "detalle": "Inicio de sesión exitoso"
    }
  ]
}
```

#### 3. URLs
- **Archivo**: `deporte_bk/reportes/urls.py`
- **Ruta**: `path('bitacora/', bitacora_controllers.as_view(), name='bitacora')`

### Frontend (React)

#### 1. API Client
- **Archivo**: `DeporteDubss-front/src/api/admin.js`
- **Función**: `obtenerLogsFiltrados(filtros)`
  - Construye query params dinámicamente
  - Retorna datos deserializados

#### 2. Componente Principal
- **Archivo**: `DeporteDubss-front/src/pages/BitacoraPage.jsx`
- **Nombre**: `BitacoraPage`

**Características**:
- ✅ Interfaz moderna con gradientes slate/gray
- ✅ Sistema de filtros (fecha, usuario, acción)
- ✅ Tabla responsiva con datos completos
- ✅ Badges dinámicos por tipo de acción (colores según evento)
- ✅ Acciones rápidas:
  - 👁️ Ver detalle completo (modal)
  - 🔍 Filtrar por usuario seleccionado
- ✅ Contador de resultados en tiempo real
- ✅ Estados de carga y error
- ✅ Formateo de fechas en español

**Estados**:
- `logs`: Array de registros
- `total`: Contador de resultados
- `loading`: Estado de carga
- `error`: Mensajes de error
- `filtros`: {fecha, usuario, accion}

**Funciones principales**:
- `solicitarLogs()`: Carga inicial y con filtros
- `aplicarFiltros()`: Ejecuta búsqueda con filtros actuales
- `limpiarFiltros()`: Resetea búsqueda
- `consultarDatos(logId)`: Muestra detalle en alert
- `consultarPorCriterio(criterio, valor)`: Filtro rápido desde tabla
- `formatearFecha(iso)`: Convierte ISO a formato español
- `getAccionBadge(accion)`: Asigna colores según tipo

#### 3. Navegación
- **Navbar**: Link "📋 Bitácora" (solo para rol Administrador)
- **AdminDashboard**: Card de acceso rápido "Ver Bitácora"
- **Ruta**: `/bitacora` (protegida con autenticación)

#### 4. Integración en App
- **Archivo**: `DeporteDubss-front/src/App.jsx`
- Ruta protegida: `<ProtectedRoute><BitacoraPage /></ProtectedRoute>`

## Flujo de Uso

### Según Diagrama de Comunicación:

```
1. Administrador → filtrarHistorial(fecha, usuario, accion)
   └─> bitacoraPage

2. bitacoraPage → solicitarLogs()
   └─> bitacora_controllers

3. bitacora_controllers → obtenerLogsFiltrados(filtros)
   └─> Bitacora (modelo)

4. bitacora_controllers → consultarDatos()
   └─> retorna logs filtrados

5. bitacoraPage → consultarPorCriterio(filtros)
   └─> actualiza vista con resultados
```

## Permisos y Seguridad
- ✅ Solo accesible para rol **Administrador** (rol === 1 o "admin")
- ✅ Backend requiere autenticación JWT (`IsAuthenticated`)
- ✅ Navbar y rutas ocultas para otros roles
- ✅ Ruta protegida con `<ProtectedRoute>`

## Filtros Disponibles

### 1. Filtro por Fecha
- Input tipo `date`
- Formato: YYYY-MM-DD
- Filtra logs de ese día específico

### 2. Filtro por Usuario
- Input de texto libre
- Búsqueda por:
  - ID (si es número)
  - Nombre (parcial, case-insensitive)
  - Apellido (parcial, case-insensitive)
  - Correo (parcial, case-insensitive)

### 3. Filtro por Acción
- Input de texto libre
- Busca coincidencias parciales en el campo Acción
- Ejemplos: "login", "crear", "editar", "eliminar"

### Combinación de Filtros
- Todos los filtros son opcionales
- Se pueden combinar (AND lógico)
- Botón "Limpiar" resetea todos los filtros

## Características de UI/UX

### Diseño
- Paleta: Slate-Gray con acentos
- Gradientes modernos en header
- Cards con sombras y hover effects
- Badges de color según tipo de acción:
  - 🟢 Login (verde)
  - ⚫ Logout (gris)
  - 🔵 Crear (azul)
  - 🟡 Editar (amarillo)
  - 🔴 Eliminar (rojo)
  - 🟣 Otros (índigo)

### Responsive
- Grid adaptativo para filtros (1 col móvil, 3 cols desktop)
- Tabla con scroll horizontal en móviles
- Botones con tamaños touch-friendly

### Estados
- Loading spinner durante carga
- Mensaje de error con borde rojo
- Panel azul con contador de resultados
- Vista vacía con ilustración cuando no hay datos

## Ejemplos de Uso

### 1. Ver todos los logs
```
- Dejar filtros vacíos
- Click en "Aplicar Filtros" o cargar página
```

### 2. Buscar logins del día
```
- Fecha: 2025-12-06
- Acción: login
- Click "Aplicar Filtros"
```

### 3. Ver actividad de un usuario
```
- Usuario: juan@mail.com
- Click "Aplicar Filtros"
```

### 4. Filtro rápido desde tabla
```
- Click en botón "🔍 Filtrar" de cualquier fila
- Autocompleta el filtro de usuario
- Recarga resultados
```

### 5. Ver detalle completo
```
- Click en botón "👁️ Ver" de cualquier fila
- Muestra alert con toda la información
```

## Testing

### Backend
```bash
cd deporte_bk
python manage.py shell

# Crear log de prueba
from deporte_bd.models import Bitacora, Usuario
user = Usuario.objects.first()
Bitacora.objects.create(IDUsuario=user, Accion='login', Detalle='Prueba')

# Probar endpoint
python manage.py runserver
# GET http://localhost:8000/api/reportes/bitacora/
# GET http://localhost:8000/api/reportes/bitacora/?fecha=2025-12-06
# GET http://localhost:8000/api/reportes/bitacora/?usuario=admin
# GET http://localhost:8000/api/reportes/bitacora/?accion=login
```

### Frontend
```bash
cd DeporteDubss-front
npm run dev

# Navegar a http://localhost:5173/bitacora
# Probar filtros
# Verificar tabla y botones
```

## Nombres según Diagrama
✅ **bitacora_controllers** - Nombre del controlador backend (clase APIView)
✅ **BitacoraPage** - Nombre del componente frontend (interface)
✅ Funciones coinciden con el diagrama:
  - filtrarHistorial()
  - solicitarLogs()
  - obtenerLogsFiltrados()
  - consultarDatos()
  - consultarPorCriterio()

## Archivos Modificados/Creados

### Backend
- ✅ `deporte_bk/reportes/views.py` - Agregada clase `bitacora_controllers`
- ✅ `deporte_bk/reportes/urls.py` - Agregada ruta `/bitacora/`

### Frontend
- ✅ `DeporteDubss-front/src/pages/BitacoraPage.jsx` - Componente principal (NUEVO)
- ✅ `DeporteDubss-front/src/api/admin.js` - Función `obtenerLogsFiltrados()`
- ✅ `DeporteDubss-front/src/App.jsx` - Importación y ruta `/bitacora`
- ✅ `DeporteDubss-front/src/components/navbar/Navbar.jsx` - Link de navegación
- ✅ `DeporteDubss-front/src/pages/AdminDashboard.jsx` - Card de acceso rápido

## Estado
✅ **Implementación completa y funcional**
✅ Backend operativo con filtros
✅ Frontend con UI moderna
✅ Integración con autenticación
✅ Permisos configurados (solo admin)
✅ Nombres según diagrama de análisis

## Próximos Pasos (Opcional)
- [ ] Paginación para grandes volúmenes de datos
- [ ] Export a CSV/Excel
- [ ] Gráficos de actividad por período
- [ ] Filtro por rango de fechas (inicio-fin)
- [ ] Búsqueda avanzada con operadores AND/OR
