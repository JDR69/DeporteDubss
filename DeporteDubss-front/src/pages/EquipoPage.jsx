import React, { useState, useEffect } from 'react'
import { getEquipos, createEquipo, updateEquipo, deleteEquipo, getUsuarios } from '../api/auth'
import Loading from '../components/loading'
import { uploadImageToCloudinary } from '../services/cloudinary'

function EquipoPage() {
  const [equipos, setEquipos] = useState([])
  const [delegados, setDelegados] = useState([])
  const [nombre, setNombre] = useState('')
  const [logo, setLogo] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [idUsuario, setIdUsuario] = useState('')
  const [estado, setEstado] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [resEquipos, resUsuarios] = await Promise.all([
        getEquipos(),
        getUsuarios()
      ])
      setEquipos(resEquipos.data)
      // Filter delegados (role 3) from users
      const delegadosList = resUsuarios.data.filter(u => u.IDRol?.id === 3 || u.IDRol === 3)
      setDelegados(delegadosList)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar datos')
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
    setError('')
    
    if (!nombre.trim() || !idUsuario) {
      setError('Complete los campos requeridos: Nombre y Delegado')
      return
    }

    setLoading(true)
    try {
      let logoUrl = logo
      if (logoFile) {
        logoUrl = await uploadImageToCloudinary(logoFile)
      }

      const data = {
        Nombre: nombre,
        Logo: logoUrl,
        IDUsuario: parseInt(idUsuario),
        Estado: estado
      }
      
      if (editingId) {
        await updateEquipo(editingId, data)
        setMensaje('Equipo actualizado exitosamente')
      } else {
        await createEquipo(data)
        setMensaje('Equipo creado exitosamente')
      }
      
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error al guardar equipo:', err)
      setError(err.response?.data?.detail || 'Error al guardar equipo')
    }
    setLoading(false)
  }

  const handleEdit = (equipo) => {
    setEditingId(equipo.id)
    setNombre(equipo.Nombre)
    setLogo(equipo.Logo || '')
    setIdUsuario(equipo.IDUsuario?.id || equipo.IDUsuario)
    setEstado(equipo.Estado)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este equipo?')) return
    
    setLoading(true)
    try {
      await deleteEquipo(id)
      setMensaje('Equipo eliminado exitosamente')
      loadData()
    } catch (err) {
      console.error('Error al eliminar equipo:', err)
      setError('Error al eliminar equipo')
    }
    setLoading(false)
  }

  const resetForm = () => {
    setNombre('')
    setLogo('')
    setLogoFile(null)
    setIdUsuario('')
    setEstado(1)
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <Loading show={loading} message="Procesando..." />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#065F46]">Gestión de Equipos</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
          >
            {showForm ? 'Cancelar' : 'Nuevo Equipo'}
          </button>
        </div>

        {mensaje && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{mensaje}</div>}
        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#34D399]">
            <h2 className="text-2xl font-bold text-[#065F46] mb-4">
              {editingId ? 'Editar Equipo' : 'Nuevo Equipo'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#065F46] font-semibold mb-1">Nombre del Equipo *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                  placeholder="Ej: Los Tigres"
                  required
                />
              </div>
              <div>
                <label className="block text-[#065F46] font-semibold mb-1">Delegado *</label>
                <select
                  value={idUsuario}
                  onChange={e => setIdUsuario(e.target.value)}
                  className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                  required
                >
                  <option value="">Seleccione un delegado</option>
                  {delegados.map(del => (
                    <option key={del.id} value={del.id}>
                      {del.Nombre} {del.Apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#065F46] font-semibold mb-1">Logo (Imagen)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    setLogoFile(e.target.files[0])
                  }}
                  className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                />
                {(logo || logoFile) && (
                  <div className="mt-2 flex items-center gap-2">
                    <img 
                      src={logoFile ? URL.createObjectURL(logoFile) : logo} 
                      alt="Logo" 
                      className="w-16 h-16 rounded-full bg-[#E5E7EB] object-cover border border-[#34D399]" 
                    />
                    <span className="text-xs text-[#065F46]">Vista previa</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[#065F46] font-semibold mb-1">Estado</label>
                <select
                  value={estado}
                  onChange={e => setEstado(parseInt(e.target.value))}
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
          <h2 className="text-2xl font-bold text-[#065F46] mb-4">Lista de Equipos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipos.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">No hay equipos registrados</div>
            ) : (
              equipos.map(equipo => (
                <div key={equipo.id} className="bg-white rounded-xl shadow p-6 border border-[#34D399]">
                  <div className="flex flex-col items-center mb-4">
                    {equipo.Logo ? (
                      <img src={equipo.Logo} alt={equipo.Nombre} className="w-24 h-24 rounded-full object-cover border-2 border-[#34D399]" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-[#E5E7EB] flex items-center justify-center border-2 border-[#34D399]">
                        <span className="text-3xl text-[#065F46] font-bold">{equipo.Nombre?.[0] || '?'}</span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-[#065F46] mt-3">{equipo.Nombre}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold mt-2 ${equipo.Estado ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {equipo.Estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(equipo)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(equipo.id)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EquipoPage
