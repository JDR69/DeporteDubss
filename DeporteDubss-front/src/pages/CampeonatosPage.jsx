
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDeportes, getCategorias, createCampeonato, getCampeonatos, deleteCampeonato } from '../api/auth';
import Loading from '../components/loading';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { ROLES } from '../utils/permissions';

function CampeonatosPage() {
    const { user } = useAuth ? useAuth() : { user: null };
    const [deportes, setDeportes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [campeonatos, setCampeonatos] = useState([]);
    
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

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <Loading show={loading} message={loading ? 'Procesando...' : 'Cargando...'} />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#065F46] mb-6 text-center">Gestión de Campeonatos</h1>
                
                {/* Formulario de Creación */}
                <div className="bg-white rounded-xl shadow p-8 border border-[#34D399] mb-8">
                    <h2 className="text-xl font-bold text-[#065F46] mb-4">Crear Nuevo Campeonato</h2>
                    <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
                        <div className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-[#065F46] font-semibold mb-1">Deporte</label>
                                <input 
                                    list="deportes-list" 
                                    value={deporteNombre} 
                                    onChange={(e) => setDeporteNombre(e.target.value)} 
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] placeholder-[#065F46]/50 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                                    placeholder="Escribe o selecciona un deporte"
                                />
                                <datalist id="deportes-list">
                                    {deportes.map(d => <option key={d.id} value={d.Nombre} />)}
                                </datalist>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-[#065F46] font-semibold mb-1">Categoría</label>
                                <select 
                                    value={categoriaId} 
                                    onChange={(e) => setCategoriaId(e.target.value)} 
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.Nombre}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[#065F46] font-semibold mb-1">Nombre del Campeonato</label>
                            <input 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] placeholder-[#065F46]/50 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                                placeholder="Ej: Liga Universitaria 2024"
                            />
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-[#065F46] font-semibold mb-1">Fecha Inicio</label>
                                <input 
                                    type="date" 
                                    value={fechaInicio} 
                                    onChange={(e) => setFechaInicio(e.target.value)} 
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-[#065F46] font-semibold mb-1">Fecha Fin</label>
                                <input 
                                    type="date" 
                                    value={fechaFin} 
                                    onChange={(e) => setFechaFin(e.target.value)} 
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[#065F46] font-semibold mb-1">Logo del Campeonato</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setLogoFile(e.target.files[0])} 
                                className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                            />
                        </div>
                        {mensaje && <p className="text-green-600 font-semibold text-center">{mensaje}</p>}
                        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
                        <button 
                            onClick={handleRegistrar} 
                            className="w-full py-3 bg-[#34D399] text-white font-bold rounded-lg hover:bg-[#065F46] transition duration-300 shadow-md"
                        >
                            Registrar Campeonato
                        </button>
                    </form>
                </div>

                {/* Tabla de Campeonatos */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-[#34D399]">
                    <h2 className="text-2xl font-bold text-[#065F46] mb-4">Lista de Campeonatos</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#A7F3D0]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Logo</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Nombre</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Deporte</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Fechas</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Estado</th>
                                    {isAdmin && <th className="px-4 py-2 text-left text-[#065F46] font-bold">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {campeonatos.map((camp, index) => (
                                    <tr key={camp.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F3F4F6]'}>
                                        <td className="px-4 py-2">
                                            {camp.Logo ? (
                                                <img src={camp.Logo} alt={camp.Nombre} className="w-10 h-10 object-cover rounded-full" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs">N/A</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46] font-medium">{camp.Nombre}</td>
                                        <td className="px-4 py-2 text-[#065F46]">{camp.IDDeporte?.Nombre || camp.IDDeporte}</td>
                                        <td className="px-4 py-2 text-[#065F46] text-sm">
                                            {camp.Fecha_Inicio} - {camp.Fecha_Fin}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            <span className={`px-2 py-1 rounded text-xs ${camp.Estado === 'En Curso' ? 'bg-green-200 text-green-800' : camp.Estado === 'Finalizado' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                {camp.Estado}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => handleDelete(camp.id)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition text-sm"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {campeonatos.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No hay campeonatos registrados</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CampeonatosPage;
