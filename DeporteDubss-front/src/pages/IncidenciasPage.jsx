import React, { useState, useEffect } from 'react';
import { getIncidencias, getPartidos, createIncidencia, updateIncidencia, deleteIncidencia } from '../api/auth';
import Loading from '../components/loading';

function IncidenciasPage() {
    const [incidencias, setIncidencias] = useState([]);
    const [partidos, setPartidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        IDPartido: '',
        Tipo: '',
        Descripcion: ''
    });

    const tiposIncidencia = [
        { value: 1, label: 'Tarjeta Amarilla' },
        { value: 2, label: 'Tarjeta Roja' },
        { value: 3, label: 'Gol' },
        { value: 4, label: 'Lesión' },
        { value: 5, label: 'Cambio' },
        { value: 6, label: 'Falta' },
        { value: 7, label: 'Penal' },
        { value: 8, label: 'Otro' }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resIncidencias, resPartidos] = await Promise.all([
                getIncidencias(),
                getPartidos()
            ]);
            setIncidencias(resIncidencias.data);
            setPartidos(resPartidos.data);
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
        
        if (!formData.IDPartido || !formData.Descripcion) {
            setError('Complete todos los campos requeridos');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                await updateIncidencia(editingId, formData);
                setMensaje('Incidencia actualizada exitosamente');
            } else {
                await createIncidencia(formData);
                setMensaje('Incidencia creada exitosamente');
            }
            resetForm();
            loadData();
        } catch (err) {
            console.error('Error al guardar incidencia:', err);
            setError(err.response?.data?.detail || 'Error al guardar incidencia');
        }
        setLoading(false);
    };

    const handleEdit = (incidencia) => {
        setEditingId(incidencia.id);
        setFormData({
            IDPartido: incidencia.IDPartido?.id || incidencia.IDPartido,
            Tipo: incidencia.Tipo || '',
            Descripcion: incidencia.Descripcion
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar esta incidencia?')) return;
        
        setLoading(true);
        try {
            await deleteIncidencia(id);
            setMensaje('Incidencia eliminada exitosamente');
            loadData();
        } catch (err) {
            console.error('Error al eliminar incidencia:', err);
            setError('Error al eliminar incidencia');
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            IDPartido: '',
            Tipo: '',
            Descripcion: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    const getTipoLabel = (tipo) => {
        const tipoObj = tiposIncidencia.find(t => t.value == tipo);
        return tipoObj ? tipoObj.label : `Tipo ${tipo}`;
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <Loading show={loading} message="Procesando..." />
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#065F46]">Gestión de Incidencias</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                    >
                        {showForm ? 'Cancelar' : 'Nueva Incidencia'}
                    </button>
                </div>

                {mensaje && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{mensaje}</div>}
                {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#34D399]">
                        <h2 className="text-2xl font-bold text-[#065F46] mb-4">
                            {editingId ? 'Editar Incidencia' : 'Nueva Incidencia'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Partido *</label>
                                <select
                                    value={formData.IDPartido}
                                    onChange={(e) => setFormData({...formData, IDPartido: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccione un partido</option>
                                    {partidos.map(partido => (
                                        <option key={partido.id} value={partido.id}>
                                            Partido #{partido.id}: {partido.IDEquipo_Local?.Nombre || 'Local'} vs {partido.IDEquipo_Visitante?.Nombre || 'Visitante'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Tipo de Incidencia</label>
                                <select
                                    value={formData.Tipo}
                                    onChange={(e) => setFormData({...formData, Tipo: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                >
                                    <option value="">Seleccione tipo</option>
                                    {tiposIncidencia.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Descripción *</label>
                                <textarea
                                    value={formData.Descripcion}
                                    onChange={(e) => setFormData({...formData, Descripcion: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                                    rows="4"
                                    required
                                    placeholder="Describa la incidencia detalladamente..."
                                />
                            </div>
                            <div className="flex gap-4">
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
                    <h2 className="text-2xl font-bold text-[#065F46] mb-4">Lista de Incidencias</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#A7F3D0]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">ID</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Partido</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Tipo</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Descripción</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Fecha</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidencias.map((incidencia, index) => (
                                    <tr key={incidencia.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F3F4F6]'}>
                                        <td className="px-4 py-2 text-[#065F46]">{incidencia.id}</td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            Partido #{incidencia.IDPartido?.id || incidencia.IDPartido}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                                                {getTipoLabel(incidencia.Tipo)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46] max-w-xs truncate">
                                            {incidencia.Descripcion}
                                        </td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            {incidencia.Fecha ? new Date(incidencia.Fecha).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleEdit(incidencia)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-700 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(incidencia.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {incidencias.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No hay incidencias registradas</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IncidenciasPage;
