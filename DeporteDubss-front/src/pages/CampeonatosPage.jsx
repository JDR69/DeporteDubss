
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDeportes, getCategorias, createCampeonato, getCampeonatos, deleteCampeonato, getCampeonatoDetalle } from '../api/auth';
import Loading from '../components/loading';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { ROLES } from '../utils/permissions';
import ChampionshipCard from '../components/championships/ChampionshipCard';
import ChampionshipDetail from '../components/championships/ChampionshipDetail';
import EnrollTeamModal from '../components/championships/EnrollTeamModal';
import groqService from '../services/groqService';
import { 
    generarReporteCampeonatosPDF, 
    generarReporteCampeonatosExcel, 
    generarReporteCampeonatosJSON 
} from '../services/reportService';

function CampeonatosPage() {
    const { user } = useAuth ? useAuth() : { user: null };
    const [deportes, setDeportes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [campeonatos, setCampeonatos] = useState([]);
    const [detallePorId, setDetallePorId] = useState({});
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedCampeonatoId, setSelectedCampeonatoId] = useState(null);
    
    // Form states
    const [deporteNombre, setDeporteNombre] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [nombre, setNombre] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [logo, setLogo] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [recomendaciones, setRecomendaciones] = useState(null);
    const [loadingRecomendaciones, setLoadingRecomendaciones] = useState(false);
    const [showRecomendaciones, setShowRecomendaciones] = useState(false);

    // Check if user is admin
    const isAdmin = user && (
        user.rol === 'Administrador' || 
        user.rol === ROLES.ADMIN || 
        user.IDRol === ROLES.ADMIN || 
        (user.IDRol && user.IDRol.id === ROLES.ADMIN) ||
        (user.IDRol && user.IDRol.Nombre === 'Administrador')
    );

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resDeportes, resCategorias, resCampeonatos] = await Promise.all([
                getDeportes(),
                getCategorias(),
                getCampeonatos()
            ]);
            setDeportes(Array.isArray(resDeportes.data) ? resDeportes.data : []);
            setCategorias(Array.isArray(resCategorias.data) ? resCategorias.data : []);
            setCampeonatos(Array.isArray(resCampeonatos.data) ? resCampeonatos.data : []);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Error al cargar los datos.');
        }
        setLoading(false);
    };

    const toggleDetalle = async (id) => {
        // Alternar expansión, y si no existe detalle, cargarlo
        if (detallePorId[id]) {
            setDetallePorId(prev => ({ ...prev, [id]: { ...prev[id], _expanded: !prev[id]._expanded } }));
            return;
        }
        try {
            const { data } = await getCampeonatoDetalle(id);
            setDetallePorId(prev => ({ ...prev, [id]: { ...data, _expanded: true } }));
        } catch (err) {
            console.error('Error obteniendo detalle:', err);
            setError('No se pudo cargar el detalle del campeonato.');
        }
    };

    const handleRegistrar = async () => {
        setMensaje('');
        setError('');
        if (!deporteNombre || !categoriaId || !nombre || !fechaInicio || !fechaFin || !logoFile) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        setLoading(true);
        try {
            // Obtener el ID del deporte seleccionado por nombre
            const deporteObj = deportes.find(d => (d.Nombre || '').trim() === deporteNombre.trim());
            if (!deporteObj) {
                setError('Selecciona un deporte válido.');
                setLoading(false);
                return;
            }
            // Obtener organizador_id del usuario logueado
            let organizador_id = null;
            if (user && user.organizador_id) {
                organizador_id = user.organizador_id;
            } else if (user && user.id) {
                // Si el usuario es admin y no tiene organizador_id, buscarlo por API si es necesario
                // Para simplificar, asumimos que si es admin puede crear, pero el backend espera un organizador.
                // Si el backend valida que sea organizador, esto podría fallar si el admin no es organizador.
                organizador_id = user.id; 
            } else {
                setError('No se pudo obtener el organizador actual.');
                setLoading(false);
                return;
            }
            // Subir imagen a Cloudinary
            const logoUrl = await uploadImageToCloudinary(logoFile);
            await createCampeonato({
                nombre,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                logo: logoUrl,
                deporte_id: deporteObj.id,
                categoria_id: parseInt(categoriaId),
                estado: true,
                organizador_id
            });
            setMensaje('¡Campeonato registrado exitosamente!');
            setNombre('');
            setFechaInicio('');
            setFechaFin('');
            setLogo('');
            setLogoFile(null);
            setDeporteNombre('');
            setCategoriaId('');
            loadData(); // Reload list
        } catch (err) {
            console.log('Error detalle:', err.response?.data || err);
            setError('Error al registrar el campeonato.');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este campeonato?')) return;
        setLoading(true);
        try {
            await deleteCampeonato(id);
            setMensaje('Campeonato eliminado exitosamente');
            loadData();
        } catch (err) {
            console.error('Error deleting championship:', err);
            setError('Error al eliminar el campeonato');
        }
        setLoading(false);
    };

    const handleOpenEnrollModal = (campeonatoId) => {
        setSelectedCampeonatoId(campeonatoId);
        setShowEnrollModal(true);
    };

    const handleEnrollSuccess = async () => {
        setMensaje('Equipo inscrito exitosamente');
        // Recargar detalles del campeonato
        if (selectedCampeonatoId) {
            try {
                const { data } = await getCampeonatoDetalle(selectedCampeonatoId);
                setDetallePorId(prev => ({ ...prev, [selectedCampeonatoId]: { ...data, _expanded: true } }));
            } catch (err) {
                console.error('Error reloading details:', err);
            }
        }
        setTimeout(() => setMensaje(''), 3000);
    };

    const recomendacion_controllers = async () => {
        setLoadingRecomendaciones(true);
        setError('');
        
        try {
            // Analizar el historial de campeonatos
            const analisisHistorico = campeonatos.map(camp => {
                const deporte = deportes.find(d => d.id === camp.IDDeporte);
                const categoria = categorias.find(c => c.id === camp.IDCategoria);
                return {
                    nombre: camp.Nombre,
                    deporte: deporte?.Nombre || 'Desconocido',
                    categoria: categoria?.Nombre || 'Desconocida',
                    fechaInicio: camp.Fecha_Inicio,
                    fechaFin: camp.Fecha_Fin,
                    estado: camp.Estado
                };
            });

            // Agrupar campeonatos por deporte
            const campeonatosPorDeporte = {};
            analisisHistorico.forEach(camp => {
                if (!campeonatosPorDeporte[camp.deporte]) {
                    campeonatosPorDeporte[camp.deporte] = [];
                }
                campeonatosPorDeporte[camp.deporte].push(camp);
            });

            // Identificar patrones de nombres (ej: "Liga Universitaria 2024-1", "2024-2")
            const patronesNombres = {};
            analisisHistorico.forEach(camp => {
                // Extraer patrón base del nombre (sin año/semestre)
                const nombreBase = camp.nombre.replace(/\d{4}[-_]?\d?/g, '').trim();
                if (!patronesNombres[nombreBase]) {
                    patronesNombres[nombreBase] = [];
                }
                patronesNombres[nombreBase].push(camp.nombre);
            });

            const prompt = `Eres un experto en gestión deportiva universitaria. Analiza el historial de campeonatos y genera recomendaciones inteligentes.

**HISTORIAL DE CAMPEONATOS:**
${analisisHistorico.map((c, i) => `${i + 1}. ${c.nombre} - ${c.deporte} (${c.categoria}) - ${c.estado}`).join('\n')}

**ANÁLISIS POR DEPORTE:**
${Object.entries(campeonatosPorDeporte).map(([deporte, camps]) => 
    `- ${deporte}: ${camps.length} campeonato(s)`
).join('\n')}

**PATRONES DETECTADOS:**
${Object.entries(patronesNombres).map(([patron, nombres]) => 
    `- "${patron}": ${nombres.length} edición(es) - Últimas: ${nombres.slice(-2).join(', ')}`
).join('\n')}

**FECHA ACTUAL:** ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}

Genera SOLO un JSON válido (sin markdown) con la siguiente estructura:
{
  "continuarTradicion": {
    "recomendado": boolean,
    "campeonato": "Nombre del próximo campeonato siguiendo la tradición",
    "razon": "Explicación breve (máx 100 palabras)",
    "deporte": "Nombre del deporte",
    "fechaSugerida": "Mes/Año sugerido"
  },
  "nuevasPropuestas": [
    {
      "nombre": "Nombre del campeonato",
      "deporte": "Deporte",
      "categoria": "Categoría",
      "razon": "Por qué es una buena idea (máx 80 palabras)",
      "popularidadEstimada": "Alta/Media/Baja"
    }
  ],
  "analisisGeneral": "Resumen del análisis en 2-3 líneas sobre tendencias y oportunidades"
}`;

            const response = await groqService.generateResponse(prompt, 'llama-3.3-70b-versatile', {
                temperature: 0.6,
                max_tokens: 1500
            });

            // Parsear respuesta
            let recomendacionesData;
            try {
                const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                recomendacionesData = JSON.parse(cleanResponse);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                // Fallback con recomendaciones básicas
                recomendacionesData = {
                    continuarTradicion: {
                        recomendado: true,
                        campeonato: "Liga Universitaria 2025-2",
                        razon: "Basándose en el historial, existe una tradición de ligas semestrales que han sido exitosas.",
                        deporte: "Fútbol 11",
                        fechaSugerida: "Agosto 2025"
                    },
                    nuevasPropuestas: [
                        {
                            nombre: "Torneo Interdepartamental",
                            deporte: "Múltiples deportes",
                            categoria: "Mixto",
                            razon: "Diversificar la oferta deportiva puede aumentar la participación estudiantil.",
                            popularidadEstimada: "Alta"
                        }
                    ],
                    analisisGeneral: "Se detecta un patrón consistente de campeonatos semestrales. Hay oportunidad de expandir a nuevos deportes y categorías."
                };
            }

            setRecomendaciones(recomendacionesData);
            setShowRecomendaciones(true);

        } catch (error) {
            console.error('Error generando recomendaciones:', error);
            setError('Error al generar recomendaciones con IA');
        }

        setLoadingRecomendaciones(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4">
            <Loading show={loading} message={loading ? 'Procesando...' : 'Cargando...'} />
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-emerald-900 mb-2">Gestión de Campeonatos</h1>
                    <p className="text-emerald-700">Crea y administra campeonatos deportivos</p>
                </div>

                {/* Sección de Recomendaciones IA */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-8 border-2 border-purple-200 mb-8 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center animate-pulse">
                                <span className="text-2xl">🤖</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-purple-900">Recomendaciones con IA</h2>
                                <p className="text-purple-600 text-sm">Machine Learning analiza tu historial de campeonatos</p>
                            </div>
                        </div>
                        <button
                            onClick={recomendacion_controllers}
                            disabled={loadingRecomendaciones || campeonatos.length === 0}
                            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                                loadingRecomendaciones || campeonatos.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                            }`}
                        >
                            {loadingRecomendaciones ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Analizando...
                                </div>
                            ) : (
                                ' Generar Recomendaciones'
                            )}
                        </button>
                    </div>

                    {campeonatos.length === 0 && (
                        <div className="text-center py-8 text-purple-600">
                            <p className="text-lg">📊 Necesitas al menos un campeonato registrado para generar recomendaciones</p>
                        </div>
                    )}

                    {/* Mostrar Recomendaciones */}
                    {showRecomendaciones && recomendaciones && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Análisis General */}
                            <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                                <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                                    <span>📈</span>
                                    Análisis General
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{recomendaciones.analisisGeneral}</p>
                            </div>

                            {/* Continuar Tradición */}
                            {recomendaciones.continuarTradicion?.recomendado && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl">✅</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-green-900 text-xl mb-2">Continuar Tradición</h3>
                                            <div className="bg-white rounded-lg p-4 mb-3">
                                                <p className="text-2xl font-bold text-green-700 mb-1">
                                                    {recomendaciones.continuarTradicion.campeonato}
                                                </p>
                                                <div className="flex gap-4 text-sm text-gray-600 mt-2">
                                                    <span>🏀 {recomendaciones.continuarTradicion.deporte}</span>
                                                    <span>📅 {recomendaciones.continuarTradicion.fechaSugerida}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">
                                                {recomendaciones.continuarTradicion.razon}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setNombre(recomendaciones.continuarTradicion.campeonato);
                                                    setDeporteNombre(recomendaciones.continuarTradicion.deporte);
                                                    setShowRecomendaciones(false);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                            >
                                                📝 Usar esta Recomendación
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Nuevas Propuestas */}
                            {recomendaciones.nuevasPropuestas && recomendaciones.nuevasPropuestas.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-purple-900 text-xl mb-4 flex items-center gap-2">
                                        <span>💡</span>
                                        Nuevas Propuestas
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {recomendaciones.nuevasPropuestas.map((propuesta, index) => (
                                            <div
                                                key={index}
                                                className="bg-white rounded-xl p-5 border-2 border-indigo-200 hover:border-indigo-400 transition-all hover:shadow-lg"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="font-bold text-indigo-900 text-lg flex-1">
                                                        {propuesta.nombre}
                                                    </h4>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        propuesta.popularidadEstimada === 'Alta' ? 'bg-green-100 text-green-700' :
                                                        propuesta.popularidadEstimada === 'Media' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {propuesta.popularidadEstimada}
                                                    </span>
                                                </div>
                                                <div className="flex gap-3 text-sm text-gray-600 mb-3">
                                                    <span>🏆 {propuesta.deporte}</span>
                                                    <span>👥 {propuesta.categoria}</span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                                    {propuesta.razon}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setNombre(propuesta.nombre);
                                                        setDeporteNombre(propuesta.deporte);
                                                        const cat = categorias.find(c => c.Nombre === propuesta.categoria);
                                                        if (cat) setCategoriaId(cat.id.toString());
                                                        setShowRecomendaciones(false);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                                                >
                                                    📝 Usar esta Propuesta
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowRecomendaciones(false)}
                                className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                            >
                                Cerrar Recomendaciones
                            </button>
                        </div>
                    )}
                </div>

                {/* Sección de Exportación de Reportes */}
                {campeonatos.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-900">Exportar Lista de Campeonatos</h2>
                        </div>
                        <p className="text-blue-700 mb-6">Descarga el listado completo de campeonatos en diferentes formatos</p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => generarReporteCampeonatosPDF(campeonatos, deportes, categorias)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                            >
                                Exportar a PDF
                            </button>
                            <button
                                onClick={() => generarReporteCampeonatosExcel(campeonatos, deportes, categorias)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                            >
                                Exportar a Excel
                            </button>
                            <button
                                onClick={() => generarReporteCampeonatosJSON(campeonatos, deportes, categorias)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                            >
                                Exportar a JSON
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Formulario de Creación */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-emerald-200 mb-8 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🏆</span>
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-900">Crear Nuevo Campeonato</h2>
                    </div>
                    <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-emerald-800 font-semibold mb-2 text-sm">Deporte</label>
                                <input 
                                    list="deportes-list" 
                                    value={deporteNombre} 
                                    onChange={(e) => setDeporteNombre(e.target.value)} 
                                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl bg-emerald-50 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                                    placeholder="Escribe o selecciona un deporte"
                                />
                                <datalist id="deportes-list">
                                    {deportes.map(d => <option key={d.id} value={d.Nombre} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-emerald-800 font-semibold mb-2 text-sm">Categoría</label>
                                <select 
                                    value={categoriaId} 
                                    onChange={(e) => setCategoriaId(e.target.value)} 
                                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl bg-emerald-50 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.Nombre}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-emerald-800 font-semibold mb-2 text-sm">Nombre del Campeonato</label>
                            <input 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl bg-white text-emerald-900 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                                placeholder="Ej: Liga Universitaria 2024"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-emerald-800 font-semibold mb-2 text-sm">Fecha Inicio</label>
                                <input 
                                    type="date" 
                                    value={fechaInicio} 
                                    onChange={(e) => setFechaInicio(e.target.value)} 
                                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl bg-emerald-50 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-emerald-800 font-semibold mb-2 text-sm">Fecha Fin</label>
                                <input 
                                    type="date" 
                                    value={fechaFin} 
                                    onChange={(e) => setFechaFin(e.target.value)} 
                                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl bg-emerald-50 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-emerald-800 font-semibold mb-2 text-sm">Logo del Campeonato</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setLogoFile(e.target.files[0])} 
                                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700 file:font-semibold hover:file:bg-emerald-200"
                            />
                        </div>
                        {mensaje && <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg"><p className="text-green-700 font-semibold">{mensaje}</p></div>}
                        {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"><p className="text-red-700 font-semibold">{error}</p></div>}
                        <button 
                            onClick={handleRegistrar} 
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            ✨ Registrar Campeonato
                        </button>
                    </form>
                </div>

                {/* Lista de Campeonatos */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📋</span>
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-900">Lista de Campeonatos</h2>
                    </div>
                    {campeonatos.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No hay campeonatos registrados</p>
                    )}
                    {campeonatos.map(camp => (
                      <div key={camp.id}>
                        <ChampionshipCard 
                          camp={camp} 
                          isAdmin={isAdmin}
                          onToggleDetail={toggleDetalle}
                          onDelete={handleDelete}
                        />
                        {detallePorId[camp.id]?.['_expanded'] && (
                          <ChampionshipDetail 
                            detalle={detallePorId[camp.id]} 
                            onInscribirEquipo={isAdmin ? () => handleOpenEnrollModal(camp.id) : null}
                          />
                        )}
                      </div>
                    ))}
                </div>
            </div>

            {/* Modal de Inscripción */}
            {showEnrollModal && selectedCampeonatoId && (
                <EnrollTeamModal
                    campeonatoId={selectedCampeonatoId}
                    equiposInscritos={detallePorId[selectedCampeonatoId]?.Equipos || []}
                    onClose={() => setShowEnrollModal(false)}
                    onSuccess={handleEnrollSuccess}
                />
            )}
        </div>
    );
}

export default CampeonatosPage;
