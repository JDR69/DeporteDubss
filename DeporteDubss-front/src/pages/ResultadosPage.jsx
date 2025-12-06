import React, { useState, useEffect } from 'react';
import { getResultados, createResultado, updateResultado, deleteResultado } from '../api/auth';
import Loading from '../components/loading';

function ResultadosPage() {
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        Goles_Local: 0,
        Goles_Visitante: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getResultados();
            setResultados(res.data);
        } catch (err) {
            console.error('Error al cargar resultados:', err);
            setError('Error al cargar resultados');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        setLoading(true);
        try {
            if (editingId) {
                await updateResultado(editingId, formData);
                setMensaje('Resultado actualizado exitosamente');
            } else {
                await createResultado(formData);
                setMensaje('Resultado creado exitosamente');
            }
            resetForm();
            loadData();
        } catch (err) {
            console.error('Error al guardar resultado:', err);
            setError(err.response?.data?.detail || 'Error al guardar resultado');
        }
        setLoading(false);
    };

    const handleEdit = (resultado) => {
        setEditingId(resultado.id);
        setFormData({
            Goles_Local: resultado.Goles_Local,
            Goles_Visitante: resultado.Goles_Visitante
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este resultado?')) return;
        
        setLoading(true);
        try {
            await deleteResultado(id);
            setMensaje('Resultado eliminado exitosamente');
            loadData();
        } catch (err) {
            console.error('Error al eliminar resultado:', err);
            setError('Error al eliminar resultado');
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({ Goles_Local: 0, Goles_Visitante: 0 });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <Loading show={loading} message="Procesando..." />
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#065F46]">Gestión de Resultados</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                    >
                        {showForm ? 'Cancelar' : 'Nuevo Resultado'}
                    </button>
                </div>

                {mensaje && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{mensaje}</div>}
                {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#34D399]">
                        <h2 className="text-2xl font-bold text-[#065F46] mb-4">
                            {editingId ? 'Editar Resultado' : 'Nuevo Resultado'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Goles Local</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.Goles_Local}
                                    onChange={(e) => setFormData({...formData, Goles_Local: parseInt(e.target.value) || 0})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Goles Visitante</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.Goles_Visitante}
                                    onChange={(e) => setFormData({...formData, Goles_Visitante: parseInt(e.target.value) || 0})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="col-span-2 flex gap-4">
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
                    <h2 className="text-2xl font-bold text-[#065F46] mb-4">Lista de Resultados</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#A7F3D0]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">ID</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Goles Local</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Goles Visitante</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Marcador</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.map((resultado, index) => (
                                    <tr key={resultado.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F3F4F6]'}>
                                        <td className="px-4 py-2 text-[#065F46]">{resultado.id}</td>
                                        <td className="px-4 py-2 text-[#065F46]">{resultado.Goles_Local}</td>
                                        <td className="px-4 py-2 text-[#065F46]">{resultado.Goles_Visitante}</td>
                                        <td className="px-4 py-2 text-[#065F46] font-bold">
                                            {resultado.Goles_Local} - {resultado.Goles_Visitante}
                                        </td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleEdit(resultado)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-700 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(resultado.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {resultados.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No hay resultados registrados</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResultadosPage;
