from django.core.management.base import BaseCommand
from adm_ml.services import MatchPredictor

class Command(BaseCommand):
    help = 'Entrena el modelo de Machine Learning y genera el archivo .pkl'

    def handle(self, *args, **kwargs):
        self.stdout.write("Iniciando entrenamiento del modelo...")
        predictor = MatchPredictor()
        result = predictor.train()
        
        if result.get('status') == 'success':
            self.stdout.write(self.style.SUCCESS(f"Modelo entrenado exitosamente! Accuracy: {result['accuracy']}"))
        else:
            self.stdout.write(self.style.ERROR(f"Error al entrenar: {result.get('message')}"))
