import React, { useState, useEffect } from 'react';
import { obtenerLogsFiltrados } from '../api/admin';

const BitacoraPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    fecha: '',
    usuario: '',
    accion: ''
  });

  // Cargar logs al montar y cuando cambien los filtros
  useEffect(() => {
    solicitarLogs();
  }, []);

  const solicitarLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerLogsFiltrados(filtros);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      console.error('Error al obtener logs:', err);
      setError('Error al cargar la bitácora');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const aplicarFiltros = () => {
    solicitarLogs();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha: '',
      usuario: '',
      accion: ''
    });
    // Forzar recarga sin filtros
    setTimeout(() => {
      obtenerLogsFiltrados({}).then(data => {
        setLogs(data.logs);
        setTotal(data.total);
      });
    }, 100);
  };

  const consultarDatos = (logId) => {
    const log = logs.find(l => l.id === logId);
    if (log) {
      alert(`Detalle completo:\n\nUsuario: ${log.usuario.nombre} ${log.usuario.apellido}\nCorreo: ${log.usuario.correo}\nRol: ${log.usuario.rol}\nAcción: ${log.accion}\nFecha: ${new Date(log.fecha).toLocaleString()}\nDetalle: ${log.detalle || 'N/A'}`);
    }
  };

  const consultarPorCriterio = (criterio, valor) => {
    setFiltros(prev => ({
      ...prev,
      [criterio]: valor
    }));
    // Auto-aplicar
    obtenerLogsFiltrados({ ...filtros, [criterio]: valor }).then(data => {
      setLogs(data.logs);
      setTotal(data.total);
    });
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getAccionBadge = (accion) => {
    const badges = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      crear: 'bg-blue-100 text-blue-800',
      editar: 'bg-yellow-100 text-yellow-800',
      eliminar: 'bg-red-100 text-red-800',
    };
    
    const accionLower = accion.toLowerCase();
    for (const [key, value] of Object.entries(badges)) {
      if (accionLower.includes(key)) {
        return value;
      }
    }
    return 'bg-indigo-100 text-indigo-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-gray-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">📋 Gestión de Bitácora</h1>
          <p className="text-slate-200 text-lg">
            Análisis CU19 - Visualización y filtrado de eventos del sistema
          </p>
        </div>

        {/* Sección de filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🔍 Filtros de Búsqueda
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Filtro por fecha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Fecha
              </label>
              <input
                type="date"
                name="fecha"
                value={filtros.fecha}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              />
            </div>

            {/* Filtro por usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Usuario (nombre/correo)
              </label>
              <input
                type="text"
                name="usuario"
                value={filtros.usuario}
                onChange={handleFiltroChange}
                placeholder="Buscar usuario..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              />
            </div>

            {/* Filtro por acción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⚡ Acción
              </label>
              <input
                type="text"
                name="accion"
                value={filtros.accion}
                onChange={handleFiltroChange}
                placeholder="login, crear, editar..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={aplicarFiltros}
              className="bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-700 transition shadow-md"
            >
              🔎 Aplicar Filtros
            </button>
            <button
              onClick={limpiarFiltros}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>

        {/* Contador de resultados */}
        {!loading && (
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded-lg">
            <p className="text-indigo-800 font-semibold">
              📊 Total de registros encontrados: <span className="text-2xl">{total}</span>
            </p>
          </div>
        )}

        {/* Estado de carga */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-500 border-t-transparent"></div>
            <p className="text-gray-600 mt-4 font-semibold">Cargando bitácora...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <p className="text-red-800 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Tabla de logs */}
        {!loading && !error && logs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">ID</th>
                    <th className="px-6 py-4 text-left font-bold">Usuario</th>
                    <th className="px-6 py-4 text-left font-bold">Correo</th>
                    <th className="px-6 py-4 text-left font-bold">Rol</th>
                    <th className="px-6 py-4 text-left font-bold">Acción</th>
                    <th className="px-6 py-4 text-left font-bold">Fecha</th>
                    <th className="px-6 py-4 text-center font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-slate-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                        #{log.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        {log.usuario.nombre} {log.usuario.apellido}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.usuario.correo}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                          {log.usuario.rol || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getAccionBadge(log.accion)}`}>
                          {log.accion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {formatearFecha(log.fecha)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => consultarDatos(log.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-600 transition"
                            title="Ver detalle completo"
                          >
                            👁️ Ver
                          </button>
                          <button
                            onClick={() => consultarPorCriterio('usuario', log.usuario.correo)}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-600 transition"
                            title="Filtrar por este usuario"
                          >
                            🔍 Filtrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !error && logs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No se encontraron registros</h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros o limpia la búsqueda para ver todos los logs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BitacoraPage;
