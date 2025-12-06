from django.urls import path
from .views import AdminSummaryView, bitacora_controllers

urlpatterns = [
    path('admin/summary/', AdminSummaryView.as_view(), name='admin-summary'),
    path('bitacora/', bitacora_controllers.as_view(), name='bitacora'),
]