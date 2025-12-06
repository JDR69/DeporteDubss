
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDeportes, getCategorias, createCampeonato, getCampeonatos, deleteCampeonato, getCampeonatoDetalle } from '../api/auth';
import Loading from '../components/loading';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { ROLES } from '../utils/permissions';
import ChampionshipCard from '../components/championships/ChampionshipCard';
import ChampionshipDetail from '../components/championships/ChampionshipDetail';
import EnrollTeamModal from '../components/championships/EnrollTeamModal';

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4">
            <Loading show={loading} message={loading ? 'Procesando...' : 'Cargando...'} />
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-emerald-900 mb-2">Gestión de Campeonatos</h1>
                    <p className="text-emerald-700">Crea y administra campeonatos deportivos</p>
                </div>
                
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
