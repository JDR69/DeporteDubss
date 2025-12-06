import React, { useState, useEffect } from 'react';
import { getFixtures, getCampeonatos, createFixture, updateFixture, deleteFixture } from '../api/auth';
import Loading from '../components/loading';

function FixturesPage() {
    const [fixtures, setFixtures] = useState([]);
    const [campeonatos, setCampeonatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        IDCampeonato: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resFixtures, resCampeonatos] = await Promise.all([
                getFixtures(),
                getCampeonatos()
            ]);
            setFixtures(resFixtures.data);
            setCampeonatos(resCampeonatos.data);
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
        
        if (!formData.IDCampeonato) {
            setError('Debe seleccionar un campeonato');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                await updateFixture(editingId, formData);
                setMensaje('Fixture actualizado exitosamente');
            } else {
                await createFixture(formData);
                setMensaje('Fixture creado exitosamente');
            }
            resetForm();
            loadData();
        } catch (err) {
            console.error('Error al guardar fixture:', err);
            setError(err.response?.data?.detail || 'Error al guardar fixture');
        }
        setLoading(false);
    };

    const handleEdit = (fixture) => {
        setEditingId(fixture.id);
        setFormData({
            IDCampeonato: fixture.IDCampeonato?.id || fixture.IDCampeonato
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este fixture?')) return;
        
        setLoading(true);
        try {
            await deleteFixture(id);
            setMensaje('Fixture eliminado exitosamente');
            loadData();
        } catch (err) {
            console.error('Error al eliminar fixture:', err);
            setError('Error al eliminar fixture');
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({ IDCampeonato: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <Loading show={loading} message="Procesando..." />
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#065F46]">Gestión de Fixtures</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                    >
                        {showForm ? 'Cancelar' : 'Nuevo Fixture'}
                    </button>
                </div>

                {mensaje && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{mensaje}</div>}
                {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#34D399]">
                        <h2 className="text-2xl font-bold text-[#065F46] mb-4">
                            {editingId ? 'Editar Fixture' : 'Nuevo Fixture'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                    <h2 className="text-2xl font-bold text-[#065F46] mb-4">Lista de Fixtures</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#A7F3D0]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">ID</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Campeonato</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fixtures.map((fixture, index) => (
                                    <tr key={fixture.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F3F4F6]'}>
                                        <td className="px-4 py-2 text-[#065F46]">{fixture.id}</td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            {fixture.IDCampeonato?.Nombre || fixture.IDCampeonato}
                                        </td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleEdit(fixture)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-700 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(fixture.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {fixtures.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No hay fixtures registrados</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FixturesPage;
