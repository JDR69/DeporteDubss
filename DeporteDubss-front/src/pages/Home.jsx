import React, { useState } from 'react'

const Home = () => {
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [currentSlide, setCurrentSlide] = useState(0);

    // Datos de ejemplo para el carrusel
    const featuredActivities = [
        {
            id: 1,
            title: "Torneo de Fútbol Universitario 2024",
            image: "https://tse1.mm.bing.net/th/id/OIP.V9sOj0mNN5AEU0o9wwBr2AHaKe?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
            date: "25 Oct 2024",
            status: "En curso",
            description: "Gran torneo interuniversitario con la participación de 16 equipos de diferentes facultades.",
            participants: 320
        },
        {
            id: 2,
            title: "Campeonato de Baloncesto",
            image: "https://tse1.mm.bing.net/th/id/OIP.V9sOj0mNN5AEU0o9wwBr2AHaKe?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
            date: "28 Oct 2024",
            status: "Próximamente",
            description: "Emocionante competencia de baloncesto con equipos masculinos y femeninos.",
            participants: 180
        },
        {
            id: 3,
            title: "Maratón Universitaria UAGRM",
            image: "https://tse1.mm.bing.net/th/id/OIP.V9sOj0mNN5AEU0o9wwBr2AHaKe?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
            date: "30 Oct 2024",
            status: "Inscripciones abiertas",
            description: "Carrera de 10K por el campus universitario con premios para los primeros lugares.",
            participants: 250
        }
    ];

    // Categorías deportivas
    const categories = [
        { id: 'todas', name: 'Todas', icon: '🏆' },
        { id: 'futbol', name: 'Fútbol', icon: '⚽' },
        { id: 'baloncesto', name: 'Baloncesto', icon: '🏀' },
        { id: 'voleibol', name: 'Voleibol', icon: '🏐' },
        { id: 'atletismo', name: 'Atletismo', icon: '🏃‍♂️' },
        { id: 'natacion', name: 'Natación', icon: '🏊‍♀️' },
        { id: 'tenis', name: 'Tenis', icon: '🎾' },
        { id: 'otros', name: 'Otros', icon: '🏅' }
    ];

    // Actividades por categorías
    const activities = [
        {
            id: 1,
            title: "Liga de Fútbol Sala",
            category: "futbol",
            date: "Nov 5",
            status: "Activa",
            participants: 120,
            image: "https://www.anfp.cl/wp-content/uploads/2024/12/Liga-Evolucion-Futsal-Chile.jpg"
        },
        {
            id: 2,
            title: "Torneo 3x3 Baloncesto",
            category: "baloncesto",
            date: "Nov 8",
            status: "Inscripciones",
            participants: 64,
            image: "https://tse1.mm.bing.net/th/id/OIP.V9sOj0mNN5AEU0o9wwBr2AHaKe?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3"
        },
        {
            id: 3,
            title: "Copa de Voleibol Femenino",
            category: "voleibol",
            date: "Nov 12",
            status: "Próximamente",
            participants: 96,
            image: "https://www.anfp.cl/wp-content/uploads/2024/12/Liga-Evolucion-Futsal-Chile.jpg"
        },
        {
            id: 4,
            title: "Competencia de Natación",
            category: "natacion",
            date: "Nov 15",
            status: "Inscripciones",
            participants: 45,
            image: "https://www.anfp.cl/wp-content/uploads/2024/12/Liga-Evolucion-Futsal-Chile.jpg"
        },
        {
            id: 5,
            title: "Torneo de Tenis Individual",
            category: "tenis",
            date: "Nov 18",
            status: "Próximamente",
            participants: 32,
            image: "https://www.anfp.cl/wp-content/uploads/2024/12/Liga-Evolucion-Futsal-Chile.jpg"
        },
        {
            id: 6,
            title: "Cross Country Universitario",
            category: "atletismo",
            date: "Nov 20",
            status: "Activa",
            participants: 150,
            image: "/api/placeholder/300/200"
        }
    ];

    const filteredActivities = selectedCategory === 'todas'
        ? activities
        : activities.filter(activity => activity.category === selectedCategory);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % featuredActivities.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + featuredActivities.length) % featuredActivities.length);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Activa':
            case 'En curso':
                return 'bg-[#34D399] text-[#065F46]';
            case 'Inscripciones':
            case 'Inscripciones abiertas':
                return 'bg-yellow-500 text-black';
            case 'Próximamente':
                return 'bg-[#A7F3D0] text-[#065F46]';
            default:
                return 'bg-[#E5E7EB] text-[#065F46]';
        }
    };

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
                                                <button className="group bg-gradient-to-r from-[#34D399] to-[#065F46] hover:from-[#065F46] hover:to-[#34D399] text-white font-bold py-3 px-6 rounded-xl text-base transition-all duration-300 transform hover:scale-105 shadow-xl">
                                                    <span className="flex items-center justify-center">
                                                        ¡INSCRÍBETE!
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

                                    <button className="w-full mt-4 bg-[#34D399] hover:bg-[#065F46] text-[#065F46] hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                                        Ver detalles
                                    </button>
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
                        <button className="bg-[#34D399] hover:bg-[#A7F3D0] text-[#065F46] font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200">
                            Inscríbete Ahora
                        </button>
                        <button className="border-2 border-[#34D399] text-[#34D399] hover:bg-[#34D399] hover:text-[#065F46] font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200">
                            Ver Calendario
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home