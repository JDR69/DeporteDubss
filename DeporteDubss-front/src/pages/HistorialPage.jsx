import React, { useState, useEffect } from 'react';
import { getHistoriales, getCampeonatos } from '../api/auth';
import Loading from '../components/loading';
import { 
    generarReporteHistorialPDF, 
    generarReporteHistorialExcel, 
    generarReporteHistorialJSON 
} from '../services/reportService';

function HistorialPage() {
    const [historiales, setHistoriales] = useState([]);
    const [campeonatos, setCampeonatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterCampeonato, setFilterCampeonato] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resHistoriales, resCampeonatos] = await Promise.all([
                getHistoriales(),
                getCampeonatos()
            ]);
            setHistoriales(resHistoriales.data);
            setCampeonatos(resCampeonatos.data);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar datos');
        }
        setLoading(false);
    };

    const filteredHistoriales = filterCampeonato 
        ? historiales.filter(h => (h.IDCampeonato?.id || h.IDCampeonato) == filterCampeonato)
        : historiales;

    // Ordenar por posición
    const sortedHistoriales = [...filteredHistoriales].sort((a, b) => {
        const posA = a.Posicion || 999;
        const posB = b.Posicion || 999;
        return posA - posB;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4">
            <Loading show={loading} message="Procesando..." />
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#065F46] mb-2">Tabla de Posiciones</h1>
                    <p className="text-gray-600">Consulta las clasificaciones de los campeonatos</p>
                </div>

                {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                {/* Selector de Campeonato */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-2 border-[#34D399]">
                    <div className="max-w-2xl mx-auto">
                        <label className="block text-[#065F46] font-bold text-lg mb-3 text-center">
                            Seleccione un Campeonato
                        </label>
                        <select
                            value={filterCampeonato}
                            onChange={(e) => setFilterCampeonato(e.target.value)}
                            className="w-full px-6 py-4 border-2 border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#065F46] transition"
                        >
                            <option value="">-- Seleccione un campeonato --</option>
                            {campeonatos.map(camp => (
                                <option key={camp.id} value={camp.id}>{camp.Nombre}</option>
                            ))}
                        </select>
                        {!filterCampeonato && (
                            <p className="text-center text-gray-500 mt-4 italic">
                                Por favor seleccione un campeonato para ver la tabla de posiciones
                            </p>
                        )}
                    </div>
                </div>

                {/* Tabla de Clasificaciones - Solo se muestra si hay un campeonato seleccionado */}
                {filterCampeonato && (
                    <>
                        {/* Botones de Exportación */}
                        {sortedHistoriales.length > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                                            <span className="text-2xl">📥</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-blue-900">Exportar Tabla de Posiciones</h3>
                                            <p className="text-blue-600 text-sm">Descarga la clasificación en diferentes formatos</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => generarReporteHistorialPDF(
                                            sortedHistoriales,
                                            campeonatos.find(c => c.id == filterCampeonato)?.Nombre
                                        )}
                                        className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Exportar PDF
                                    </button>
                                    <button
                                        onClick={() => generarReporteHistorialExcel(
                                            sortedHistoriales,
                                            campeonatos.find(c => c.id == filterCampeonato)?.Nombre
                                        )}
                                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Exportar Excel
                                    </button>
                                    <button
                                        onClick={() => generarReporteHistorialJSON(
                                            sortedHistoriales,
                                            campeonatos.find(c => c.id == filterCampeonato)?.Nombre
                                        )}
                                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Exportar JSON
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#34D399]">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-[#065F46] text-center">Clasificaciones</h2>
                            <p className="text-center text-gray-600 mt-1">
                                {campeonatos.find(c => c.id == filterCampeonato)?.Nombre}
                            </p>
                        </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#A7F3D0]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Pos</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Equipo</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Campeonato</th>
                                    <th className="px-4 py-2 text-center text-[#065F46] font-bold">PJ</th>
                                    <th className="px-4 py-2 text-center text-[#065F46] font-bold">PG</th>
                                    <th className="px-4 py-2 text-center text-[#065F46] font-bold">PE</th>
                                    <th className="px-4 py-2 text-center text-[#065F46] font-bold">PP</th>
                                    <th className="px-4 py-2 text-center text-[#065F46] font-bold">GF</th>
                                    <th className="px-4 py-2 text-center text-[#065F46] font-bold">GC</th>
                                    <th className="px-4 py-2 text-center text-[#065F46] font-bold">DG</th>
                                    <th className="px-4 py-2 text-center text-[#065F46] font-bold">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedHistoriales.map((historial, index) => (
                                    <tr key={historial.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F3F4F6]'}>
                                        <td className="px-4 py-2 text-[#065F46] font-bold text-center">{historial.Posicion || '-'}</td>
                                        <td className="px-4 py-2 text-[#065F46] font-semibold">
                                            {historial.EquipoNombre || 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            {historial.CampeonatoNombre || 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46] text-center">{historial.PJ || 0}</td>
                                        <td className="px-4 py-2 text-green-600 text-center font-semibold">{historial.PG || 0}</td>
                                        <td className="px-4 py-2 text-gray-600 text-center">{historial.PE || 0}</td>
                                        <td className="px-4 py-2 text-red-600 text-center">{historial.PP || 0}</td>
                                        <td className="px-4 py-2 text-[#065F46] text-center">{historial.GF || 0}</td>
                                        <td className="px-4 py-2 text-[#065F46] text-center">{historial.GC || 0}</td>
                                        <td className="px-4 py-2 text-[#065F46] text-center font-semibold">{historial.DG || 0}</td>
                                        <td className="px-4 py-2 text-[#065F46] text-center font-bold text-lg">{historial.Puntos || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sortedHistoriales.length === 0 && (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-3">🏆</div>
                                <p className="text-gray-500 font-medium">No hay clasificaciones disponibles para este campeonato</p>
                            </div>
                        )}
                    </div>
                </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default HistorialPage;
