
from django.urls import path, include
from rest_framework import routers
from .views import RolViewSet, EquipoViewSet, CampeonatoViewSet, DeporteViewSet, CategoriaViewSet, UsuarioViewSet


router = routers.DefaultRouter()
router.register(r'roles', RolViewSet)
router.register(r'equipos', EquipoViewSet)
router.register(r'campeonatos', CampeonatoViewSet)
router.register(r'deportes', DeporteViewSet, basename='deportes')
router.register(r'categorias', CategoriaViewSet, basename='categorias')
router.register(r'usuarios', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path('api/', include(router.urls)),
]
