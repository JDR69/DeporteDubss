import React, { useState } from 'react'


const deportes = [
    'Fútbol',
    'Básquetbol',
    'Vóley',
    'Natación',
    'Tenis',
]

function CampeonatosPage() {
    const [deporte, setDeporte] = useState('')
    const [nombre, setNombre] = useState('')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold text-[#065F46] mb-6">Crear Campeonato</h1>
                <form className="flex flex-col gap-6 bg-white rounded-xl shadow p-8 border border-[#34D399]">
                    <div>
                        <label className="block text-[#065F46] font-semibold mb-1">Deporte</label>
                        <select
                            value={deporte}
                            onChange={e => setDeporte(e.target.value)}
                            className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                        >
                            <option value="">Selecciona un deporte</option>
                            {deportes.map(dep => (
                                <option key={dep} value={dep}>{dep}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[#065F46] font-semibold mb-1">Nombre del campeonato</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                            placeholder="Ej: Copa Primavera"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[#065F46] font-semibold mb-1">Fecha de inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={e => setFechaInicio(e.target.value)}
                                className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[#065F46] font-semibold mb-1">Fecha de fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={e => setFechaFin(e.target.value)}
                                className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                    >Guardar campeonato</button>
                </form>
                <div className="mt-10 text-center">
                    <p className="text-[#000000]">Mensajes y detalles finales aquí.</p>
                </div>
            </div>
        </div>
    )
}

export default CampeonatosPage
