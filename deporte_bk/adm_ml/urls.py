from django.urls import path
from .views import PredictMatchView, TrainModelView

urlpatterns = [
    path('predecir/', PredictMatchView.as_view(), name='predecir_partido'),
    path('entrenar/', TrainModelView.as_view(), name='entrenar_modelo'),
]
