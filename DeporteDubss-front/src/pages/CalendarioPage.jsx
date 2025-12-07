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
  const [jornadaActual, setJornadaActual] = useState(0);

  useEffect(() => {
    cargarCampeonatos();
  }, []);

  useEffect(() => {
    // Resetear la jornada cuando cambia el campeonato
    setJornadaActual(0);
  }, [campeonatoSeleccionado]);

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
      filtrados = filtrados.filter(c => {
        const deporteNombre = c.IDDeporte?.Nombre || c.IDDeporte;
        return deporteNombre === filtroDeporte;
      });
    }

    return filtrados;
  };

  const obtenerDeportes = () => {
    const deportes = new Set();
    campeonatos.forEach(c => {
      const deporte = c.IDDeporte?.Nombre;
      if (deporte && typeof deporte === 'string') {
        deportes.add(deporte);
      }
    });
    return Array.from(deportes).sort();
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <style>{`
        button:focus {
          outline: none !important;
        }
        button:focus-visible {
          outline: none !important;
        }
      `}</style>
      <Loading show={loading} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-3">Calendario de Campeonatos</h1>
          <p className="text-lg text-indigo-600">Consulta fechas y partidos de los campeonatos</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-indigo-200">
          <h2 className="text-xl font-bold text-indigo-900 mb-5 pb-3 border-b-2 border-indigo-100">Filtros de Búsqueda</h2>
          
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
              <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-indigo-100">
                <h2 className="text-xl font-bold text-indigo-900">Campeonatos</h2>
                <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  {campeonatosFiltrados.length}
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {campeonatosFiltrados.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="text-2xl font-bold text-gray-400 mb-2">Sin resultados</div>
                    <p className="text-gray-500">No se encontraron campeonatos con los filtros seleccionados</p>
                  </div>
                ) : (
                  campeonatosFiltrados.map(camp => (
                    <button
                      key={camp.id}
                      onClick={() => solicitarCalendario(camp.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 focus:outline-none ${
                        campeonatoSeleccionado === camp.id
                          ? 'bg-linear-to-r from-indigo-500 to-blue-500 shadow-xl border-2 border-indigo-600'
                          : 'bg-white border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400 hover:shadow-md hover:scale-[1.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {camp.Logo ? (
                          <img src={camp.Logo} alt={camp.Nombre} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                        ) : (
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${
                            campeonatoSeleccionado === camp.id
                              ? 'bg-white/30 text-white'
                              : 'bg-linear-to-r from-indigo-200 to-blue-200 text-indigo-700'
                          }`}>
                            {camp.Nombre?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold truncate ${
                            campeonatoSeleccionado === camp.id ? 'text-white' : 'text-indigo-900'
                          }`}>
                            {camp.Nombre}
                          </h3>
                          <p className={`text-xs ${
                            campeonatoSeleccionado === camp.id ? 'text-white/90' : 'text-indigo-600'
                          }`}>
                            {camp.IDDeporte?.Nombre || camp.IDDeporte}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              campeonatoSeleccionado === camp.id
                                ? 'bg-white/30 text-white'
                                : camp.Estado === 'En Curso' ? 'bg-green-100 text-green-700 border border-green-300' :
                                  camp.Estado === 'Finalizado' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                                  'bg-yellow-100 text-yellow-700 border border-yellow-300'
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
              <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-200 overflow-hidden">
                <div className="p-12 text-center">
                  <div className="max-w-lg mx-auto">
                    <div className="relative w-32 h-32 mx-auto mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl opacity-20 animate-pulse"></div>
                      <div className="absolute inset-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl opacity-40 transform rotate-45"></div>
                      <div className="absolute inset-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl"></div>
                    </div>
                    <h3 className="text-3xl font-bold text-indigo-900 mb-4">Selecciona un Campeonato</h3>
                    <p className="text-lg text-indigo-700 leading-relaxed mb-8">
                      Elige un campeonato de la lista para visualizar su calendario completo, jornadas y todos los partidos programados
                    </p>
                    <div className="flex items-center justify-center gap-3 px-6 py-3 bg-indigo-50 border-2 border-indigo-200 rounded-xl text-indigo-700 font-semibold">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                      <span>Selecciona un campeonato de la lista</span>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Info del Campeonato */}
                <div className="bg-linear-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center gap-4">
                    {detalleCampeonato.Logo ? (
                      <img src={detalleCampeonato.Logo} alt={detalleCampeonato.Nombre} className="w-16 h-16 rounded-xl" />
                    ) : (
                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">
                        {detalleCampeonato.Nombre?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3">{detalleCampeonato.Nombre}</h2>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="bg-white/20 px-3 py-1 rounded-lg font-semibold">
                          Deporte: {detalleCampeonato.Deporte?.Nombre}
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-lg font-semibold">
                          Categoría: {detalleCampeonato.Categoria?.Nombre}
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-lg font-semibold">
                          {detalleCampeonato.Fecha_Inicio} - {detalleCampeonato.Fecha_Fin}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendario de Partidos */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-indigo-900 mb-4">Calendario de Jornadas</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setJornadaActual(Math.max(0, jornadaActual - 1))}
                        disabled={jornadaActual === 0}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none ${
                          jornadaActual === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-lg transform hover:scale-105 active:scale-95'
                        }`}
                      >
                        ← Jornada Anterior
                      </button>
                      <div className="px-6 py-3 bg-linear-to-r from-indigo-500 to-blue-500 text-white rounded-xl font-bold text-center shadow-md min-w-[200px]">
                        <div className="text-sm opacity-90">Jornada</div>
                        <div className="text-2xl">{jornadaActual + 1} / {fechasJuego.length}</div>
                      </div>
                      <button
                        onClick={() => setJornadaActual(Math.min(fechasJuego.length - 1, jornadaActual + 1))}
                        disabled={jornadaActual >= fechasJuego.length - 1}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none ${
                          jornadaActual >= fechasJuego.length - 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-lg transform hover:scale-105 active:scale-95'
                        }`}
                      >
                        Siguiente Jornada →
                      </button>
                    </div>
                  </div>

                  {fechasJuego.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      </div>
                      <p className="text-xl font-semibold text-gray-400 mb-2">Sin partidos programados</p>
                      <p className="text-gray-500">Este campeonato aún no tiene partidos registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {fechasJuego.slice(jornadaActual, jornadaActual + 1).map(([fecha, partidos]) => (
                        <div key={fecha}>
                          <div className="bg-linear-to-r from-indigo-500 to-blue-500 rounded-xl p-4 mb-4 text-center">
                            <div className="text-white font-bold text-lg">
                              {fecha === 'Sin fecha' ? 'Fecha por confirmar' : new Date(fecha).toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>

                          <div className="grid gap-4">
                            {partidos.map(partido => (
                              <div key={partido.id} className="p-5 border-2 border-indigo-100 rounded-xl bg-white hover:border-indigo-300 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01]">
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
                                  <div className="mt-3 text-center">
                                    <span className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold border border-indigo-200">
                                      Instalación: {partido.Instalacion}
                                    </span>
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
                    <h3 className="text-xl font-bold text-indigo-900 mb-5 pb-3 border-b-2 border-indigo-100">Equipos Participantes</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {detalleCampeonato.Equipos.map(equipo => (
                        <div key={equipo.id} className="p-3 border-2 border-indigo-100 rounded-lg flex items-center gap-3 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer">
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
