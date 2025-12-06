import React, { useState, useEffect } from 'react';
import { getUsuarios, getRoles, createUsuario, updateUsuario, deleteUsuario } from '../api/auth';
import Loading from '../components/loading';

function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        Nombre: '',
        Apellido: '',
        Correo: '',
        Contrasena: '',
        Fecha_Nacimiento: '',
        Genero: '',
        IDRol: '',
        Registro: '',
        Estado: 1
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resUsuarios, resRoles] = await Promise.all([
                getUsuarios(),
                getRoles()
            ]);
            setUsuarios(resUsuarios.data);
            setRoles(resRoles.data);
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
        
        if (!formData.Nombre || !formData.Apellido || !formData.Correo || !formData.IDRol) {
            setError('Complete los campos requeridos: Nombre, Apellido, Correo y Rol');
            return;
        }

        setLoading(true);
        try {
            const dataToSend = { ...formData };
            // Si estamos editando y no se cambió la contraseña, no la enviamos
            if (editingId && !dataToSend.Contrasena) {
                delete dataToSend.Contrasena;
            }
            
            if (editingId) {
                await updateUsuario(editingId, dataToSend);
                setMensaje('Usuario actualizado exitosamente');
            } else {
                if (!formData.Contrasena) {
                    setError('La contraseña es requerida para crear un usuario');
                    setLoading(false);
                    return;
                }
                await createUsuario(dataToSend);
                setMensaje('Usuario creado exitosamente');
            }
            resetForm();
            loadData();
        } catch (err) {
            console.error('Error al guardar usuario:', err);
            setError(err.response?.data?.detail || 'Error al guardar usuario');
        }
        setLoading(false);
    };

    const handleEdit = (usuario) => {
        setEditingId(usuario.id);
        setFormData({
            Nombre: usuario.Nombre,
            Apellido: usuario.Apellido,
            Correo: usuario.Correo,
            Contrasena: '',
            Fecha_Nacimiento: usuario.Fecha_Nacimiento || '',
            Genero: usuario.Genero || '',
            IDRol: usuario.IDRol?.id || usuario.IDRol,
            Registro: usuario.Registro || '',
            Estado: usuario.Estado
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
        
        setLoading(true);
        try {
            await deleteUsuario(id);
            setMensaje('Usuario eliminado exitosamente');
            loadData();
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            setError('Error al eliminar usuario');
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            Nombre: '',
            Apellido: '',
            Correo: '',
            Contrasena: '',
            Fecha_Nacimiento: '',
            Genero: '',
            IDRol: '',
            Registro: '',
            Estado: 1
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <Loading show={loading} message="Procesando..." />
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#065F46]">Gestión de Usuarios</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                    >
                        {showForm ? 'Cancelar' : 'Nuevo Usuario'}
                    </button>
                </div>

                {mensaje && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{mensaje}</div>}
                {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#34D399]">
                        <h2 className="text-2xl font-bold text-[#065F46] mb-4">
                            {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.Nombre}
                                    onChange={(e) => setFormData({...formData, Nombre: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Apellido *</label>
                                <input
                                    type="text"
                                    value={formData.Apellido}
                                    onChange={(e) => setFormData({...formData, Apellido: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Correo *</label>
                                <input
                                    type="email"
                                    value={formData.Correo}
                                    onChange={(e) => setFormData({...formData, Correo: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">
                                    Contraseña {editingId ? '(dejar vacío para no cambiar)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.Contrasena}
                                    onChange={(e) => setFormData({...formData, Contrasena: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                                    required={!editingId}
                                />
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Rol *</label>
                                <select
                                    value={formData.IDRol}
                                    onChange={(e) => setFormData({...formData, IDRol: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccione un rol</option>
                                    {roles.map(rol => (
                                        <option key={rol.id} value={rol.id}>{rol.Nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Registro</label>
                                <input
                                    type="number"
                                    value={formData.Registro}
                                    onChange={(e) => setFormData({...formData, Registro: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    value={formData.Fecha_Nacimiento}
                                    onChange={(e) => setFormData({...formData, Fecha_Nacimiento: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Género</label>
                                <select
                                    value={formData.Genero}
                                    onChange={(e) => setFormData({...formData, Genero: e.target.value})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                >
                                    <option value="">Seleccione</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#065F46] font-semibold mb-1">Estado</label>
                                <select
                                    value={formData.Estado}
                                    onChange={(e) => setFormData({...formData, Estado: parseInt(e.target.value)})}
                                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                                >
                                    <option value={1}>Activo</option>
                                    <option value={0}>Inactivo</option>
                                </select>
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
                    <h2 className="text-2xl font-bold text-[#065F46] mb-4">Lista de Usuarios</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#A7F3D0]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">ID</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Nombre</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Correo</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Rol</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Estado</th>
                                    <th className="px-4 py-2 text-left text-[#065F46] font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario, index) => (
                                    <tr key={usuario.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F3F4F6]'}>
                                        <td className="px-4 py-2 text-[#065F46]">{usuario.id}</td>
                                        <td className="px-4 py-2 text-[#065F46]">{usuario.Nombre} {usuario.Apellido}</td>
                                        <td className="px-4 py-2 text-[#065F46]">{usuario.Correo}</td>
                                        <td className="px-4 py-2 text-[#065F46]">{usuario.IDRol?.Nombre || usuario.IDRol}</td>
                                        <td className="px-4 py-2 text-[#065F46]">
                                            <span className={`px-2 py-1 rounded ${usuario.Estado ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                {usuario.Estado ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleEdit(usuario)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-700 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(usuario.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {usuarios.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No hay usuarios registrados</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UsuariosPage;
