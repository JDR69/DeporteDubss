import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os
from django.conf import settings
from django.db.models import Q
from deporte_bd.models import Partido, Equipo

class MatchPredictor:
    def __init__(self):
        self.model_path = os.path.join(settings.BASE_DIR, 'adm_ml', 'models_ml', 'match_predictor.pkl')
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"Error loading model: {e}")
                self.model = None

    def _get_team_stats(self, team_id, date_limit=None):
        """
        Calcula estadísticas históricas de un equipo hasta una fecha dada (opcional).
        """
        query = Q(IDEquipo_Local_id=team_id) | Q(IDEquipo_Visitante_id=team_id)
        partidos = Partido.objects.filter(query).select_related('IDResultado')
        
        if date_limit:
            # Asumiendo que Partido tiene fecha a través de Fixture
            partidos = partidos.filter(IDFixture__Fecha__lt=date_limit)

        # Filtrar solo partidos jugados (con resultado)
        partidos = [p for p in partidos if p.IDResultado]

        if not partidos:
            return {
                'avg_goals_scored': 0,
                'avg_goals_conceded': 0,
                'win_rate': 0
            }

        goals_scored = 0
        goals_conceded = 0
        wins = 0
        total_matches = len(partidos)

        for p in partidos:
            is_local = p.IDEquipo_Local_id == team_id
            g_scored = p.IDResultado.Goles_Local if is_local else p.IDResultado.Goles_Visitante
            g_conceded = p.IDResultado.Goles_Visitante if is_local else p.IDResultado.Goles_Local
            
            goals_scored += g_scored
            goals_conceded += g_conceded

            if g_scored > g_conceded:
                wins += 1

        return {
            'avg_goals_scored': goals_scored / total_matches,
            'avg_goals_conceded': goals_conceded / total_matches,
            'win_rate': wins / total_matches
        }

    def prepare_dataset(self):
        """
        Construye el dataset de entrenamiento basado en todos los partidos jugados.
        """
        partidos = Partido.objects.select_related('IDResultado', 'IDFixture').all()
        data = []

        for p in partidos:
            if not p.IDResultado or not p.IDFixture.Fecha:
                continue

            # Calcular estadísticas PREVIAS a este partido
            local_stats = self._get_team_stats(p.IDEquipo_Local_id, p.IDFixture.Fecha)
            visit_stats = self._get_team_stats(p.IDEquipo_Visitante_id, p.IDFixture.Fecha)

            # Target: 0 = Local Gana, 1 = Empate, 2 = Visitante Gana
            if p.IDResultado.Goles_Local > p.IDResultado.Goles_Visitante:
                result = 0
            elif p.IDResultado.Goles_Local == p.IDResultado.Goles_Visitante:
                result = 1
            else:
                result = 2

            row = {
                'local_avg_goals_scored': local_stats['avg_goals_scored'],
                'local_avg_goals_conceded': local_stats['avg_goals_conceded'],
                'local_win_rate': local_stats['win_rate'],
                'visit_avg_goals_scored': visit_stats['avg_goals_scored'],
                'visit_avg_goals_conceded': visit_stats['avg_goals_conceded'],
                'visit_win_rate': visit_stats['win_rate'],
                'target': result
            }
            data.append(row)

        return pd.DataFrame(data)

    def train(self):
        """
        Entrena el modelo y lo guarda.
        """
        df = self.prepare_dataset()
        
        if df.empty or len(df) < 10: # Mínimo de datos requeridos
            return {"status": "error", "message": "Insuficientes datos para entrenar (mínimo 10 partidos jugados)."}

        X = df.drop('target', axis=1)
        y = df['target']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)

        # Evaluar
        predictions = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)

        # Guardar
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)

        return {"status": "success", "accuracy": accuracy, "samples": len(df)}

    def predict(self, local_team_id, visit_team_id):
        """
        Predice el resultado entre dos equipos.
        """
        if not self.model:
            # Intentar entrenar si no hay modelo cargado
            result = self.train()
            if result['status'] == 'error':
                return None

        local_stats = self._get_team_stats(local_team_id)
        visit_stats = self._get_team_stats(visit_team_id)

        features = pd.DataFrame([{
            'local_avg_goals_scored': local_stats['avg_goals_scored'],
            'local_avg_goals_conceded': local_stats['avg_goals_conceded'],
            'local_win_rate': local_stats['win_rate'],
            'visit_avg_goals_scored': visit_stats['avg_goals_scored'],
            'visit_avg_goals_conceded': visit_stats['avg_goals_conceded'],
            'visit_win_rate': visit_stats['win_rate']
        }])

        # Probabilidades: [Local, Empate, Visitante]
        probs = self.model.predict_proba(features)[0]
        
        return {
            'local_win_prob': round(probs[0] * 100, 1),
            'draw_prob': round(probs[1] * 100, 1),
            'visit_win_prob': round(probs[2] * 100, 1)
        }
