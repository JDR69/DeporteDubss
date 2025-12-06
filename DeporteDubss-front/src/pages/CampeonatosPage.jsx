
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDeportes, getCategorias, createCampeonato } from '../api/auth';
import Loading from '../components/loading';
import { uploadImageToCloudinary } from '../services/cloudinary';

function CampeonatosPage() {
    const { user } = useAuth ? useAuth() : { user: null };
    const [deportes, setDeportes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [deporteNombre, setDeporteNombre] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [deporteId, setDeporteId] = useState('');
    const [nombre, setNombre] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [logo, setLogo] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        Promise.all([getDeportes(), getCategorias()])
            .then(([resDeportes, resCategorias]) => {
                setDeportes(Array.isArray(resDeportes.data) ? resDeportes.data : []);
                setCategorias(Array.isArray(resCategorias.data) ? resCategorias.data : []);
                setLoading(false);
            })
            .catch(() => {
                setDeportes([]);
                setCategorias([]);
                setLoading(false);
            });
    }, []);

    const handleRegistrar = async () => {
        setMensaje('');
        setError('');
        if (!deporteNombre || !categoriaId || !nombre || !fechaInicio || !fechaFin || !logoFile) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        setLoading(true);
        try {
            // Obtener el ID del deporte seleccionado por nombre
            const deporteObj = deportes.find(d => (d.Nombre || '').trim() === deporteNombre.trim());
            if (!deporteObj) {
                setError('Selecciona un deporte válido.');
                setLoading(false);
                return;
            }
            // Obtener organizador_id del usuario logueado
            let organizador_id = null;
            if (user && user.organizador_id) {
                organizador_id = user.organizador_id;
            } else if (user && user.id) {
                // Si el usuario es admin y no tiene organizador_id, buscarlo por API si es necesario
                organizador_id = user.id;
            } else {
                setError('No se pudo obtener el organizador actual.');
                setLoading(false);
                return;
            }
            // Subir imagen a Cloudinary
            const logoUrl = await uploadImageToCloudinary(logoFile);
            await createCampeonato({
                nombre,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                logo: logoUrl,
                deporte_id: deporteObj.id,
                categoria_id: parseInt(categoriaId),
                estado: true,
                organizador_id
            });
            setMensaje('¡Campeonato registrado exitosamente!');
            setNombre('');
            setFechaInicio('');
            setFechaFin('');
            setLogo('');
            setLogoFile(null);
            setDeporteNombre('');
            setCategoriaId('');
        } catch (err) {
            console.log('Error detalle:', err.response?.data || err);
            setError('Error al registrar el campeonato.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <Loading show={loading} message={loading ? 'Registrando campeonato...' : 'Cargando...'} />
            <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold text-[#065F46] mb-6">Crear Campeonato</h1>
                <form className="flex flex-col gap-6 bg-white rounded-xl shadow p-8 border border-[#34D399]" onSubmit={e => e.preventDefault()}>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[#065F46] font-semibold mb-1">Deporte</label>
                            <select
                                value={deporteNombre}
                                onChange={e => setDeporteNombre(e.target.value)}
                                className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                            >
                                <option value="">Selecciona un deporte</option>
                                {[...new Set(deportes.map(dep => dep.Nombre))].filter(Boolean).map((nombre, idx) => (
                                    <option key={idx} value={nombre}>{nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-[#065F46] font-semibold mb-1">Categoría</label>
                            <select
                                value={categoriaId}
                                onChange={e => setCategoriaId(e.target.value)}
                                className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none"
                            >
                                <option value="">Selecciona una categoría</option>
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.Nombre}</option>
                                ))}
                            </select>
                        </div>
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
                    <div>
                        <label className="block text-[#065F46] font-semibold mb-1">Logo (imagen)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                                setLogoFile(e.target.files[0]);
                                setLogo(e.target.value);
                            }}
                            className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRegistrar}
                        className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
                    >Registrar campeonato</button>
                </form>
                <div className="mt-10 text-center min-h-10">
                    {mensaje && <p className="text-green-700 font-semibold">{mensaje}</p>}
                    {error && <p className="text-red-600 font-semibold">{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default CampeonatosPage;
