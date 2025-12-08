import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os
from django.conf import settings
from django.db.models import Q, Avg, Count, Sum, F, Case, When, IntegerField
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
        Optimizado usando agregación de base de datos.
        """
        # Filter matches where the team played
        query = Q(IDEquipo_Local_id=team_id) | Q(IDEquipo_Visitante_id=team_id)
        
        # Base queryset: Matches with results
        qs = Partido.objects.filter(query, IDResultado__isnull=False).select_related('IDResultado', 'IDFixture')
        
        if date_limit:
            qs = qs.filter(IDFixture__Fecha__lt=date_limit)
            
        # Aggregate stats in DB
        stats = qs.aggregate(
            total_matches=Count('id'),
            goals_scored=Sum(
                Case(
                    When(IDEquipo_Local_id=team_id, then=F('IDResultado__Goles_Local')),
                    When(IDEquipo_Visitante_id=team_id, then=F('IDResultado__Goles_Visitante')),
                    default=0,
                    output_field=IntegerField()
                )
            ),
            goals_conceded=Sum(
                Case(
                    When(IDEquipo_Local_id=team_id, then=F('IDResultado__Goles_Visitante')),
                    When(IDEquipo_Visitante_id=team_id, then=F('IDResultado__Goles_Local')),
                    default=0,
                    output_field=IntegerField()
                )
            ),
            wins=Sum(
                Case(
                    When(IDEquipo_Local_id=team_id, IDResultado__Goles_Local__gt=F('IDResultado__Goles_Visitante'), then=1),
                    When(IDEquipo_Visitante_id=team_id, IDResultado__Goles_Visitante__gt=F('IDResultado__Goles_Local'), then=1),
                    default=0,
                    output_field=IntegerField()
                )
            )
        )
        
        total = stats['total_matches'] or 0
        if total == 0:
            return {
                'avg_goals_scored': 0,
                'avg_goals_conceded': 0,
                'win_rate': 0
            }
            
        return {
            'avg_goals_scored': (stats['goals_scored'] or 0) / total,
            'avg_goals_conceded': (stats['goals_conceded'] or 0) / total,
            'win_rate': (stats['wins'] or 0) / total

    def prepare_dataset(self):
        """
        Construye el dataset de entrenamiento basado en todos los partidos jugados.
        Optimizado para O(N) en lugar de O(N^2).
        """
        # Fetch all matches with results, ordered by date
        partidos = Partido.objects.select_related('IDResultado', 'IDFixture').filter(
            IDResultado__isnull=False,
            IDFixture__Fecha__isnull=False
        ).order_by('IDFixture__Fecha')

        team_stats = {} # {team_id: {gs, gc, w, gp}}
        data = []

        for p in partidos:
            local_id = p.IDEquipo_Local_id
            visit_id = p.IDEquipo_Visitante_id
            
            # Initialize if not exists
            if local_id not in team_stats: team_stats[local_id] = {'gs': 0, 'gc': 0, 'w': 0, 'gp': 0}
            if visit_id not in team_stats: team_stats[visit_id] = {'gs': 0, 'gc': 0, 'w': 0, 'gp': 0}
            
            # Get current stats (features) BEFORE this match
            l_stats = team_stats[local_id]
            v_stats = team_stats[visit_id]
            
            l_gp = l_stats['gp'] if l_stats['gp'] > 0 else 1
            v_gp = v_stats['gp'] if v_stats['gp'] > 0 else 1
            
            row = {
                'local_avg_goals_scored': l_stats['gs'] / l_gp,
                'local_avg_goals_conceded': l_stats['gc'] / l_gp,
                'local_win_rate': l_stats['w'] / l_gp,
                'visit_avg_goals_scored': v_stats['gs'] / v_gp,
                'visit_avg_goals_conceded': v_stats['gc'] / v_gp,
                'visit_win_rate': v_stats['w'] / v_gp,
                'target': 0 # Placeholder
            }
            
            # Determine target and update stats
            g_local = p.IDResultado.Goles_Local
            g_visit = p.IDResultado.Goles_Visitante
            
            if g_local > g_visit:
                row['target'] = 0
                team_stats[local_id]['w'] += 1
            elif g_local == g_visit:
                row['target'] = 1
            else:
                row['target'] = 2
                team_stats[visit_id]['w'] += 1
                
            # Update goals and games played
            team_stats[local_id]['gs'] += g_local
            team_stats[local_id]['gc'] += g_visit
            team_stats[local_id]['gp'] += 1
            
            team_stats[visit_id]['gs'] += g_visit
            team_stats[visit_id]['gc'] += g_local
            team_stats[visit_id]['gp'] += 1
            
            data.append(row)

        return pd.DataFrame(data)

    def train(self):
        """
        Entrena el modelo y lo guarda.
        """
        print("Iniciando entrenamiento del modelo ML...")
        df = self.prepare_dataset()
        
        if df.empty or len(df) < 10: # Mínimo de datos requeridos
            print("Insuficientes datos para entrenar.")
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
        print(f"Modelo entrenado y guardado. Accuracy: {accuracy}")

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
