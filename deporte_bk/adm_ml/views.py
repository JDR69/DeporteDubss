from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .services import MatchPredictor
from deporte_bd.models import Equipo

class PredictMatchView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        local_id = request.data.get('local_id')
        visit_id = request.data.get('visit_id')

        if not local_id or not visit_id:
            return Response(
                {"error": "Se requieren local_id y visit_id"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            predictor = MatchPredictor()
            prediction = predictor.predict(local_id, visit_id)

            if not prediction:
                return Response(
                    {"error": "No hay suficientes datos históricos para realizar una predicción confiable."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Obtener nombres para respuesta más amigable
            local_name = Equipo.objects.get(pk=local_id).Nombre
            visit_name = Equipo.objects.get(pk=visit_id).Nombre

            return Response({
                "match": f"{local_name} vs {visit_name}",
                "prediction": prediction
            })

        except Equipo.DoesNotExist:
            return Response({"error": "Equipo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TrainModelView(APIView):
    """
    Endpoint para forzar el re-entrenamiento del modelo manualmente.
    """
    def post(self, request):
        try:
            predictor = MatchPredictor()
            result = predictor.train()
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
