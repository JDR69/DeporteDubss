from django.urls import path
from .views import CategoriaViewSet, InstalacionViewSet, DeporteViewSet

# Explicit routes to avoid DRF router registering the same converter multiple times
categoria_list = CategoriaViewSet.as_view({'get': 'list', 'post': 'create'})
categoria_detail = CategoriaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

instalacion_list = InstalacionViewSet.as_view({'get': 'list', 'post': 'create'})
instalacion_detail = InstalacionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

deporte_list = DeporteViewSet.as_view({'get': 'list', 'post': 'create'})
deporte_detail = DeporteViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

urlpatterns = [
    path('categorias/', categoria_list, name='categoria-list'),
    path('categorias/<int:pk>/', categoria_detail, name='categoria-detail'),
    path('instalaciones/', instalacion_list, name='instalacion-list'),
    path('instalaciones/<int:pk>/', instalacion_detail, name='instalacion-detail'),
    path('deportes/', deporte_list, name='deporte-list'),
    path('deportes/<int:pk>/', deporte_detail, name='deporte-detail'),
]
