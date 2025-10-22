import React, { useState } from 'react'

const initialInstalaciones = [
  { id: 1, nombre: 'Cancha Central', ubicacion: 'Av. Principal 123', estado: 'disponible' },
  { id: 2, nombre: 'Gimnasio A', ubicacion: 'Calle Secundaria 45', estado: 'pendiente' },
  { id: 3, nombre: 'Piscina Olímpica', ubicacion: 'Parque Acuático', estado: 'disponible' },
]

const InstalacionesPage = () => {
  const [query, setQuery] = useState('')
  const [instalaciones, setInstalaciones] = useState(initialInstalaciones)
  const [modalOpen, setModalOpen] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaUbicacion, setNuevaUbicacion] = useState('')

  const filtered = instalaciones.filter(i =>
    i.nombre.toLowerCase().includes(query.toLowerCase()) ||
    i.ubicacion.toLowerCase().includes(query.toLowerCase())
  )

  const handleAddInstalacion = e => {
    e.preventDefault()
    if (nuevoNombre.trim() && nuevaUbicacion.trim()) {
      setInstalaciones([
        ...instalaciones,
        {
          id: instalaciones.length + 1,
          nombre: nuevoNombre,
          ubicacion: nuevaUbicacion,
          estado: 'disponible',
        },
      ])
      setNuevoNombre('')
      setNuevaUbicacion('')
      setModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-[#065F46] mb-2">Instalaciones</h1>
        <p className="text-[#065F46] mb-6">Busca y revisa las instalaciones disponibles</p>
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
            onClick={() => setModalOpen(true)}
          >Nueva instalación</button>
        </div>

        {/* Modal para nueva instalación */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border-2 border-[#34D399] relative">
              <button
                className="absolute top-2 right-2 text-[#065F46] text-xl font-bold hover:text-[#34D399]"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
              >×</button>
              <h2 className="text-2xl font-bold text-[#065F46] mb-4">Nueva instalación</h2>
              <form onSubmit={handleAddInstalacion} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[#065F46] font-semibold mb-1">Nombre</label>
                  <input
                    type="text"
                    value={nuevoNombre}
                    onChange={e => setNuevoNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                    placeholder="Ej: Cancha Norte"
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
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                >Agregar</button>
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
                <span className="text-2xl text-[#065F46] font-bold">{inst.nombre[0]}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[#065F46]">{inst.nombre}</h2>
                <p className="text-[#065F46]">{inst.ubicacion}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {inst.estado === 'pendiente' ? (
                  <span className="px-3 py-1 rounded-full bg-[#F3F4F6] text-yellow-500 text-xs font-bold">Pendiente</span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[#A7F3D0] text-[#065F46] text-xs font-bold">Disponible</span>
                )}
                <button className="px-3 py-1 bg-[#34D399] text-white rounded hover:bg-[#065F46] text-xs">Ver</button>
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
