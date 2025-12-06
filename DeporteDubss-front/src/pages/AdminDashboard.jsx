import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Loading from '../components/loading';
import { getCampeonatos, getEquipos, getPartidos, getUsuarios, getIncidencias } from '../api/auth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChampionships: 0,
    activeChampionships: 0,
    totalTeams: 0,
    totalMatches: 0,
    pendingMatches: 0,
    recentIncidents: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usuarios, campeonatos, equipos, partidos, incidencias] = await Promise.all([
        getUsuarios(),
        getCampeonatos(),
        getEquipos(),
        getPartidos(),
        getIncidencias()
      ]);

      setStats({
        totalUsers: usuarios.length,
        totalChampionships: campeonatos.length,
        activeChampionships: campeonatos.filter(c => c.Estado === 'En Curso').length,
        totalTeams: equipos.length,
        totalMatches: partidos.length,
        pendingMatches: partidos.filter(p => !p.IDResultado).length,
        recentIncidents: incidencias.filter(i => {
          const incidentDate = new Date(i.Fecha);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return incidentDate > weekAgo;
        }).length
      });

      // Actividad reciente
      const activities = [
        ...campeonatos.slice(0, 3).map(c => ({
          type: 'championship',
          title: c.Nombre,
          subtitle: `Estado: ${c.Estado}`,
          time: c.Fecha_Inicio
        })),
        ...incidencias.slice(-5).map(i => ({
          type: 'incident',
          title: 'Nueva incidencia',
          subtitle: i.Descripcion.substring(0, 50) + '...',
          time: i.Fecha
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

      setRecentActivity(activities);
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
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Bienvenido, {user?.nombre} {user?.apellido}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Usuarios"
            value={stats.totalUsers}
            icon="👥"
            color="blue"
            subtitle="Registrados en el sistema"
          />
          <StatCard
            title="Campeonatos Activos"
            value={`${stats.activeChampionships}/${stats.totalChampionships}`}
            icon="🏆"
            color="green"
            subtitle="En curso actualmente"
          />
          <StatCard
            title="Equipos Registrados"
            value={stats.totalTeams}
            icon="⚽"
            color="purple"
            subtitle="Total de equipos"
          />
          <StatCard
            title="Partidos Pendientes"
            value={`${stats.pendingMatches}/${stats.totalMatches}`}
            icon="📅"
            color="yellow"
            subtitle="Sin resultado"
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/usuarios"
                className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">👥</div>
                <div className="font-semibold text-blue-700">Gestionar Usuarios</div>
              </Link>
              <Link
                to="/campeonatos"
                className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-semibold text-green-700">Campeonatos</div>
              </Link>
              <Link
                to="/equipo"
                className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">⚽</div>
                <div className="font-semibold text-purple-700">Ver Equipos</div>
              </Link>
              <Link
                to="/fixtures"
                className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">📅</div>
                <div className="font-semibold text-yellow-700">Gestionar Fixtures</div>
              </Link>
              <Link
                to="/instalaciones"
                className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">🏟️</div>
                <div className="font-semibold text-red-700">Instalaciones</div>
              </Link>
              <Link
                to="/rol-permisos"
                className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-center"
              >
                <div className="text-3xl mb-2">🔐</div>
                <div className="font-semibold text-indigo-700">Roles y Permisos</div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Actividad Reciente</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">
                      {activity.type === 'championship' ? '🏆' : '⚠️'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.subtitle}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.time).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Resumen del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Incidencias (últimos 7 días)</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{stats.recentIncidents}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Campeonatos Finalizados</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {stats.totalChampionships - stats.activeChampionships}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Partidos Completados</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {stats.totalMatches - stats.pendingMatches}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
