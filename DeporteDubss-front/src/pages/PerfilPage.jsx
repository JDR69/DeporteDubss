import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUsuario } from '../api/auth'

const PerfilPage = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { data } = await getUsuario(user.id);
                setUserData(data);
            } catch (err) {
                console.error('Error cargando datos del usuario:', err);
                setError('Error al cargar los datos del perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user?.id]);

    const getRoleName = (rolId) => {
        const roles = {
            1: 'Administrador',
            2: 'Organizador',
            3: 'Delegado',
            4: 'Jugador'
        };
        return roles[rolId] || 'Sin Rol';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
                <div className="text-2xl text-[#065F46]">Cargando perfil...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
                <div className="text-2xl text-red-600">{error}</div>
            </div>
        );
    }

    const displayUser = userData || user || {};

    return (
        <div className="min-h-screen bg-[#ffffff] text-[#065F46] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                
                {/* Tarjeta de Perfil */}
                <div className="bg-white rounded-lg shadow-lg p-8 border border-[#34D399]">
                    <h2 className="text-3xl font-bold text-center mb-8 text-[#065F46]">
                        Mi Perfil
                    </h2>
                    
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar */}
                        <div className="flex flex-col items-center md:w-1/3">
                            <div className="w-32 h-32 rounded-full bg-[#E5E7EB] mb-4 flex items-center justify-center overflow-hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-28 h-28 text-[#34D399]" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-[#065F46]">
                                    {displayUser.Nombre} {displayUser.Apellido}
                                </h3>
                                <span className="inline-block mt-2 px-4 py-1 bg-[#34D399] text-white rounded-full text-sm font-semibold">
                                    {getRoleName(displayUser.IDRol)}
                                </span>
                            </div>
                        </div>

                        {/* Datos del Usuario */}
                        <div className="md:w-2/3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                

                                {/* Email */}
                                <div className="bg-[#F0FDF4] p-4 rounded-lg border-l-4 border-[#34D399]">
                                    <span className="block text-sm font-semibold text-[#065F46] mb-1">
                                        Correo Electrónico
                                    </span>
                                    <span className="text-lg text-[#065F46] break-words">
                                        {displayUser.Correo || displayUser.email}
                                    </span>
                                </div>

                                {/* Nombre */}
                                <div className="bg-[#F0FDF4] p-4 rounded-lg border-l-4 border-[#34D399]">
                                    <span className="block text-sm font-semibold text-[#065F46] mb-1">
                                        Nombre
                                    </span>
                                    <span className="text-lg text-[#065F46]">
                                        {displayUser.Nombre}
                                    </span>
                                </div>

                                {/* Apellido */}
                                <div className="bg-[#F0FDF4] p-4 rounded-lg border-l-4 border-[#34D399]">
                                    <span className="block text-sm font-semibold text-[#065F46] mb-1">
                                        Apellido
                                    </span>
                                    <span className="text-lg text-[#065F46]">
                                        {displayUser.Apellido}
                                    </span>
                                </div>

                                {/* CI */}
                                {displayUser.CI && (
                                    <div className="bg-[#F0FDF4] p-4 rounded-lg border-l-4 border-[#34D399]">
                                        <span className="block text-sm font-semibold text-[#065F46] mb-1">
                                            Cédula de Identidad
                                        </span>
                                        <span className="text-lg text-[#065F46]">
                                            {displayUser.CI}
                                        </span>
                                    </div>
                                )}

                                {/* Teléfono */}
                                {displayUser.Telefono && (
                                    <div className="bg-[#F0FDF4] p-4 rounded-lg border-l-4 border-[#34D399]">
                                        <span className="block text-sm font-semibold text-[#065F46] mb-1">
                                            Teléfono
                                        </span>
                                        <span className="text-lg text-[#065F46]">
                                            {displayUser.Telefono}
                                        </span>
                                    </div>
                                )}

                                {/* Dirección */}
                                {displayUser.Direccion && (
                                    <div className="bg-[#F0FDF4] p-4 rounded-lg border-l-4 border-[#34D399] md:col-span-2">
                                        <span className="block text-sm font-semibold text-[#065F46] mb-1">
                                            Dirección
                                        </span>
                                        <span className="text-lg text-[#065F46]">
                                            {displayUser.Direccion}
                                        </span>
                                    </div>
                                )}

                                {/* Fecha de Nacimiento */}
                                {displayUser.Fecha_Nacimiento && (
                                    <div className="bg-[#F0FDF4] p-4 rounded-lg border-l-4 border-[#34D399]">
                                        <span className="block text-sm font-semibold text-[#065F46] mb-1">
                                            Fecha de Nacimiento
                                        </span>
                                        <span className="text-lg text-[#065F46]">
                                            {new Date(displayUser.Fecha_Nacimiento).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                )}

                                {/* Estado */}
                                {displayUser.Estado !== undefined && (
                                    <div className="bg-[#F0FDF4] p-4 rounded-lg border-l-4 border-[#34D399]">
                                        <span className="block text-sm font-semibold text-[#065F46] mb-1">
                                            Estado
                                        </span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                            displayUser.Estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {displayUser.Estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PerfilPage