import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Loading from '../components/loading';
import { getEquipos, getPartidos, getCampeonatos, getHistoriales } from '../api/auth';

const DelegadoDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myTeam: null,
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    position: '-',
    points: 0
  });
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [equipos, partidos, campeonatos, historiales] = await Promise.all([
        getEquipos(),
        getPartidos(),
        getCampeonatos(),
        getHistoriales()
      ]);

      // Encontrar equipo del delegado
      const myTeam = equipos.find(e => e.IDUsuario === user?.id);
      
      if (myTeam) {
        // Partidos del equipo
        const teamMatches = partidos.filter(
          p => p.IDEquipo_Local === myTeam.IDEquipo || p.IDEquipo_Visitante === myTeam.IDEquipo
        );

        // Calcular estadísticas (esto es básico, se puede mejorar con resultados reales)
        const completedMatches = teamMatches.filter(p => p.IDResultado);
        
        // Buscar posición en historial
        const teamHistory = historiales.find(h => h.IDEquipo === myTeam.IDEquipo);

        setStats({
          myTeam: myTeam.Nombre,
          totalMatches: teamMatches.length,
          wins: 0, // Se calcularía con resultados
          losses: 0,
          draws: 0,
          position: teamHistory?.Posicion || '-',
          points: teamHistory?.Puntos || 0
        });

        setRecentMatches(teamMatches.slice(-5));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Delegado</h1>
          <p className="text-gray-600 mt-2">Bienvenido, {user?.nombre} {user?.apellido}</p>
          {stats.myTeam && (
            <p className="text-lg font-semibold text-green-600 mt-1">Equipo: {stats.myTeam}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Partidos"
            value={stats.totalMatches}
            icon="⚽"
            color="blue"
            subtitle="Jugados"
          />
          <StatCard
            title="Posición"
            value={stats.position}
            icon="🏅"
            color="yellow"
            subtitle="En la tabla"
          />
          <StatCard
            title="Puntos"
            value={stats.points}
            icon="⭐"
            color="green"
            subtitle="Acumulados"
          />
          <StatCard
            title="Victorias"
            value={stats.wins}
            icon="🎯"
            color="purple"
            subtitle="Partidos ganados"
          />
        </div>

        {/* Quick Actions & Recent Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/equipo"
                className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">⚽</div>
                <div className="font-semibold text-green-700">Mi Equipo</div>
              </Link>
              <Link
                to="/campeonatos"
                className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-semibold text-blue-700">Campeonatos</div>
              </Link>
              <Link
                to="/partidos"
                className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">📅</div>
                <div className="font-semibold text-purple-700">Ver Partidos</div>
              </Link>
              <Link
                to="/historial"
                className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">📊</div>
                <div className="font-semibold text-yellow-700">Tabla de Posiciones</div>
              </Link>
            </div>
          </div>

          {/* Recent Matches */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Partidos Recientes</h2>
            <div className="space-y-4">
              {recentMatches.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay partidos registrados para tu equipo</p>
              ) : (
                recentMatches.map((partido) => (
                  <div key={partido.IDPartido} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">
                          Equipo {partido.IDEquipo_Local} vs Equipo {partido.IDEquipo_Visitante}
                        </span>
                        {partido.IDResultado ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Finalizado
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Próximo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Instalación: {partido.IDInstalacion}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Rendimiento del Equipo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-green-600 font-medium">Victorias</p>
              <p className="text-3xl font-bold text-green-700 mt-2">{stats.wins}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600 font-medium">Empates</p>
              <p className="text-3xl font-bold text-gray-700 mt-2">{stats.draws}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-sm text-red-600 font-medium">Derrotas</p>
              <p className="text-3xl font-bold text-red-700 mt-2">{stats.losses}</p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {!stats.myTeam && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-800">
                <strong>Atención:</strong> No tienes un equipo asignado. Contacta con el administrador 
                para que te asigne un equipo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DelegadoDashboard;
