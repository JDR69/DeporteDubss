
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

function RolPermisos() {
    const [permisos, setPermisos] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permisoQuery, setPermisoQuery] = useState('');
    const [rolQuery, setRolQuery] = useState('');
    const [nuevoPermiso, setNuevoPermiso] = useState({ nombre: '', descripcion: '' });
    const [nuevoRol, setNuevoRol] = useState({ nombre: '' });
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [editPermiso, setEditPermiso] = useState(null);
    const [editRol, setEditRol] = useState(null);

    useEffect(() => {
        fetchPermisos();
        fetchRoles();
    }, []);

    const fetchPermisos = async () => {
        try {
            const res = await axiosInstance.get('/api/permisos/');
            setPermisos(res.data);
        } catch (err) {
            setError('Error al cargar permisos');
        }
    };
    const fetchRoles = async () => {
        try {
            const res = await axiosInstance.get('/api/roles/');
            setRoles(res.data);
        } catch (err) {
            setError('Error al cargar roles');
        }
    };

    // CRUD Permisos
    const handleAddPermiso = async e => {
        e.preventDefault();
        setMensaje(''); setError('');
        try {
            await axiosInstance.post('/api/permisos/', nuevoPermiso);
            setNuevoPermiso({ nombre: '', descripcion: '' });
            setMensaje('Permiso creado');
            fetchPermisos();
        } catch {
            setError('Error al crear permiso');
        }
    };
    const handleEditPermiso = permiso => setEditPermiso(permiso);
    const handleUpdatePermiso = async e => {
        e.preventDefault();
        setMensaje(''); setError('');
        try {
            await axiosInstance.put(`/api/permisos/${editPermiso.id}/`, editPermiso);
            setEditPermiso(null);
            setMensaje('Permiso actualizado');
            fetchPermisos();
        } catch {
            setError('Error al actualizar permiso');
        }
    };
    const handleDeletePermiso = async id => {
        setMensaje(''); setError('');
        try {
            await axiosInstance.delete(`/api/permisos/${id}/`);
            setMensaje('Permiso eliminado');
            fetchPermisos();
        } catch {
            setError('Error al eliminar permiso');
        }
    };

    // CRUD Roles
    const handleAddRol = async e => {
        e.preventDefault();
        setMensaje(''); setError('');
        try {
            await axiosInstance.post('/api/roles/', nuevoRol);
            setNuevoRol({ nombre: '' });
            setMensaje('Rol creado');
            fetchRoles();
        } catch {
            setError('Error al crear rol');
        }
    };
    const handleEditRol = rol => setEditRol(rol);
    const handleUpdateRol = async e => {
        e.preventDefault();
        setMensaje(''); setError('');
        try {
            await axiosInstance.put(`/api/roles/${editRol.id}/`, editRol);
            setEditRol(null);
            setMensaje('Rol actualizado');
            fetchRoles();
        } catch {
            setError('Error al actualizar rol');
        }
    };
    const handleDeleteRol = async id => {
        setMensaje(''); setError('');
        try {
            await axiosInstance.delete(`/api/roles/${id}/`);
            setMensaje('Rol eliminado');
            fetchRoles();
        } catch {
            setError('Error al eliminar rol');
        }
    };

    const filteredPermisos = permisos.filter(p =>
        p.nombre.toLowerCase().includes(permisoQuery.toLowerCase())
    );
    const filteredRoles = roles.filter(r =>
        r.nombre.toLowerCase().includes(rolQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-[#065F46] mb-6">Permisos</h1>
                <form className="flex gap-2 mb-4" onSubmit={editPermiso ? handleUpdatePermiso : handleAddPermiso}>
                    <input
                        type="text"
                        placeholder="Nombre permiso"
                        value={editPermiso ? editPermiso.nombre : nuevoPermiso.nombre}
                        onChange={e => editPermiso ? setEditPermiso({ ...editPermiso, nombre: e.target.value }) : setNuevoPermiso({ ...nuevoPermiso, nombre: e.target.value })}
                        className="flex-1 px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Descripción"
                        value={editPermiso ? editPermiso.descripcion : nuevoPermiso.descripcion}
                        onChange={e => editPermiso ? setEditPermiso({ ...editPermiso, descripcion: e.target.value }) : setNuevoPermiso({ ...nuevoPermiso, descripcion: e.target.value })}
                        className="flex-1 px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                        required
                    />
                    <button type="submit" className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition">
                        {editPermiso ? 'Actualizar' : 'Agregar'}
                    </button>
                    {editPermiso && (
                        <button type="button" onClick={() => setEditPermiso(null)} className="px-4 py-2 bg-gray-300 text-[#065F46] rounded-lg font-semibold ml-2">Cancelar</button>
                    )}
                </form>
                <input
                    type="text"
                    placeholder="Buscar permiso"
                    value={permisoQuery}
                    onChange={e => setPermisoQuery(e.target.value)}
                    className="mb-2 px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                />
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow border border-[#34D399]">
                        <thead className="bg-[#A7F3D0]">
                            <tr>
                                <th className="px-4 py-2 text-left text-[#065F46]">Nombre</th>
                                <th className="px-4 py-2 text-left text-[#065F46]">Descripción</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPermisos.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-4 text-center text-[#065F46]">No hay permisos encontrados.</td>
                                </tr>
                            ) : (
                                filteredPermisos.map(p => (
                                    <tr key={p.id} className="border-b border-[#34D399]">
                                        <td className="px-4 py-2 text-[#065F46]">{p.nombre}</td>
                                        <td className="px-4 py-2 text-[#065F46]">{p.descripcion}</td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <button onClick={() => handleEditPermiso(p)} className="text-blue-600 hover:underline">Editar</button>
                                            <button onClick={() => handleDeletePermiso(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <h1 className="text-3xl font-bold text-[#065F46] mt-10 mb-6">Roles</h1>
                <form className="flex gap-2 mb-4" onSubmit={editRol ? handleUpdateRol : handleAddRol}>
                    <input
                        type="text"
                        placeholder="Nombre rol"
                        value={editRol ? editRol.nombre : nuevoRol.nombre}
                        onChange={e => editRol ? setEditRol({ ...editRol, nombre: e.target.value }) : setNuevoRol({ ...nuevoRol, nombre: e.target.value })}
                        className="flex-1 px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                        required
                    />
                    <button type="submit" className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition">
                        {editRol ? 'Actualizar' : 'Agregar'}
                    </button>
                    {editRol && (
                        <button type="button" onClick={() => setEditRol(null)} className="px-4 py-2 bg-gray-300 text-[#065F46] rounded-lg font-semibold ml-2">Cancelar</button>
                    )}
                </form>
                <input
                    type="text"
                    placeholder="Buscar rol"
                    value={rolQuery}
                    onChange={e => setRolQuery(e.target.value)}
                    className="mb-2 px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                />
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow border border-[#34D399]">
                        <thead className="bg-[#A7F3D0]">
                            <tr>
                                <th className="px-4 py-2 text-left text-[#065F46]">Nombre</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoles.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-4 py-4 text-center text-[#065F46]">No hay roles encontrados.</td>
                                </tr>
                            ) : (
                                filteredRoles.map(r => (
                                    <tr key={r.id} className="border-b border-[#34D399]">
                                        <td className="px-4 py-2 text-[#065F46]">{r.nombre}</td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <button onClick={() => handleEditRol(r)} className="text-blue-600 hover:underline">Editar</button>
                                            <button onClick={() => handleDeleteRol(r.id)} className="text-red-600 hover:underline">Eliminar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-10 text-center min-h-8">
                    {mensaje && <p className="text-green-700 font-semibold">{mensaje}</p>}
                    {error && <p className="text-red-600 font-semibold">{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default RolPermisos;
