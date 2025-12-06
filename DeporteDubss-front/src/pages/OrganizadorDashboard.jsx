import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Loading from '../components/loading';
import { getCampeonatos, getPartidos, getFixtures, getResultados } from '../api/auth';

const OrganizadorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myCampeonatos: 0,
    activeCampeonatos: 0,
    totalPartidos: 0,
    pendingResults: 0
  });
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [campeonatos, partidos, resultados] = await Promise.all([
        getCampeonatos(),
        getPartidos(),
        getResultados()
      ]);

      // Filtrar campeonatos del organizador actual
      const myCampeonatos = campeonatos.filter(c => c.IDUsuario === user?.id);
      
      setStats({
        myCampeonatos: myCampeonatos.length,
        activeCampeonatos: myCampeonatos.filter(c => c.Estado === 'En Curso').length,
        totalPartidos: partidos.length,
        pendingResults: partidos.filter(p => !p.IDResultado).length
      });

      // Próximos partidos (últimos 5)
      setUpcomingMatches(partidos.slice(-5));
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
          <h1 className="text-3xl font-bold text-gray-800">Panel de Organizador</h1>
          <p className="text-gray-600 mt-2">Bienvenido, {user?.nombre} {user?.apellido}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Mis Campeonatos"
            value={stats.myCampeonatos}
            icon="🏆"
            color="green"
            subtitle="Campeonatos organizados"
          />
          <StatCard
            title="Campeonatos Activos"
            value={stats.activeCampeonatos}
            icon="🎯"
            color="blue"
            subtitle="En curso"
          />
          <StatCard
            title="Total Partidos"
            value={stats.totalPartidos}
            icon="⚽"
            color="purple"
            subtitle="Registrados"
          />
          <StatCard
            title="Resultados Pendientes"
            value={stats.pendingResults}
            icon="📋"
            color="yellow"
            subtitle="Por registrar"
          />
        </div>

        {/* Quick Actions & Upcoming Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/campeonatos"
                className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-semibold text-green-700">Mis Campeonatos</div>
              </Link>
              <Link
                to="/fixtures"
                className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">📅</div>
                <div className="font-semibold text-blue-700">Gestionar Fixtures</div>
              </Link>
              <Link
                to="/partidos"
                className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">⚽</div>
                <div className="font-semibold text-purple-700">Partidos</div>
              </Link>
              <Link
                to="/resultados"
                className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">📊</div>
                <div className="font-semibold text-yellow-700">Registrar Resultados</div>
              </Link>
              <Link
                to="/historial"
                className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">📈</div>
                <div className="font-semibold text-red-700">Tabla de Posiciones</div>
              </Link>
              <Link
                to="/incidencias"
                className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">⚠️</div>
                <div className="font-semibold text-indigo-700">Incidencias</div>
              </Link>
            </div>
          </div>

          {/* Upcoming/Recent Matches */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Partidos Recientes</h2>
            <div className="space-y-4">
              {upcomingMatches.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay partidos registrados</p>
              ) : (
                upcomingMatches.map((partido) => (
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
                            Pendiente
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

        {/* Información adicional */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Gestión de Campeonatos</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-800">
              <strong>Nota:</strong> Como organizador, puedes crear y gestionar campeonatos, fixtures, 
              partidos, resultados e incidencias. Mantén la información actualizada para una mejor 
              experiencia de todos los participantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizadorDashboard;
