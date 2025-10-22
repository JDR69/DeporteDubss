import React, { useState } from 'react'

const permisos = [
    { id: 1, nombre: 'Crear usuario', descripcion: 'Permite crear nuevos usuarios' },
    { id: 2, nombre: 'Editar perfil', descripcion: 'Permite editar perfiles existentes' },
    { id: 3, nombre: 'Eliminar instalación', descripcion: 'Permite eliminar instalaciones' },
]

const roles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Usuario' },
    { id: 3, nombre: 'Supervisor' },
]

function RolPermisos() {
    const [permisoQuery, setPermisoQuery] = useState('')
    const [rolQuery, setRolQuery] = useState('')

    const filteredPermisos = permisos.filter(p =>
        p.nombre.toLowerCase().includes(permisoQuery.toLowerCase())
    )
    const filteredRoles = roles.filter(r =>
        r.nombre.toLowerCase().includes(rolQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-[#065F46] mb-6">Permisos</h1>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Buscar permiso"
                        value={permisoQuery}
                        onChange={e => setPermisoQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                    />
                    <select className="px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46]">
                        <option value="">Filtrar por tipo</option>
                        <option value="usuario">Usuario</option>
                        <option value="instalacion">Instalación</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow border border-[#34D399]">
                        <thead className="bg-[#A7F3D0]">
                            <tr>
                                <th className="px-4 py-2 text-left text-[#065F46]">Nombre</th>
                                <th className="px-4 py-2 text-left text-[#065F46]">Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPermisos.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-4 py-4 text-center text-[#065F46]">No hay permisos encontrados.</td>
                                </tr>
                            ) : (
                                filteredPermisos.map(p => (
                                    <tr key={p.id} className="border-b border-[#34D399]">
                                        <td className="px-4 py-2 text-[#065F46]">{p.nombre}</td>
                                        <td className="px-4 py-2 text-[#065F46]">{p.descripcion}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <h1 className="text-3xl font-bold text-[#065F46] mt-10 mb-6">Roles</h1>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Buscar rol"
                        value={rolQuery}
                        onChange={e => setRolQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow border border-[#34D399]">
                        <thead className="bg-[#A7F3D0]">
                            <tr>
                                <th className="px-4 py-2 text-left text-[#065F46]">Nombre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoles.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-4 text-center text-[#065F46]">No hay roles encontrados.</td>
                                </tr>
                            ) : (
                                filteredRoles.map(r => (
                                    <tr key={r.id} className="border-b border-[#34D399]">
                                        <td className="px-4 py-2 text-[#065F46]">{r.nombre}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-10 text-center">
                    <p className="text-[#000000]">Mensajes y detalles finales aquí.</p>
                </div>
            </div>
        </div>
    )
}

export default RolPermisos
