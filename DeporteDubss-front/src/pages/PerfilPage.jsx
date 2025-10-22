import React from 'react'
import { useAuth } from '../context/AuthContext'


const PerfilPage = () => {
    const { user } = useAuth();

    const displayUser = user || { id: 'cargando...', email: 'cargando...' };

    return (
    // Contenedor principal: fondo verde claro, texto verde oscuro, padding y altura mínima
    <div className="min-h-screen bg-[#ffffff] text-[#065F46] p-4 md:p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* --- COLUMNA DE PERFIL --- */}
                {/* Ocupa 1 columna en pantallas medianas y grandes */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8 border border-[#34D399]">
                        <h2 className="text-2xl font-bold text-center mb-6 text-[#065F46]">
                            Perfil
                        </h2>
                        
                        {/* Avatar Placeholder */}
                        <div className="w-28 h-28 rounded-full mx-auto bg-[#E5E7EB] mb-4 flex items-center justify-center overflow-hidden">
                            {/* Opción 1: Placeholder SVG (sin dependencias)
                                Reemplaza esto con una <img src={user.avatarUrl} /> si tienes una.
                            */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-[#34D399]" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>

                            {/* Opción 2: Usando Heroicons (si lo instalaste) */}
                            {/* <UserCircleIcon className="w-28 h-28 text-gray-500" /> */}
                        </div>

                        <div className="space-y-3 text-center">
                            <p className="text-lg">
                                <span className="font-semibold text-[#34D399] block text-sm">
                                    Email
                                </span>
                                <span className="truncate text-[#065F46]">{displayUser.email}</span>
                            </p>
                            
                        </div>

                        {/* Botón de ejemplo */}
                        <button className="w-full mt-8 bg-[#34D399] hover:bg-[#065F46] text-white font-bold py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#34D399]">
                            Editar Perfil
                        </button>
                    </div>
                </div>

                {/* --- COLUMNA DE HISTORIAL --- */}
                {/* Ocupa 3 columnas en pantallas medianas y grandes */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-[#34D399]">
                        <h2 className="text-3xl font-bold mb-6 border-b border-[#34D399] pb-3 text-[#065F46]">
                            Historial de Actividades
                        </h2>
                        
                        {/* Lista de Actividades (Placeholders de ejemplo) */}
                        <div className="space-y-5">
                            {/* Actividad 1 (Ejemplo) */}
                            <div className="bg-[#A7F3D0] p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-md hover:bg-[#34D399] transition duration-300">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#065F46]">Carrera Matutina</h3>
                                    <p className="text-sm text-[#065F46]">Parque Urbano - 5.2 km</p>
                                </div>
                                <div className="mt-2 sm:mt-0 text-left sm:text-right">
                                    <span className="text-sm font-medium text-[#065F46]">Hoy, 7:30 AM</span>
                                    <span className="block text-[#065F46] font-bold text-lg">28:30 min</span>
                                </div>
                            </div>
                            {/* Actividad 2 (Ejemplo) */}
                            <div className="bg-[#A7F3D0] p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-md hover:bg-[#34D399] transition duration-300">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#065F46]">Sesión de Gimnasio (Pecho)</h3>
                                    <p className="text-sm text-[#065F46]">Gym Center - 1h 15m</p>
                                </div>
                                <div className="mt-2 sm:mt-0 text-left sm:text-right">
                                    <span className="text-sm font-medium text-[#065F46]">Ayer, 6:00 PM</span>
                                    <span className="block text-[#34D399] font-bold text-lg">Completado</span>
                                </div>
                            </div>
                            {/* Actividad 3 (Ejemplo de algo pendiente) */}
                            <div className="bg-[#F3F4F6] p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-md hover:bg-[#A7F3D0] transition duration-300 opacity-90">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#065F46]">Partido de Fútbol</h3>
                                    <p className="text-sm text-[#065F46]">Cancha "Los Amigos"</p>
                                </div>
                                <div className="mt-2 sm:mt-0 text-left sm:text-right">
                                    <span className="text-sm font-medium text-[#065F46]">Mañana, 8:00 PM</span>
                                    <span className="block text-yellow-500 font-bold text-lg">Pendiente</span>
                                </div>
                            </div>
                            {/* Mensaje de fin de lista */}
                            <p className="text-center text-[#000000] pt-4">
                                No hay más actividades registradas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PerfilPage