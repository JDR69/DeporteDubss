import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCampeonatos, getDeportes, getHistoriales, getEquipos, getPartidos, getFixtures, getResultados } from '../api/auth'
import axiosInstance from '../api/axiosInstance'
import groqService from '../services/groqService'

const Home = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [campeonatos, setCampeonatos] = useState([]);
    const [deportes, setDeportes] = useState([]);
    const [historiales, setHistoriales] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [campeonatoSeleccionado, setCampeonatoSeleccionado] = useState(null);
    const [predicciones, setPredicciones] = useState([]);
    const [loadingPrediccion, setLoadingPrediccion] = useState(false);
    const [equipoSeleccionadoIA, setEquipoSeleccionadoIA] = useState(null);
    const [partidosPendientes, setPartidosPendientes] = useState([]);
    const [prediccionPartido, setPrediccionPartido] = useState(null);
    const [loadingPartido, setLoadingPartido] = useState(false);
    const [partidoEnAnalisis, setPartidoEnAnalisis] = useState(null);
    const [campeonatoPartidos, setCampeonatoPartidos] = useState(null);
    const [todosPartidos, setTodosPartidos] = useState([]);
    const [todosFixtures, setTodosFixtures] = useState([]);
    const [todosResultados, setTodosResultados] = useState([]);
    const [filtroJornada, setFiltroJornada] = useState('todas');
    const [filtroEquipo, setFiltroEquipo] = useState('todos');
    const [partidosSinFiltrar, setPartidosSinFiltrar] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [campeonatosRes, deportesRes, historialesRes, equiposRes, partidosRes, fixturesRes, resultadosRes] = await Promise.all([
                getCampeonatos(),
                getDeportes(),
                getHistoriales(),
                getEquipos(),
                getPartidos(),
                getFixtures(),
                getResultados()
            ]);
            
            const campsData = Array.isArray(campeonatosRes.data) ? campeonatosRes.data : [];
            const depsData = Array.isArray(deportesRes.data) ? deportesRes.data : [];
            const histData = Array.isArray(historialesRes.data) ? historialesRes.data : [];
            const equiposData = Array.isArray(equiposRes.data) ? equiposRes.data : [];
            const partidosData = Array.isArray(partidosRes.data) ? partidosRes.data : [];
            const fixturesData = Array.isArray(fixturesRes.data) ? fixturesRes.data : [];
            const resultadosData = Array.isArray(resultadosRes.data) ? resultadosRes.data : [];
            
            setCampeonatos(campsData);
            setDeportes(depsData);
            setHistoriales(histData);
            setEquipos(equiposData);
            setTodosPartidos(partidosData);
            setTodosFixtures(fixturesData);
            setTodosResultados(resultadosData);
            
            // Seleccionar el primer campeonato "En Curso" por defecto
            const campeonatoEnCurso = campsData.find(c => c.Estado === 'En Curso');
            if (campeonatoEnCurso) {
                setCampeonatoSeleccionado(campeonatoEnCurso.id);
                setCampeonatoPartidos(campeonatoEnCurso.id);
                cargarPartidosPendientes(campeonatoEnCurso.id, fixturesData, partidosData, resultadosData, equiposData);
            } else if (campsData.length > 0) {
                setCampeonatoSeleccionado(campsData[0].id);
                setCampeonatoPartidos(campsData[0].id);
                cargarPartidosPendientes(campsData[0].id, fixturesData, partidosData, resultadosData, equiposData);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
        setLoading(false);
    };

    const cargarPartidosPendientes = (campeonatoId, fixturesData, partidosData, resultadosData, equiposData) => {
        console.log('=== Cargando partidos pendientes ===');
        console.log('Campeonato ID:', campeonatoId);
        console.log('Total fixtures:', fixturesData.length);
        console.log('Total partidos:', partidosData.length);
        console.log('Total resultados:', resultadosData.length);
        
        // Filtrar fixtures del campeonato seleccionado
        const fixturesCampeonato = fixturesData.filter(f => f.IDCampeonato === campeonatoId);
        console.log('Fixtures del campeonato:', fixturesCampeonato.length);
        
        // Obtener partidos de esos fixtures
        const partidosCampeonato = partidosData.filter(p => 
            fixturesCampeonato.some(f => f.id === p.IDFixture)
        );
        console.log('Partidos del campeonato:', partidosCampeonato.length);

        // Filtrar solo partidos sin resultado (0-0)
        const partidosPendientesData = partidosCampeonato
            .filter(p => {
                const resultado = resultadosData.find(r => r.id === p.IDResultado);
                const esPendiente = resultado && resultado.Goles_Local === 0 && resultado.Goles_Visitante === 0;
                return esPendiente;
            })
            .map(p => {
                const fixture = fixturesCampeonato.find(f => f.id === p.IDFixture);
                const equipoLocal = equiposData.find(e => e.id === p.IDEquipo_Local);
                const equipoVisitante = equiposData.find(e => e.id === p.IDEquipo_Visitante);
                const campeonatoActual = campeonatos.find(c => c.id === campeonatoId) || { Nombre: 'Campeonato' };
                
                return {
                    id: p.id,
                    equipoLocal: equipoLocal || { id: p.IDEquipo_Local, Nombre: 'Equipo Local' },
                    equipoVisitante: equipoVisitante || { id: p.IDEquipo_Visitante, Nombre: 'Equipo Visitante' },
                    fecha: fixture?.Fecha || new Date().toISOString().split('T')[0],
                    jornada: fixture?.Numero || 1,
                    campeonato: campeonatoActual
                };
            });

        console.log('Partidos pendientes encontrados:', partidosPendientesData.length);
        console.log('Partidos pendientes:', partidosPendientesData);
        setPartidosSinFiltrar(partidosPendientesData);
        setPartidosPendientes(partidosPendientesData);
        setFiltroJornada('todas');
        setFiltroEquipo('todos');
    };

    const aplicarFiltros = () => {
        let partidosFiltrados = [...partidosSinFiltrar];

        // Filtrar por jornada
        if (filtroJornada !== 'todas') {
            partidosFiltrados = partidosFiltrados.filter(p => p.jornada === parseInt(filtroJornada));
        }

        // Filtrar por equipo
        if (filtroEquipo !== 'todos') {
            const equipoId = parseInt(filtroEquipo);
            partidosFiltrados = partidosFiltrados.filter(p => 
                p.equipoLocal.id === equipoId || p.equipoVisitante.id === equipoId
            );
        }

        setPartidosPendientes(partidosFiltrados);
    };

    useEffect(() => {
        if (partidosSinFiltrar.length > 0) {
            aplicarFiltros();
        }
    }, [filtroJornada, filtroEquipo]);

    const handleCampeonatoPartidosChange = (e) => {
        const campeonatoId = parseInt(e.target.value);
        setCampeonatoPartidos(campeonatoId);
        setFiltroJornada('todas');
        setFiltroEquipo('todos');
        cargarPartidosPendientes(campeonatoId, todosFixtures, todosPartidos, todosResultados, equipos);
    };

    // Obtener jornadas únicas del campeonato seleccionado
    const jornadasDisponibles = [...new Set(partidosSinFiltrar.map(p => p.jornada))].sort((a, b) => a - b);

    // Obtener equipos únicos del campeonato seleccionado
    const equiposDisponibles = (() => {
        const equiposSet = new Map();
        partidosSinFiltrar.forEach(p => {
            equiposSet.set(p.equipoLocal.id, p.equipoLocal);
            equiposSet.set(p.equipoVisitante.id, p.equipoVisitante);
        });
        return Array.from(equiposSet.values()).sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    })();

    // Obtener campeonatos finalizados para el carrusel
    const featuredActivities = campeonatos
        .filter(camp => camp.Estado === 'Finalizado')
        .slice(0, 3)
        .map(camp => {
            const equiposCount = historiales.filter(h => h.IDCampeonato === camp.id).length;
            return {
                id: camp.id,
                title: camp.Nombre,
                image: camp.Logo || "https://tse1.mm.bing.net/th/id/OIP.V9sOj0mNN5AEU0o9wwBr2AHaKe?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
                date: new Date(camp.Fecha_Inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
                status: camp.Estado,
                description: `Campeonato ${deportes.find(d => d.id === camp.IDDeporte)?.Nombre || 'deportivo'}`,
                participants: equiposCount * 15 // Estimación de jugadores
            };
        });

    // Categorías deportivas dinámicas desde la BD
    const categories = [
        { id: 'todas', name: 'Todas', icon: '🏆' },
        ...deportes.map(deporte => ({
            id: deporte.id,
            name: deporte.Nombre,
            icon: deporte.Nombre === 'Fútbol 11' ? '⚽' :
                  deporte.Nombre === 'Baloncesto' ? '🏀' :
                  deporte.Nombre === 'Voleibol' ? '🏐' : '🏅'
        }))
    ];

    // Actividades basadas en campeonatos reales
    const activities = campeonatos.map(camp => {
        const equiposCount = historiales.filter(h => h.IDCampeonato === camp.id).length;
        return {
            id: camp.id,
            title: camp.Nombre,
            category: camp.IDDeporte || 'otros',
            date: new Date(camp.Fecha_Inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            status: camp.Estado === 'En Curso' ? 'Activa' : 
                    camp.Estado === 'Pendiente' ? 'Próximamente' : 
                    camp.Estado === 'Finalizado' ? 'Finalizado' : 'Inscripciones',
            participants: equiposCount * 15,
            image: camp.Logo || "https://www.anfp.cl/wp-content/uploads/2024/12/Liga-Evolucion-Futsal-Chile.jpg"
        };
    });

    const filteredActivities = selectedCategory === 'todas'
        ? activities
        : activities.filter(activity => activity.category === selectedCategory);

    const nextSlide = () => {
        if (featuredActivities.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % featuredActivities.length);
        }
    };

    const prevSlide = () => {
        if (featuredActivities.length > 0) {
            setCurrentSlide((prev) => (prev - 1 + featuredActivities.length) % featuredActivities.length);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Activa':
            case 'En Curso':
                return 'bg-[#34D399] text-[#065F46]';
            case 'Inscripciones':
            case 'Inscripciones abiertas':
                return 'bg-yellow-500 text-black';
            case 'Próximamente':
            case 'Pendiente':
                return 'bg-[#A7F3D0] text-[#065F46]';
            case 'Finalizado':
                return 'bg-gray-400 text-white';
            default:
                return 'bg-[#E5E7EB] text-[#065F46]';
        }
    };

    // Función para generar predicciones con IA
    const predicciones_controllers = async () => {
        if (!campeonatoSeleccionado || loadingPrediccion) return;
        
        setLoadingPrediccion(true);
        try {
            // Obtener equipos del campeonato seleccionado
            const equiposCampeonato = historiales
                .filter(h => h.IDCampeonato === campeonatoSeleccionado)
                .map(h => {
                    const equipo = equipos.find(e => e.id === h.IDEquipo);
                    return {
                        nombre: equipo?.Nombre || 'Equipo',
                        stats: h
                    };
                });

            // Calcular estadísticas históricas de cada equipo
            const datosEquipos = equiposCampeonato.map(eq => {
                const historico = historiales.filter(h => h.IDEquipo === eq.stats.IDEquipo);
                const totalPartidos = historico.reduce((sum, h) => sum + h.PJ, 0);
                const totalGoles = historico.reduce((sum, h) => sum + h.GF, 0);
                const totalPuntos = historico.reduce((sum, h) => sum + h.Puntos, 0);
                const promedioGoles = totalPartidos > 0 ? (totalGoles / totalPartidos).toFixed(2) : 0;
                const promedioPuntos = totalPartidos > 0 ? (totalPuntos / totalPartidos).toFixed(2) : 0;

                return {
                    nombre: eq.nombre,
                    partidosJugados: totalPartidos,
                    promedioGolesPorPartido: promedioGoles,
                    promedioPuntosPorPartido: promedioPuntos,
                    statsActuales: eq.stats
                };
            });

            // Crear prompt para Groq con datos estructurados
            const prompt = `Eres un analista deportivo experto. Analiza los siguientes datos históricos de equipos y predice su rendimiento en el próximo campeonato.

Datos de equipos:
${datosEquipos.map(eq => `
- ${eq.nombre}:
  * Partidos jugados histórico: ${eq.partidosJugados}
  * Promedio de goles por partido: ${eq.promedioGolesPorPartido}
  * Promedio de puntos por partido: ${eq.promedioPuntosPorPartido}
  * Estadísticas actuales: ${eq.statsActuales.PJ} PJ, ${eq.statsActuales.PG} PG, ${eq.statsActuales.PE} PE, ${eq.statsActuales.PP} PP, ${eq.statsActuales.GF} GF, ${eq.statsActuales.GC} GC
`).join('\n')}

Genera SOLO un JSON válido (sin markdown, sin explicaciones adicionales) con las siguientes predicciones para cada equipo:
{
  "predicciones": [
    {
      "equipo": "nombre del equipo",
      "posicionEstimada": número (1-${datosEquipos.length}),
      "puntosEstimados": número,
      "golesEstimados": número,
      "probabilidadTop3": "XX%",
      "tendencia": "ascendente/estable/descendente",
      "analisis": "breve análisis de 1-2 líneas"
    }
  ]
}`;

            const response = await groqService.generateResponse(prompt, 'llama-3.3-70b-versatile', {
                temperature: 0.3,
                max_tokens: 2000
            });

            // Parsear respuesta
            let prediccionesData;
            try {
                // Limpiar la respuesta de posibles marcadores de código
                const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                prediccionesData = JSON.parse(cleanResponse);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                // Si falla el parsing, crear predicciones básicas
                prediccionesData = {
                    predicciones: datosEquipos.map((eq, index) => ({
                        equipo: eq.nombre,
                        posicionEstimada: index + 1,
                        puntosEstimados: Math.round(parseFloat(eq.promedioPuntosPorPartido) * 10),
                        golesEstimados: Math.round(parseFloat(eq.promedioGolesPorPartido) * 10),
                        probabilidadTop3: `${Math.max(15.5, 92.8 - (index * 12.3)).toFixed(1)}%`,
                        tendencia: 'estable',
                        analisis: 'Predicción basada en estadísticas históricas'
                    }))
                };
            }

            setPredicciones(prediccionesData.predicciones || []);
        } catch (error) {
            console.error('Error generando predicciones:', error);
        }
        setLoadingPrediccion(false);
    };

    // Función para predecir resultado de un partido
    const prediccion_controllers = async (partido) => {
        setLoadingPartido(true);
        setPartidoEnAnalisis(partido.id);
        setPrediccionPartido(null);

        try {
            // Llamada a nuestra API de Machine Learning
            const response = await axiosInstance.post('/api/ml/predecir/', {
                local_id: partido.equipoLocal.id,
                visit_id: partido.equipoVisitante.id
            });

            const mlData = response.data.prediction;

            // Estructurar datos para la UI
            const prediccionData = {
                marcadorPredicho: {
                    // Estimación simple basada en probabilidades (solo visual)
                    local: mlData.local_win_prob > mlData.visit_win_prob ? 2 : (mlData.local_win_prob < mlData.visit_win_prob ? 0 : 1),
                    visitante: mlData.visit_win_prob > mlData.local_win_prob ? 2 : (mlData.visit_win_prob < mlData.local_win_prob ? 0 : 1)
                },
                probabilidades: {
                    victoriaLocal: `${mlData.local_win_prob}%`,
                    empate: `${mlData.draw_prob}%`,
                    victoriaVisitante: `${mlData.visit_win_prob}%`
                },
                confianza: `${Math.max(mlData.local_win_prob, mlData.visit_win_prob, mlData.draw_prob)}%`,
                factoresClave: [
                    "Rendimiento histórico reciente",
                    "Promedio de goles local/visitante",
                    "Efectividad defensiva"
                ],
                analisis: `El modelo de IA (Random Forest) ha analizado el historial de ambos equipos. ${
                    mlData.local_win_prob > mlData.visit_win_prob 
                    ? `Se inclina por una victoria de ${partido.equipoLocal.Nombre} con un ${mlData.local_win_prob}% de probabilidad.` 
                    : mlData.visit_win_prob > mlData.local_win_prob
                    ? `Favorece a ${partido.equipoVisitante.Nombre} con un ${mlData.visit_win_prob}% de probabilidad.`
                    : "Pronostica un partido muy reñido con alta probabilidad de empate."
                }`
            };

            setPrediccionPartido({
                ...prediccionData,
                partido: partido
            });

        } catch (error) {
            console.error('Error prediciendo partido:', error);
            // Fallback si falla la API o no hay suficientes datos
            setPrediccionPartido({
                error: true,
                mensaje: "No hay suficientes datos históricos para generar una predicción confiable con IA."
            });
        }

        setLoadingPartido(false);
        setPartidoEnAnalisis(null);
    };

    // Función para análisis detallado de un equipo
    const analizarEquipo = async (equipoId) => {
        setEquipoSeleccionadoIA(equipoId);
        setLoadingPrediccion(true);

        try {
            const equipo = equipos.find(e => e.id === equipoId);
            const historicoEquipo = historiales.filter(h => h.IDEquipo === equipoId);

            const prompt = `Analiza el rendimiento del equipo "${equipo?.Nombre}" basándote en sus estadísticas:

${historicoEquipo.map((h, i) => {
    const camp = campeonatos.find(c => c.id === h.IDCampeonato);
    return `Campeonato ${i + 1} (${camp?.Nombre}):
- Posición: ${h.Posicion}
- Partidos: ${h.PJ} (${h.PG}G-${h.PE}E-${h.PP}P)
- Goles: ${h.GF} a favor, ${h.GC} en contra (${h.DG > 0 ? '+' : ''}${h.DG})
- Puntos: ${h.Puntos}`;
}).join('\n\n')}

Genera un análisis detallado de máximo 150 palabras que incluya:
1. Fortalezas y debilidades
2. Evolución del equipo
3. Recomendaciones para mejorar`;

            const response = await groqService.generateResponse(prompt, 'llama-3.3-70b-versatile', {
                temperature: 0.5,
                max_tokens: 500
            });

            // Mostrar el análisis en algún lugar (puedes agregarlo al estado si quieres)
            alert(`Análisis de ${equipo?.Nombre}:\n\n${response}`);
        } catch (error) {
            console.error('Error analizando equipo:', error);
        }

        setLoadingPrediccion(false);
        setEquipoSeleccionadoIA(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#34D399] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#065F46] text-lg font-semibold">Cargando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header Principal */}
            <div
                className="text-white py-16 px-4 relative"
                style={{
                    backgroundImage: "url('https://images.pexels.com/photos/27429711/pexels-photo-27429711.jpeg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Overlay oscuro para mejorar legibilidad */}
                <div className="absolute inset-0 bg-black/50"></div>

                {/* Contenido con z-index más alto */}
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-white p-4 rounded-full mr-4 shadow-lg">
                            <div className="w-16 h-16 bg-[#34D399] rounded-full flex items-center justify-center">
                                <span className="text-[#065F46] text-2xl font-bold">DU</span>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl">
                            DUBSS UAGRM
                        </h1>
                    </div>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white drop-shadow-xl font-semibold">
                        Departamento Universitario de Bienestar Social y Deportes
                    </p>
                    <p className="text-lg mt-4 text-white drop-shadow-lg font-medium">
                        Tu pasión deportiva, nuestra misión universitaria
                    </p>
                </div>
            </div>

            {/* Carrusel de Actividades Destacadas - Altura Ajustada */}
            <div className="w-full py-12 bg-gradient-to-b from-white via-[#F3F4F6] to-white">
                {/* Título con animación */}
                <div className="text-center mb-12 px-4">
                    <div className="inline-block">
                        <h2 className="text-4xl md:text-6xl font-black text-[#065F46] mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#065F46] to-[#34D399]">
                            EVENTOS ÉPICOS
                        </h2>
                        <div className="h-2 bg-gradient-to-r from-[#34D399] via-[#065F46] to-[#34D399] rounded-full mx-auto w-32 mb-4"></div>
                        <p className="text-lg text-[#065F46] font-medium opacity-80">
                            Donde nacen las leyendas deportivas
                        </p>
                    </div>
                </div>

                {/* Carrusel Principal - Altura Optimizada */}
                <div className="relative w-full overflow-hidden">
                    {/* Contenedor del slide actual con altura ajustada */}
                    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[550px] bg-black">
                        {/* Imagen de fondo con efectos */}
                        <div className="absolute inset-0">
                            <img
                                src={featuredActivities[currentSlide].image}
                                alt={featuredActivities[currentSlide].title}
                                className="w-full h-full object-cover object-center filter brightness-75"
                            />
                            {/* Overlay con gradientes múltiples */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/70"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30"></div>

                            {/* Efectos de partículas decorativas */}
                            <div className="absolute top-8 left-8 w-3 h-3 bg-[#34D399] rounded-full opacity-70 animate-pulse"></div>
                            <div className="absolute top-24 right-16 w-2 h-2 bg-[#34D399] rounded-full opacity-50 animate-ping"></div>
                            <div className="absolute bottom-32 left-24 w-4 h-4 bg-[#34D399] rounded-full opacity-60"></div>
                        </div>

                        {/* Contenido Principal del Slide - Layout Optimizado */}
                        <div className="absolute inset-0 flex items-center">
                            <div className="container mx-auto px-6 md:px-12">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center h-full">

                                    {/* Columna Izquierda - Contenido Principal (2/3 del espacio) */}
                                    <div className="lg:col-span-2 space-y-6 z-10">
                                        {/* Badge de Estado y Contador */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm ${getStatusColor(featuredActivities[currentSlide].status)}`}>
                                                    <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>
                                                    {featuredActivities[currentSlide].status}
                                                </span>
                                                <div className="text-[#34D399] text-xs font-semibold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                                    EVENTO #{currentSlide + 1}
                                                </div>
                                            </div>

                                            {/* Contador de slides - móvil */}
                                            <div className="lg:hidden bg-black/40 backdrop-blur-md rounded-xl px-3 py-1 border border-[#34D399]/30">
                                                <span className="text-[#34D399] font-bold text-sm">
                                                    {currentSlide + 1} / {featuredActivities.length}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Título Optimizado */}
                                        <div>
                                            <h3 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 leading-tight">
                                                <span className="block text-[#34D399] text-lg md:text-xl font-bold mb-1">
                                                    🏆 DESTACADO
                                                </span>
                                                {featuredActivities[currentSlide].title}
                                            </h3>

                                            {/* Línea decorativa */}
                                            <div className="w-20 h-1 bg-gradient-to-r from-[#34D399] to-transparent mb-4"></div>
                                        </div>

                                        {/* Descripción */}
                                        <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light max-w-2xl">
                                            {featuredActivities[currentSlide].description}
                                        </p>

                                        {/* Stats y Botones en una fila */}
                                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pt-2">
                                            {/* Stats Compactos */}
                                            <div className="flex gap-4">
                                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-[#34D399]/30 min-w-[120px]">
                                                    <div className="text-2xl mb-1">📅</div>
                                                    <div className="text-[#34D399] text-xs font-bold">FECHA</div>
                                                    <div className="text-white text-base font-semibold">{featuredActivities[currentSlide].date}</div>
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-[#34D399]/30 min-w-[120px]">
                                                    <div className="text-2xl mb-1">👥</div>
                                                    <div className="text-[#34D399] text-xs font-bold">PARTICIPANTES</div>
                                                    <div className="text-white text-base font-semibold">{featuredActivities[currentSlide].participants}</div>
                                                </div>
                                            </div>

                                            {/* Botones de Acción Compactos */}
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button 
                                                    onClick={() => navigate('/login')}
                                                    className="group bg-gradient-to-r from-[#34D399] to-[#065F46] hover:from-[#065F46] hover:to-[#34D399] text-white font-bold py-3 px-6 rounded-xl text-base transition-all duration-300 transform hover:scale-105 shadow-xl"
                                                >
                                                    <span className="flex items-center justify-center">
                                                        Iniciar Sesión
                                                        <span className="ml-2 group-hover:translate-x-1 transition-transform">🚀</span>
                                                    </span>
                                                </button>
                                                <button className="border-2 border-[#34D399] text-[#34D399] hover:bg-[#34D399] hover:text-black font-bold py-3 px-6 rounded-xl text-base transition-all duration-300 backdrop-blur-sm bg-white/10">
                                                    Detalles
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Columna Derecha - Tarjeta Flotante Compacta (1/3 del espacio) */}
                                    <div className="hidden lg:flex items-center justify-center">
                                        <div className="relative">
                                            {/* Círculos decorativos más pequeños */}
                                            <div className="absolute -top-6 -right-6 w-20 h-20 border-2 border-[#34D399] rounded-full opacity-30 animate-spin"></div>
                                            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-[#34D399] to-transparent rounded-full opacity-20 animate-pulse"></div>

                                            {/* Tarjeta compacta */}
                                            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-[#34D399]/20 max-w-xs">
                                                <div className="text-center">
                                                    <div className="text-4xl mb-3">🏅</div>
                                                    <h4 className="text-xl font-bold text-[#065F46] mb-2">¡Únete Ahora!</h4>
                                                    <p className="text-[#065F46] text-sm mb-4">Forma parte de la historia deportiva</p>
                                                    <div className="flex justify-around text-xs">
                                                        <div className="text-center">
                                                            <div className="font-bold text-[#34D399] text-lg">+500</div>
                                                            <div className="text-[#065F46]">Atletas</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-bold text-[#34D399] text-lg">15+</div>
                                                            <div className="text-[#065F46]">Deportes</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-bold text-[#34D399] text-lg">24/7</div>
                                                            <div className="text-[#065F46]">Apoyo</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controles Optimizados */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#34D399] to-[#065F46] hover:from-[#065F46] hover:to-[#34D399] text-white p-3 rounded-full transition-all duration-300 shadow-xl hover:scale-110 backdrop-blur-sm border-2 border-white/20 z-20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#34D399] to-[#065F46] hover:from-[#065F46] hover:to-[#34D399] text-white p-3 rounded-full transition-all duration-300 shadow-xl hover:scale-110 backdrop-blur-sm border-2 border-white/20 z-20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Indicadores Compactos */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="flex space-x-2 bg-black/40 backdrop-blur-md rounded-full p-3 border border-white/20">
                            {featuredActivities.map((activity, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`relative transition-all duration-300 ${currentSlide === index
                                            ? 'w-8 h-3 bg-gradient-to-r from-[#34D399] to-[#065F46]'
                                            : 'w-3 h-3 bg-white/50 hover:bg-white/70'
                                        } rounded-full`}
                                >
                                    {currentSlide === index && (
                                        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contador de slides - desktop */}
                    <div className="absolute top-6 right-6 z-20 hidden lg:block">
                        <div className="bg-black/40 backdrop-blur-md rounded-xl px-4 py-2 border border-[#34D399]/30">
                            <span className="text-[#34D399] font-bold text-sm">
                                {currentSlide + 1} / {featuredActivities.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Mini-preview compacto */}
                <div className="container mx-auto px-4 mt-8">
                    <div className="flex justify-center space-x-4 overflow-x-auto pb-4">
                        {featuredActivities.map((activity, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`flex-shrink-0 relative group transition-all duration-300 ${currentSlide === index ? 'scale-105' : 'hover:scale-102'
                                    }`}
                            >
                                <div className={`w-24 h-16 rounded-lg overflow-hidden border-2 transition-colors ${currentSlide === index ? 'border-[#34D399]' : 'border-transparent'
                                    }`}>
                                    <img
                                        src={activity.image}
                                        alt={activity.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute inset-0 transition-opacity ${currentSlide === index ? 'bg-[#34D399]/20' : 'bg-black/40 group-hover:bg-black/20'
                                        }`}></div>
                                </div>
                                <div className="text-center mt-1">
                                    <div className="text-xs text-[#065F46] font-semibold truncate w-24">
                                        {activity.title}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filtros por Categorías */}
            <div className="bg-[#F3F4F6] py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-[#065F46] text-center mb-12">
                        Explora por Disciplinas Deportivas
                    </h2>

                    {/* Botones de filtro */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 ${selectedCategory === category.id
                                    ? 'bg-[#34D399] text-[#065F46] shadow-lg transform scale-105'
                                    : 'bg-white text-[#065F46] border-2 border-[#34D399] hover:bg-[#A7F3D0]'
                                    }`}
                            >
                                <span className="mr-2 text-lg">{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* Grid de actividades */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredActivities.map((activity) => (
                            <div key={activity.id} className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-[#34D399] hover:shadow-xl transition-shadow duration-200">
                                <img
                                    src={activity.image}
                                    alt={activity.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-[#065F46] flex-1">
                                            {activity.title}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}>
                                            {activity.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center text-[#065F46]">
                                            <span className="mr-2">📅</span>
                                            <span className="font-medium">{activity.date}</span>
                                        </div>
                                        <div className="flex items-center text-[#065F46]">
                                            <span className="mr-2">👥</span>
                                            <span>{activity.participants} participantes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredActivities.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🏃‍♂️</div>
                            <h3 className="text-2xl font-bold text-[#065F46] mb-2">
                                No hay actividades disponibles
                            </h3>
                            <p className="text-[#065F46] opacity-70">
                                Pronto habrá nuevas actividades en esta categoría
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tablas de Posiciones */}
            <div className="bg-gradient-to-b from-white to-[#F3F4F6] py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#065F46] mb-4">
                            Tablas de Posiciones
                        </h2>
                        <p className="text-lg text-[#065F46] opacity-80">
                            Consulta las estadísticas en vivo de todos los campeonatos
                        </p>
                    </div>

                    {/* Selector de Campeonatos */}
                    <div className="mb-8 flex flex-wrap justify-center gap-3">
                        {campeonatos.map(camp => (
                            <button
                                key={camp.id}
                                onClick={() => setCampeonatoSeleccionado(camp.id)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                    campeonatoSeleccionado === camp.id
                                        ? 'bg-gradient-to-r from-[#34D399] to-[#065F46] text-white shadow-lg transform scale-105'
                                        : 'bg-white text-[#065F46] border-2 border-[#34D399] hover:bg-[#A7F3D0]'
                                }`}
                            >
                                {camp.Nombre}
                            </button>
                        ))}
                    </div>

                    {/* Tabla de Posiciones del Campeonato Seleccionado */}
                    {campeonatoSeleccionado && (() => {
                        const tablaEquipos = historiales
                            .filter(h => h.IDCampeonato === campeonatoSeleccionado)
                            .sort((a, b) => {
                                if (b.Puntos !== a.Puntos) return b.Puntos - a.Puntos;
                                if (b.DG !== a.DG) return b.DG - a.DG;
                                return b.GF - a.GF;
                            })
                            .map((h, index) => {
                                const equipo = equipos.find(e => e.id === h.IDEquipo);
                                return { ...h, equipoNombre: equipo?.Nombre || 'Equipo', posicion: index + 1 };
                            });

                        const campeonato = campeonatos.find(c => c.id === campeonatoSeleccionado);

                        return (
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#34D399]">
                                {/* Header de la Tabla */}
                                <div className="bg-gradient-to-r from-[#065F46] to-[#34D399] p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-2">{campeonato?.Nombre}</h3>
                                            <div className="flex gap-4 text-sm opacity-90">
                                                <span>🏆 {deportes.find(d => d.id === campeonato?.IDDeporte)?.Nombre || 'Deporte'}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    campeonato?.Estado === 'En Curso' ? 'bg-green-400 text-green-900' :
                                                    campeonato?.Estado === 'Finalizado' ? 'bg-gray-400 text-gray-900' :
                                                    'bg-yellow-400 text-yellow-900'
                                                }`}>
                                                    {campeonato?.Estado}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm opacity-90">Equipos Participantes</div>
                                            <div className="text-4xl font-bold">{tablaEquipos.length}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabla Responsive */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#F3F4F6]">
                                            <tr>
                                                <th className="px-4 py-4 text-left text-sm font-bold text-[#065F46]">Pos</th>
                                                <th className="px-4 py-4 text-left text-sm font-bold text-[#065F46]">Equipo</th>
                                                <th className="px-4 py-4 text-center text-sm font-bold text-[#065F46]">PJ</th>
                                                <th className="px-4 py-4 text-center text-sm font-bold text-[#065F46]">PG</th>
                                                <th className="px-4 py-4 text-center text-sm font-bold text-[#065F46]">PE</th>
                                                <th className="px-4 py-4 text-center text-sm font-bold text-[#065F46]">PP</th>
                                                <th className="px-4 py-4 text-center text-sm font-bold text-[#065F46]">GF</th>
                                                <th className="px-4 py-4 text-center text-sm font-bold text-[#065F46]">GC</th>
                                                <th className="px-4 py-4 text-center text-sm font-bold text-[#065F46]">DG</th>
                                                <th className="px-4 py-4 text-center text-sm font-bold text-[#065F46] bg-[#34D399] text-white">PTS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tablaEquipos.length === 0 ? (
                                                <tr>
                                                    <td colSpan="10" className="px-4 py-12 text-center text-[#065F46] opacity-70">
                                                        No hay estadísticas disponibles para este campeonato
                                                    </td>
                                                </tr>
                                            ) : (
                                                tablaEquipos.map((equipo, index) => (
                                                    <tr
                                                        key={equipo.id}
                                                        className={`border-b border-gray-200 hover:bg-[#F9FAFB] transition-colors ${
                                                            index < 3 ? 'bg-green-50' : ''
                                                        }`}
                                                    >
                                                        <td className="px-4 py-4">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                                index === 1 ? 'bg-gray-300 text-gray-900' :
                                                                index === 2 ? 'bg-orange-400 text-orange-900' :
                                                                'bg-[#E5E7EB] text-[#065F46]'
                                                            }`}>
                                                                {equipo.posicion}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="font-semibold text-[#065F46]">{equipo.equipoNombre}</div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-[#065F46]">{equipo.PJ}</td>
                                                        <td className="px-4 py-4 text-center text-green-600 font-semibold">{equipo.PG}</td>
                                                        <td className="px-4 py-4 text-center text-yellow-600 font-semibold">{equipo.PE}</td>
                                                        <td className="px-4 py-4 text-center text-red-600 font-semibold">{equipo.PP}</td>
                                                        <td className="px-4 py-4 text-center text-[#065F46]">{equipo.GF}</td>
                                                        <td className="px-4 py-4 text-center text-[#065F46]">{equipo.GC}</td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`font-semibold ${
                                                                equipo.DG > 0 ? 'text-green-600' :
                                                                equipo.DG < 0 ? 'text-red-600' :
                                                                'text-[#065F46]'
                                                            }`}>
                                                                {equipo.DG > 0 ? '+' : ''}{equipo.DG}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-block bg-[#34D399] text-white font-bold px-3 py-1 rounded-full">
                                                                {equipo.Puntos}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Leyenda */}
                                <div className="bg-[#F3F4F6] p-4 border-t-2 border-[#34D399]">
                                    <div className="flex flex-wrap gap-4 text-xs text-[#065F46]">
                                        <span><strong>PJ:</strong> Partidos Jugados</span>
                                        <span><strong>PG:</strong> Partidos Ganados</span>
                                        <span><strong>PE:</strong> Partidos Empatados</span>
                                        <span><strong>PP:</strong> Partidos Perdidos</span>
                                        <span><strong>GF:</strong> Goles a Favor</span>
                                        <span><strong>GC:</strong> Goles en Contra</span>
                                        <span><strong>DG:</strong> Diferencia de Goles</span>
                                        <span><strong>PTS:</strong> Puntos</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Sección de Predicciones con IA */}
            <div className="bg-gradient-to-b from-[#F3F4F6] to-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center animate-pulse">
                                <span className="text-2xl">🤖</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                                Predicciones con IA
                            </h2>
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center animate-pulse">
                                <span className="text-2xl">⚡</span>
                            </div>
                        </div>
                        <p className="text-lg text-[#065F46] opacity-80 mb-6">
                            Machine Learning analiza el historial de equipos para predecir su rendimiento futuro
                        </p>
                        
                        {/* Botón para generar predicciones */}
                        <button
                            onClick={predicciones_controllers}
                            disabled={loadingPrediccion || !campeonatoSeleccionado}
                            className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                                loadingPrediccion || !campeonatoSeleccionado
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {loadingPrediccion ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Analizando datos...
                                </>
                            ) : (
                                <>
                                    <span>🎯</span>
                                    Generar Predicciones de Rendimiento
                                </>
                            )}
                        </button>
                    </div>

                    {/* Mostrar predicciones */}
                    {predicciones.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            {predicciones.map((pred, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 hover:transform hover:scale-105"
                                >
                                    {/* Header con gradiente */}
                                    <div className={`p-6 bg-gradient-to-r ${
                                        pred.posicionEstimada === 1 ? 'from-yellow-400 to-yellow-600' :
                                        pred.posicionEstimada === 2 ? 'from-gray-300 to-gray-500' :
                                        pred.posicionEstimada === 3 ? 'from-orange-400 to-orange-600' :
                                        'from-emerald-400 to-teal-400'
                                    } text-white`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold truncate">{pred.equipo}</h3>
                                            <div className="text-3xl font-black">#{pred.posicionEstimada}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm opacity-90">Posición Estimada</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                pred.tendencia === 'ascendente' ? 'bg-green-500' :
                                                pred.tendencia === 'descendente' ? 'bg-red-500' :
                                                'bg-yellow-500'
                                            }`}>
                                                {pred.tendencia === 'ascendente' ? '📈' : pred.tendencia === 'descendente' ? '📉' : '➡️'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Estadísticas predichas */}
                                    <div className="p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                                <div className="text-2xl font-bold text-emerald-600">{pred.puntosEstimados}</div>
                                                <div className="text-xs text-emerald-800 font-semibold">Puntos Est.</div>
                                            </div>
                                            <div className="bg-teal-50 rounded-lg p-3 text-center">
                                                <div className="text-2xl font-bold text-teal-600">{pred.golesEstimados}</div>
                                                <div className="text-xs text-teal-800 font-semibold">Goles Est.</div>
                                            </div>
                                        </div>

                                        {/* Probabilidad Top 3 */}
                                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-[#065F46]">Prob. Top 3</span>
                                                <span className="text-lg font-bold text-emerald-600">{pred.probabilidadTop3}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: pred.probabilidadTop3 }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Análisis breve */}
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-sm text-[#065F46] leading-relaxed">{pred.analisis}</p>
                                        </div>

                                        {/* Botón de análisis detallado */}
                                        <button
                                            onClick={() => analizarEquipo(equipos.find(e => e.Nombre === pred.equipo)?.id)}
                                            disabled={loadingPrediccion}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            {loadingPrediccion && equipoSeleccionadoIA === equipos.find(e => e.Nombre === pred.equipo)?.id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Analizando...
                                                </>
                                            ) : (
                                                <>
                                                    🔍 Análisis Detallado
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                 
                </div>
            </div>

            {/* Sección de Predicción de Partidos */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center animate-pulse">
                                <span className="text-2xl">⚽</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                                Predicción de Partidos
                            </h2>
                            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center animate-pulse">
                                <span className="text-2xl">📊</span>
                            </div>
                        </div>
                        <p className="text-lg text-[#065F46] opacity-80 mb-6">
                            Predice el resultado de los próximos encuentros basándose en el historial de ambos equipos
                        </p>

                        {/* Selector de Campeonato */}
                        <div className="max-w-md mx-auto mb-8">
                            <label className="block text-sm font-semibold text-[#065F46] mb-2">
                                Selecciona un Campeonato
                            </label>
                            <select
                                value={campeonatoPartidos || ''}
                                onChange={handleCampeonatoPartidosChange}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl bg-blue-50 text-[#065F46] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-semibold"
                            >
                                <option value="">-- Selecciona un campeonato --</option>
                                {campeonatos
                                    .filter(camp => camp.Estado === 'En Curso' || camp.Estado === 'Planificado')
                                    .map(camp => (
                                        <option key={camp.id} value={camp.id}>
                                            {camp.Nombre} ({camp.Estado})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        {/* Filtros por Jornada y Equipo */}
                        {campeonatoPartidos && partidosSinFiltrar.length > 0 && (
                            <div className="max-w-4xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Filtro por Jornada */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#065F46] mb-2">
                                        Filtrar por Jornada
                                    </label>
                                    <select
                                        value={filtroJornada}
                                        onChange={(e) => setFiltroJornada(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-cyan-300 rounded-xl bg-cyan-50 text-[#065F46] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition font-semibold"
                                    >
                                        <option value="todas">Todas las Jornadas</option>
                                        {jornadasDisponibles.map(jornada => (
                                            <option key={jornada} value={jornada}>
                                                Jornada {jornada}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Equipo */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#065F46] mb-2">
                                        Filtrar por Equipo
                                    </label>
                                    <select
                                        value={filtroEquipo}
                                        onChange={(e) => setFiltroEquipo(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-cyan-300 rounded-xl bg-cyan-50 text-[#065F46] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition font-semibold"
                                    >
                                        <option value="todos">Todos los Equipos</option>
                                        {equiposDisponibles.map(equipo => (
                                            <option key={equipo.id} value={equipo.id}>
                                                {equipo.Nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mensaje si no hay campeonato seleccionado */}
                    {!campeonatoPartidos && (
                        <div className="text-center py-12">
                            <div className="inline-block bg-blue-50 rounded-full p-6 mb-4">
                                <span className="text-6xl">🏆</span>
                            </div>
                            <p className="text-xl text-[#065F46] font-semibold">
                                Selecciona un campeonato para ver los partidos pendientes
                            </p>
                        </div>
                    )}

                    {/* Mensaje si no hay partidos pendientes */}
                    {campeonatoPartidos && partidosPendientes.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-block bg-green-50 rounded-full p-6 mb-4">
                                <span className="text-6xl">✅</span>
                            </div>
                            <p className="text-xl text-[#065F46] font-semibold">
                                No hay partidos pendientes en este campeonato
                            </p>
                            <p className="text-gray-600 mt-2">
                                Todos los partidos ya han sido jugados o aún no están programados
                            </p>
                        </div>
                    )}

                    {/* Lista de partidos pendientes */}
                    {campeonatoPartidos && partidosPendientes.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {partidosPendientes.map((partido) => (
                            <div key={partido.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl">
                                <div className="text-center mb-4">
                                    <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold mb-2">
                                        Jornada {partido.jornada}
                                    </div>
                                    <div className="text-sm text-[#065F46] font-semibold">
                                        {new Date(partido.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex-1 text-center">
                                        <div className="text-lg font-bold text-[#065F46] mb-1">{partido.equipoLocal.Nombre}</div>
                                        <div className="text-xs text-gray-500">Local</div>
                                    </div>
                                    <div className="px-4">
                                        <div className="text-2xl font-black text-blue-600">VS</div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="text-lg font-bold text-[#065F46] mb-1">{partido.equipoVisitante.Nombre}</div>
                                        <div className="text-xs text-gray-500">Visitante</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => prediccion_controllers(partido)}
                                    disabled={loadingPartido}
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingPartido && partidoEnAnalisis === partido.id ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Analizando...
                                        </>
                                    ) : (
                                        <>
                                            🎲 Predecir Resultado
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                    )}

                    {/* Resultado de la predicción */}
                    {prediccionPartido && !loadingPartido && (
                        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl p-8 border-4 border-blue-300 shadow-2xl">
                            <div className="text-center mb-6">
                                <h3 className="text-3xl font-black text-blue-900 mb-2">Predicción del Partido</h3>
                                <p className="text-blue-700">Basado en análisis de Machine Learning</p>
                            </div>

                            {prediccionPartido.error ? (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
                                    <p className="font-bold">No se pudo generar la predicción</p>
                                    <p>{prediccionPartido.mensaje}</p>
                                </div>
                            ) : (
                                <>
                                    {/* Marcador predicho */}
                                    <div className="bg-white rounded-2xl p-8 mb-6 shadow-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 text-center">
                                                <div className="text-2xl font-bold text-[#065F46] mb-2">{prediccionPartido.partido.equipoLocal.Nombre}</div>
                                                <div className="text-6xl font-black text-blue-600">{prediccionPartido.marcadorPredicho.local}</div>
                                            </div>
                                            <div className="px-6">
                                                <div className="text-4xl font-black text-gray-400">-</div>
                                            </div>
                                            <div className="flex-1 text-center">
                                                <div className="text-2xl font-bold text-[#065F46] mb-2">{prediccionPartido.partido.equipoVisitante.Nombre}</div>
                                                <div className="text-6xl font-black text-cyan-600">{prediccionPartido.marcadorPredicho.visitante}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Probabilidades */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-white rounded-xl p-4 text-center shadow-lg">
                                            <div className="text-3xl font-bold text-blue-600 mb-1">{prediccionPartido.probabilidades.victoriaLocal}</div>
                                            <div className="text-sm font-semibold text-[#065F46]">Victoria Local</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: prediccionPartido.probabilidades.victoriaLocal }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 text-center shadow-lg">
                                            <div className="text-3xl font-bold text-yellow-600 mb-1">{prediccionPartido.probabilidades.empate}</div>
                                            <div className="text-sm font-semibold text-[#065F46]">Empate</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: prediccionPartido.probabilidades.empate }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 text-center shadow-lg">
                                            <div className="text-3xl font-bold text-cyan-600 mb-1">{prediccionPartido.probabilidades.victoriaVisitante}</div>
                                            <div className="text-sm font-semibold text-[#065F46]">Victoria Visitante</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div className="bg-cyan-600 h-2 rounded-full" style={{ width: prediccionPartido.probabilidades.victoriaVisitante }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confianza y factores */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white rounded-xl p-4 shadow-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-[#065F46]">Confianza de la Predicción</span>
                                                <span className="text-2xl font-black text-emerald-600">{prediccionPartido.confianza}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full" style={{ width: prediccionPartido.confianza }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 shadow-lg">
                                            <div className="text-sm font-bold text-[#065F46] mb-2">Factores Clave:</div>
                                            <ul className="space-y-1">
                                                {prediccionPartido.factoresClave.map((factor, i) => (
                                                    <li key={i} className="text-sm text-[#065F46] flex items-center gap-2">
                                                        <span className="text-emerald-600">✓</span>
                                                        {factor}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Análisis */}
                                    <div className="bg-white rounded-xl p-6 shadow-lg">
                                        <h4 className="text-lg font-bold text-[#065F46] mb-3 flex items-center gap-2">
                                            <span>📝</span>
                                            Análisis del Partido
                                        </h4>
                                        <p className="text-[#065F46] leading-relaxed">{prediccionPartido.analisis}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Call to Action Final */}
            <div className="bg-[#065F46] text-white py-16">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl font-bold mb-6">
                        ¡Únete a la Comunidad Deportiva UAGRM!
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Descubre tu potencial, supera tus límites y forma parte de la familia deportiva universitaria
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-[#34D399] hover:bg-[#A7F3D0] text-[#065F46] font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
                        >
                            Iniciar Sesión
                        </button>
                        <button 
                            onClick={() => navigate('/calendario')}
                            className="border-2 border-[#34D399] text-[#34D399] hover:bg-[#34D399] hover:text-[#065F46] font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
                        >
                            Ver Calendario
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home