import React, { useState } from 'react'

function EquipoPage() {
  const [nombre, setNombre] = useState('')
  const [logo, setLogo] = useState('')
  const [jugadorNombre, setJugadorNombre] = useState('')
  const [jugadorRegistro, setJugadorRegistro] = useState('')
  const [jugadores, setJugadores] = useState([])

  const addJugador = () => {
    if (jugadorNombre.trim() || jugadorRegistro.trim()) {
      setJugadores([...jugadores, { nombre: jugadorNombre, registro: jugadorRegistro }])
      setJugadorNombre('')
      setJugadorRegistro('')
    }
  }

  const removeJugador = idx => {
    setJugadores(jugadores.filter((_, i) => i !== idx))
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#065F46] mb-6">Crear Equipo</h1>
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <label className="block text-[#065F46] font-semibold mb-1">Nombre del equipo</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
              placeholder="Ej: Los Tigres"
            />
          </div>
          <div>
            <label className="block text-[#065F46] font-semibold mb-1">Logo (URL)</label>
            <input
              type="text"
              value={logo}
              onChange={e => setLogo(e.target.value)}
              className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
              placeholder="https://..."
            />
            {logo && (
              <div className="mt-2 flex items-center gap-2">
                <img src={logo} alt="Logo" className="w-16 h-16 rounded-full bg-[#E5E7EB] object-cover border border-[#34D399]" />
                <span className="text-xs text-[#065F46]">Vista previa</span>
              </div>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#065F46] mb-4">Jugadores</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={jugadorNombre}
            onChange={e => setJugadorNombre(e.target.value)}
            className="flex-1 px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
            placeholder="Nombre del jugador"
          />
          <input
            type="text"
            value={jugadorRegistro}
            onChange={e => setJugadorRegistro(e.target.value)}
            className="flex-1 px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
            placeholder="Registro"
          />
          <button
            onClick={addJugador}
            className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
          >Agregar</button>
        </div>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded-lg shadow border border-[#34D399]">
            <thead className="bg-[#A7F3D0]">
              <tr>
                <th className="px-4 py-2 text-left text-[#065F46]">Nombre</th>
                <th className="px-4 py-2 text-left text-[#065F46]">Registro</th>
                <th className="px-4 py-2 text-left text-[#065F46]">Acción</th>
              </tr>
            </thead>
            <tbody>
              {jugadores.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-[#065F46]">No hay jugadores agregados.</td>
                </tr>
              ) : (
                jugadores.map((j, idx) => (
                  <tr key={idx} className="border-b border-[#34D399]">
                    <td className="px-4 py-2 text-[#065F46]">{j.nombre}</td>
                    <td className="px-4 py-2 text-[#065F46]">{j.registro}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeJugador(idx)}
                        className="px-3 py-1 bg-[#F3F4F6] text-[#065F46] rounded hover:bg-[#34D399] hover:text-white text-xs"
                      >Eliminar</button>
                    </td>
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

export default EquipoPage
