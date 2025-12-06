import React, { useState, useEffect } from 'react'
import { getInstalaciones, createInstalacion, updateInstalacion, deleteInstalacion } from '../api/auth'
import Loading from '../components/loading'

const InstalacionesPage = () => {
  const [query, setQuery] = useState('')
  const [instalaciones, setInstalaciones] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaUbicacion, setNuevaUbicacion] = useState('')
  const [nuevoEstado, setNuevoEstado] = useState(1)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadInstalaciones()
  }, [])

  const loadInstalaciones = async () => {
    setLoading(true)
    try {
      const res = await getInstalaciones()
      setInstalaciones(res.data)
    } catch (err) {
      console.error('Error al cargar instalaciones:', err)
      setError('Error al cargar instalaciones')
    }
    setLoading(false)
  }

  const filtered = instalaciones.filter(i =>
    i.Nombre?.toLowerCase().includes(query.toLowerCase()) ||
    i.Ubicacion?.toLowerCase().includes(query.toLowerCase())
  )

  const handleAddInstalacion = async e => {
    e.preventDefault()
    setMensaje('')
    setError('')
    
    if (!nuevoNombre.trim() || !nuevaUbicacion.trim()) {
      setError('Complete todos los campos')
      return
    }

    setLoading(true)
    try {
      const data = {
        Nombre: nuevoNombre,
        Ubicacion: nuevaUbicacion,
        Estado: nuevoEstado
      }
      
      if (editingId) {
        await updateInstalacion(editingId, data)
        setMensaje('Instalación actualizada exitosamente')
      } else {
        await createInstalacion(data)
        setMensaje('Instalación creada exitosamente')
      }
      
      setNuevoNombre('')
      setNuevaUbicacion('')
      setNuevoEstado(1)
      setEditingId(null)
      setModalOpen(false)
      loadInstalaciones()
    } catch (err) {
      console.error('Error al guardar instalación:', err)
      setError('Error al guardar instalación')
    }
    setLoading(false)
  }

  const handleEdit = (instalacion) => {
    setEditingId(instalacion.id)
    setNuevoNombre(instalacion.Nombre)
    setNuevaUbicacion(instalacion.Ubicacion)
    setNuevoEstado(instalacion.Estado)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta instalación?')) return
    
    setLoading(true)
    try {
      await deleteInstalacion(id)
      setMensaje('Instalación eliminada exitosamente')
      loadInstalaciones()
    } catch (err) {
      console.error('Error al eliminar instalación:', err)
      setError('Error al eliminar instalación')
    }
    setLoading(false)
  }

  const resetForm = () => {
    setNuevoNombre('')
    setNuevaUbicacion('')
    setNuevoEstado(1)
    setEditingId(null)
    setModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <Loading show={loading} message="Procesando..." />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-[#065F46] mb-2">Instalaciones</h1>
        <p className="text-[#065F46] mb-6">Busca y revisa las instalaciones disponibles</p>
        
        {mensaje && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{mensaje}</div>}
        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Buscar por nombre o ubicación"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
          />
          <button
            className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
            onClick={() => {
              resetForm()
              setModalOpen(true)
            }}
          >Nueva instalación</button>
        </div>

        {/* Modal para nueva instalación */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border-2 border-[#34D399] relative">
              <button
                className="absolute top-2 right-2 text-[#065F46] text-xl font-bold hover:text-[#34D399]"
                onClick={resetForm}
                aria-label="Cerrar"
              >×</button>
              <h2 className="text-2xl font-bold text-[#065F46] mb-4">
                {editingId ? 'Editar Instalación' : 'Nueva Instalación'}
              </h2>
              <form onSubmit={handleAddInstalacion} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[#065F46] font-semibold mb-1">Nombre</label>
                  <input
                    type="text"
                    value={nuevoNombre}
                    onChange={e => setNuevoNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                    placeholder="Ej: Cancha Norte"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#065F46] font-semibold mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={nuevaUbicacion}
                    onChange={e => setNuevaUbicacion(e.target.value)}
                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                    placeholder="Ej: Calle 10, Zona Sur"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#065F46] font-semibold mb-1">Estado</label>
                  <select
                    value={nuevoEstado}
                    onChange={e => setNuevoEstado(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                >{editingId ? 'Actualizar' : 'Agregar'}</button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filtered.length === 0 && (
            <div className="col-span-2 text-center text-[#065F46] bg-[#A7F3D0] p-6 rounded-lg">No se encontraron instalaciones.</div>
          )}
          {filtered.map(inst => (
            <div key={inst.id} className="bg-white rounded-xl shadow p-6 flex gap-4 items-center border border-[#34D399]">
              <div className="w-16 h-16 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                <span className="text-2xl text-[#065F46] font-bold">{inst.Nombre?.[0] || '?'}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[#065F46]">{inst.Nombre}</h2>
                <p className="text-[#065F46]">{inst.Ubicacion}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {inst.Estado === 0 ? (
                  <span className="px-3 py-1 rounded-full bg-[#F3F4F6] text-red-500 text-xs font-bold">Inactivo</span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[#A7F3D0] text-[#065F46] text-xs font-bold">Activo</span>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(inst)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 text-xs"
                  >Editar</button>
                  <button 
                    onClick={() => handleDelete(inst.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 text-xs"
                  >Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-[#000000]">Mensajes y detalles finales aquí.</p>
        </div>
      </div>
    </div>
  )
}

export default InstalacionesPage
