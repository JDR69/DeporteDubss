import React, { useState, useEffect } from 'react';
import { 
    getPartidos, getFixtures, getInstalaciones, getEquipos, getResultados,
    createPartido, updatePartido, deletePartido,
    createResultado, updateResultado
} from '../api/auth';
import Loading from '../components/loading';

function PartidosPage() {
    const [partidos, setPartidos] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [instalaciones, setInstalaciones] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        IDFixture: '',
        IDInstalacion: '',
        IDResultado: '',
        IDEquipo_Local: '',
        IDEquipo_Visitante: '',
        Goles_Local: '',
        Goles_Visitante: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resPartidos, resFixtures, resInstalaciones, resEquipos, resResultados] = await Promise.all([
                getPartidos(),
                getFixtures(),
                getInstalaciones(),
                getEquipos(),
                getResultados()
            ]);
            setPartidos(resPartidos.data);
            setFixtures(resFixtures.data);
            setInstalaciones(resInstalaciones.data);
            setEquipos(resEquipos.data);
            setResultados(resResultados.data);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar datos');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');
        
        if (!formData.IDFixture || !formData.IDInstalacion || !formData.IDEquipo_Local || !formData.IDEquipo_Visitante) {
            setError('Complete todos los campos requeridos');
            return;
        }

        if (formData.IDEquipo_Local === formData.IDEquipo_Visitante) {
            setError('Los equipos local y visitante deben ser diferentes');
            return;
        }

        setLoading(true);
        try {
            let resultadoId = formData.IDResultado || null;

            const hasGoles = formData.Goles_Local !== '' && formData.Goles_Visitante !== '';
            if (hasGoles) {
                const payload = {
                    Goles_Local: parseInt(formData.Goles_Local, 10),
                    Goles_Visitante: parseInt(formData.Goles_Visitante, 10)
                };
                if (resultadoId) {
                    await updateResultado(resultadoId, payload);
                } else {
                    const res = await createResultado(payload);
                    resultadoId = res.data.id;
                }
            }

            const dataToSend = {
                IDFixture: formData.IDFixture,
                IDInstalacion: formData.IDInstalacion,
                IDEquipo_Local: formData.IDEquipo_Local,
                IDEquipo_Visitante: formData.IDEquipo_Visitante,
                IDResultado: resultadoId
            };

            if (editingId) {
                await updatePartido(editingId, dataToSend);
                setMensaje('Partido actualizado exitosamente');
            } else {
                await createPartido(dataToSend);
                setMensaje('Partido creado exitosamente');
            }
            resetForm();
            loadData();
        } catch (err) {
            console.error('Error al guardar partido:', err);
            setError(err.response?.data?.detail || 'Error al guardar partido');
        }
        setLoading(false);
    };

    const handleEdit = (partido) => {
        setEditingId(partido.id);
        setFormData({
            IDFixture: partido.IDFixture?.id || partido.IDFixture,
            IDInstalacion: partido.IDInstalacion?.id || partido.IDInstalacion,
            IDResultado: partido.IDResultado?.id || partido.IDResultado || '',
            IDEquipo_Local: partido.IDEquipo_Local?.id || partido.IDEquipo_Local,
            IDEquipo_Visitante: partido.IDEquipo_Visitante?.id || partido.IDEquipo_Visitante
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este partido?')) return;
        
        setLoading(true);
        try {
            await deletePartido(id);
            setMensaje('Partido eliminado exitosamente');
            loadData();
        } catch (err) {
            console.error('Error al eliminar partido:', err);
            setError('Error al eliminar partido');
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            IDFixture: '',
            IDInstalacion: '',
            IDResultado: '',
            IDEquipo_Local: '',
            IDEquipo_Visitante: '',
            Goles_Local: '',
            Goles_Visitante: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    // Helper functions to get names from IDs
    const getEquipoName = (id) => {
        if (!id) return 'Desconocido';
        // Handle if it's already an object
        if (typeof id === 'object' && id.Nombre) return id.Nombre;
        const equipo = equipos.find(e => e.id === id);
        return equipo ? equipo.Nombre : 'Desconocido';
    };

    const getInstalacionName = (id) => {
        if (!id) return 'N/A';
        if (typeof id === 'object' && id.Nombre) return id.Nombre;
        const instalacion = instalaciones.find(i => i.id === id);
        return instalacion ? instalacion.Nombre : 'N/A';
    };

    const getResultadoText = (id) => {
        if (!id) return 'Pendiente';
        if (typeof id === 'object') return `${id.Goles_Local} - ${id.Goles_Visitante}`;
        
        const resultado = resultados.find(r => r.id === id);
        return resultado ? `${resultado.Goles_Local} - ${resultado.Goles_Visitante}` : 'Pendiente';
    };
    
    const getFixtureName = (id) => {
        const fixtureId = typeof id === 'object' ? id.id : id;
        return `Jornada ${fixtureId}`;
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <Loading show={loading} message="Procesando..." />
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#065F46]">Gestión de Partidos</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                    >
                        {showForm ? 'Cancelar' : 'Nuevo Partido'}
                    </button>
                </div>

                {mensaje && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{mensaje}</div>}
                {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#34D399]">
                        <h2 className="text-2xl font-bold text-[#065F46] mb-4">
                            {editingId ? 'Editar Partido' : 'Nuevo Partido'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Fixture *</label>
                                <select
                                    value={formData.IDFixture}
                                    onChange={(e) => setFormData({...formData, IDFixture: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccione un fixture</option>
                                    {fixtures.map(fix => (
                                        <option key={fix.id} value={fix.id}>
                                            Fixture #{fix.id} - {fix.IDCampeonato?.Nombre || ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Instalación *</label>
                                <select
                                    value={formData.IDInstalacion}
                                    onChange={(e) => setFormData({...formData, IDInstalacion: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccione una instalación</option>
                                    {instalaciones.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.Nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Equipo Local *</label>
                                <select
                                    value={formData.IDEquipo_Local}
                                    onChange={(e) => setFormData({...formData, IDEquipo_Local: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccione equipo local</option>
                                    {equipos.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.Nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Equipo Visitante *</label>
                                <select
                                    value={formData.IDEquipo_Visitante}
                                    onChange={(e) => setFormData({...formData, IDEquipo_Visitante: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccione equipo visitante</option>
                                    {equipos.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.Nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Goles Local</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.Goles_Local}
                                    onChange={(e) => setFormData({...formData, Goles_Local: e.target.value})}
                                    placeholder="0"
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Goles Visitante</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.Goles_Visitante}
                                    onChange={(e) => setFormData({...formData, Goles_Visitante: e.target.value})}
                                    placeholder="0"
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                                >
                                    {editingId ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-lg p-6 border border-[#34D399]">
                    <h2 className="text-2xl font-bold text-[#065F46] mb-4">Lista de Partidos</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#A7F3D0]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">ID</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Jornada</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Equipos</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Instalación</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Resultado</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {partidos.map((partido, index) => (
                                    <tr key={partido.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F3F4F6]'}>
                                        <td className="px-4 py-2 text-[#065F46]">{partido.id}</td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            {getFixtureName(partido.IDFixture)}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            {getEquipoName(partido.IDEquipo_Local)} vs {getEquipoName(partido.IDEquipo_Visitante)}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            {getInstalacionName(partido.IDInstalacion)}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46] font-bold">
                                            {getResultadoText(partido.IDResultado)}
                                        </td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleEdit(partido)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-700 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(partido.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {partidos.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No hay partidos registrados</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PartidosPage;
