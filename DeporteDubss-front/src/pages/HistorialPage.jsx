import React, { useState, useEffect } from 'react';
import { getHistoriales, getCampeonatos, getEquipos, createHistorial, updateHistorial, deleteHistorial } from '../api/auth';
import Loading from '../components/loading';

function HistorialPage() {
    const [historiales, setHistoriales] = useState([]);
    const [campeonatos, setCampeonatos] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [filterCampeonato, setFilterCampeonato] = useState('');
    
    const [formData, setFormData] = useState({
        IDCampeonato: '',
        IDEquipo: '',
        Posicion: '',
        Puntos: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resHistoriales, resCampeonatos, resEquipos] = await Promise.all([
                getHistoriales(),
                getCampeonatos(),
                getEquipos()
            ]);
            setHistoriales(resHistoriales.data);
            setCampeonatos(resCampeonatos.data);
            setEquipos(resEquipos.data);
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
        
        if (!formData.IDCampeonato || !formData.IDEquipo) {
            setError('Debe seleccionar un campeonato y un equipo');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                await updateHistorial(editingId, formData);
                setMensaje('Historial actualizado exitosamente');
            } else {
                await createHistorial(formData);
                setMensaje('Historial creado exitosamente');
            }
            resetForm();
            loadData();
        } catch (err) {
            console.error('Error al guardar historial:', err);
            setError(err.response?.data?.detail || 'Error al guardar historial');
        }
        setLoading(false);
    };

    const handleEdit = (historial) => {
        setEditingId(historial.id);
        setFormData({
            IDCampeonato: historial.IDCampeonato?.id || historial.IDCampeonato,
            IDEquipo: historial.IDEquipo?.id || historial.IDEquipo,
            Posicion: historial.Posicion || '',
            Puntos: historial.Puntos || 0
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este registro?')) return;
        
        setLoading(true);
        try {
            await deleteHistorial(id);
            setMensaje('Historial eliminado exitosamente');
            loadData();
        } catch (err) {
            console.error('Error al eliminar historial:', err);
            setError('Error al eliminar historial');
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            IDCampeonato: '',
            IDEquipo: '',
            Posicion: '',
            Puntos: 0
        });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredHistoriales = filterCampeonato 
        ? historiales.filter(h => (h.IDCampeonato?.id || h.IDCampeonato) == filterCampeonato)
        : historiales;

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <Loading show={loading} message="Procesando..." />
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#065F46]">Tabla de Posiciones</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                    >
                        {showForm ? 'Cancelar' : 'Nuevo Registro'}
                    </button>
                </div>

                {mensaje && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{mensaje}</div>}
                {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#34D399]">
                        <h2 className="text-2xl font-bold text-[#065F46] mb-4">
                            {editingId ? 'Editar Registro' : 'Nuevo Registro'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Campeonato *</label>
                                <select
                                    value={formData.IDCampeonato}
                                    onChange={(e) => setFormData({...formData, IDCampeonato: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccione un campeonato</option>
                                    {campeonatos.map(camp => (
                                        <option key={camp.id} value={camp.id}>{camp.Nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Equipo *</label>
                                <select
                                    value={formData.IDEquipo}
                                    onChange={(e) => setFormData({...formData, IDEquipo: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccione un equipo</option>
                                    {equipos.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.Nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Posición</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.Posicion}
                                    onChange={(e) => setFormData({...formData, Posicion: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Puntos</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.Puntos}
                                    onChange={(e) => setFormData({...formData, Puntos: parseInt(e.target.value) || 0})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
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
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-[#065F46]">Clasificaciones</h2>
                        <div className="w-64">
                            <select
                                value={filterCampeonato}
                                onChange={(e) => setFilterCampeonato(e.target.value)}
                                className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                            >
                                <option value="">Todos los campeonatos</option>
                                {campeonatos.map(camp => (
                                    <option key={camp.id} value={camp.id}>{camp.Nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#A7F3D0]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Pos</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Equipo</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Campeonato</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Puntos</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistoriales.map((historial, index) => (
                                    <tr key={historial.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F3F4F6]'}>
                                        <td className="px-4 py-2 text-[#065F46] font-bold">{historial.Posicion || '-'}</td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            {historial.IDEquipo?.Nombre || 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            {historial.IDCampeonato?.Nombre || 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46] font-semibold">{historial.Puntos || 0}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleEdit(historial)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-700 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(historial.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredHistoriales.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No hay registros disponibles</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HistorialPage;
