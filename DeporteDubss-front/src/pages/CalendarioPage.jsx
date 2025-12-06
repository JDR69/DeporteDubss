import React, { useState, useEffect } from 'react';
import { getCampeonatos, getCampeonatoDetalle } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/loading';

function CalendarioPage() {
  const { user } = useAuth();
  const [campeonatos, setCampeonatos] = useState([]);
  const [campeonatoSeleccionado, setCampeonatoSeleccionado] = useState(null);
  const [detalleCampeonato, setDetalleCampeonato] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // todos, activos, finalizados, pendientes
  const [filtroDeporte, setFiltroDeporte] = useState('todos');
  const [vistaCalendario, setVistaCalendario] = useState('lista'); // lista, calendario

  useEffect(() => {
    cargarCampeonatos();
  }, []);

  const cargarCampeonatos = async () => {
    setLoading(true);
    try {
      const { data } = await getCampeonatos();
      setCampeonatos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando campeonatos:', err);
    }
    setLoading(false);
  };

  const solicitarCalendario = async (campeonatoId) => {
    setLoading(true);
    setCampeonatoSeleccionado(campeonatoId);
    try {
      const { data } = await getCampeonatoDetalle(campeonatoId);
      setDetalleCampeonato(data);
    } catch (err) {
      console.error('Error obteniendo calendario:', err);
    }
    setLoading(false);
  };

  const filtrarCampeonatos = () => {
    let filtrados = [...campeonatos];

    // Filtrar por tipo/estado
    if (filtroTipo !== 'todos') {
      filtrados = filtrados.filter(c => {
        if (filtroTipo === 'activos') return c.Estado === 'En Curso';
        if (filtroTipo === 'finalizados') return c.Estado === 'Finalizado';
        if (filtroTipo === 'pendientes') return c.Estado === 'Pendiente';
        return true;
      });
    }

    // Filtrar por deporte
    if (filtroDeporte !== 'todos') {
      filtrados = filtrados.filter(c => 
        c.IDDeporte?.Nombre === filtroDeporte || c.IDDeporte === filtroDeporte
      );
    }

    return filtrados;
  };

  const obtenerDeportes = () => {
    const deportes = new Set();
    campeonatos.forEach(c => {
      const deporte = c.IDDeporte?.Nombre || c.IDDeporte;
      if (deporte) deportes.add(deporte);
    });
    return Array.from(deportes);
  };

  const obtenerFechasJuego = () => {
    if (!detalleCampeonato?.Partidos) return [];
    
    // Agrupar partidos por fecha
    const partidosPorFecha = {};
    detalleCampeonato.Partidos.forEach(partido => {
      const fecha = partido.Fecha || 'Sin fecha';
      if (!partidosPorFecha[fecha]) {
        partidosPorFecha[fecha] = [];
      }
      partidosPorFecha[fecha].push(partido);
    });

    return Object.entries(partidosPorFecha).sort((a, b) => {
      if (a[0] === 'Sin fecha') return 1;
      if (b[0] === 'Sin fecha') return -1;
      return new Date(a[0]) - new Date(b[0]);
    });
  };

  const campeonatosFiltrados = filtrarCampeonatos();
  const fechasJuego = obtenerFechasJuego();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <Loading show={loading} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">📅 Calendario de Campeonatos</h1>
          <p className="text-indigo-700">Consulta fechas y partidos de los campeonatos</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold text-indigo-900">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-indigo-800 font-semibold mb-2 text-sm">
                Seleccionar Filtro (Tipo)
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl bg-indigo-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              >
                <option value="todos">Todos los campeonatos</option>
                <option value="activos">En Curso</option>
                <option value="pendientes">Pendientes</option>
                <option value="finalizados">Finalizados</option>
              </select>
            </div>

            <div>
              <label className="block text-indigo-800 font-semibold mb-2 text-sm">
                Filtrar Calendario (Deporte)
              </label>
              <select
                value={filtroDeporte}
                onChange={(e) => setFiltroDeporte(e.target.value)}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl bg-indigo-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              >
                <option value="todos">Todos los deportes</option>
                {obtenerDeportes().map(deporte => (
                  <option key={deporte} value={deporte}>{deporte}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-indigo-800 font-semibold mb-2 text-sm">
                Vista
              </label>
              <select
                value={vistaCalendario}
                onChange={(e) => setVistaCalendario(e.target.value)}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl bg-indigo-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              >
                <option value="lista">Vista Lista</option>
                <option value="calendario">Vista Calendario</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Campeonatos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-200 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏆</span>
                <h2 className="text-xl font-bold text-indigo-900">Campeonatos</h2>
                <span className="ml-auto bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {campeonatosFiltrados.length}
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {campeonatosFiltrados.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-3">📭</div>
                    <p className="text-gray-500">No hay campeonatos</p>
                  </div>
                ) : (
                  campeonatosFiltrados.map(camp => (
                    <button
                      key={camp.id}
                      onClick={() => solicitarCalendario(camp.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition ${
                        campeonatoSeleccionado === camp.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-indigo-200 bg-white hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {camp.Logo ? (
                          <img src={camp.Logo} alt={camp.Nombre} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-lg flex items-center justify-center text-indigo-700 font-bold">
                            {camp.Nombre?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-indigo-900 truncate">{camp.Nombre}</h3>
                          <p className="text-xs text-indigo-600">{camp.IDDeporte?.Nombre || camp.IDDeporte}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              camp.Estado === 'En Curso' ? 'bg-green-100 text-green-700' :
                              camp.Estado === 'Finalizado' ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {camp.Estado}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel de Calendario */}
          <div className="lg:col-span-2">
            {!detalleCampeonato ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-indigo-200 text-center">
                <div className="text-8xl mb-4">📆</div>
                <h3 className="text-2xl font-bold text-indigo-900 mb-2">Selecciona un Campeonato</h3>
                <p className="text-indigo-600">Elige un campeonato de la lista para ver su calendario y partidos</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Info del Campeonato */}
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center gap-4">
                    {detalleCampeonato.Logo ? (
                      <img src={detalleCampeonato.Logo} alt={detalleCampeonato.Nombre} className="w-16 h-16 rounded-xl" />
                    ) : (
                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">
                        {detalleCampeonato.Nombre?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{detalleCampeonato.Nombre}</h2>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>⚽ {detalleCampeonato.Deporte?.Nombre}</span>
                        <span>🏅 {detalleCampeonato.Categoria?.Nombre}</span>
                        <span>📅 {detalleCampeonato.Fecha_Inicio} - {detalleCampeonato.Fecha_Fin}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendario de Partidos */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📋</span>
                    <h3 className="text-xl font-bold text-indigo-900">Obtener Fechas/Juego</h3>
                    <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {detalleCampeonato.Partidos?.length || 0} partidos
                    </span>
                  </div>

                  {fechasJuego.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-3">⚽</div>
                      <p className="text-gray-500 font-medium">No hay partidos programados</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {fechasJuego.map(([fecha, partidos]) => (
                        <div key={fecha}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-px bg-indigo-200"></div>
                            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-sm">
                              📆 {fecha === 'Sin fecha' ? fecha : new Date(fecha).toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                            <div className="flex-1 h-px bg-indigo-200"></div>
                          </div>

                          <div className="grid gap-3">
                            {partidos.map(partido => (
                              <div key={partido.id} className="p-4 border-2 border-indigo-100 rounded-xl bg-gradient-to-r from-white to-indigo-50 hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 text-right">
                                    <span className="font-bold text-indigo-900 text-lg">{partido.Local}</span>
                                  </div>
                                  
                                  <div className="px-6">
                                    {partido.Resultado ? (
                                      <div className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold text-lg shadow-md">
                                        {partido.Resultado.Goles_Local} - {partido.Resultado.Goles_Visitante}
                                      </div>
                                    ) : (
                                      <div className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-semibold text-sm">
                                        VS
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <span className="font-bold text-indigo-900 text-lg">{partido.Visitante}</span>
                                  </div>
                                </div>

                                {partido.Instalacion && (
                                  <div className="mt-2 text-center text-sm text-indigo-600">
                                    🏟️ {partido.Instalacion}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Equipos Participantes */}
                {detalleCampeonato.Equipos?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">👥</span>
                      <h3 className="text-xl font-bold text-indigo-900">Equipos Participantes</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {detalleCampeonato.Equipos.map(equipo => (
                        <div key={equipo.id} className="p-3 border-2 border-indigo-100 rounded-lg flex items-center gap-2 hover:bg-indigo-50 transition">
                          {equipo.Logo ? (
                            <img src={equipo.Logo} alt={equipo.Nombre} className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-indigo-200 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-sm">
                              {equipo.Nombre?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-semibold text-indigo-900 truncate">{equipo.Nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarioPage;
