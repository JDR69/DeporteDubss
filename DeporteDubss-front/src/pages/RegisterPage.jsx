
import React, { useState, useEffect } from 'react';
import { getRoles } from '../api/auth';
import axiosInstance from '../api/axiosInstance';

function RegisterPage() {
	const [form, setForm] = useState({
		nombre: '',
		apellido: '',
		registro: '',
		correo: '',
		contrasena: '',
		fecha_nacimiento: '',
		genero: '',
		estado: true,
		rol: ''
	});
	const [roles, setRoles] = useState([]);
	const [mensaje, setMensaje] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		getRoles().then(res => setRoles(res.data)).catch(() => setRoles([]));
	}, []);

	const handleChange = e => {
		const { name, value, type, checked } = e.target;
		setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setMensaje('');
		setError('');
		try {
			await axiosInstance.post('/api/usuarios/', {
				...form,
				registro: parseInt(form.registro),
				rol: parseInt(form.rol)
			});
			setMensaje('Usuario registrado correctamente.');
			setForm({
				nombre: '', apellido: '', registro: '', correo: '', contrasena: '', fecha_nacimiento: '', genero: '', estado: true, rol: ''
			});
		} catch (err) {
			setError('Error al registrar usuario.');
			console.log('Error detalle:', err.response?.data || err);
		}
	};

	return (
		<div className="min-h-screen bg-white py-8 px-4">
			<div className="max-w-xl mx-auto">
				<h1 className="text-3xl font-bold text-[#065F46] mb-6">Registro de Usuario</h1>
				<form className="flex flex-col gap-4 bg-white rounded-xl shadow p-8 border border-[#34D399]" onSubmit={handleSubmit}>
					<div className="flex gap-4">
						<div className="flex-1">
							<label className="block text-[#065F46] font-semibold mb-1">Nombre</label>
							<input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none" required />
						</div>
						<div className="flex-1">
							<label className="block text-[#065F46] font-semibold mb-1">Apellido</label>
							<input type="text" name="apellido" value={form.apellido} onChange={handleChange} className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none" required />
						</div>
					</div>
					<div className="flex gap-4">
						<div className="flex-1">
							<label className="block text-[#065F46] font-semibold mb-1">Registro</label>
							<input type="number" name="registro" value={form.registro} onChange={handleChange} className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none" required />
						</div>
						<div className="flex-1">
							<label className="block text-[#065F46] font-semibold mb-1">Correo</label>
							<input type="email" name="correo" value={form.correo} onChange={handleChange} className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none" required />
						</div>
					</div>
					<div className="flex gap-4">
						<div className="flex-1">
							<label className="block text-[#065F46] font-semibold mb-1">Contraseña</label>
							<input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none" required />
						</div>
						<div className="flex-1">
							<label className="block text-[#065F46] font-semibold mb-1">Fecha de nacimiento</label>
							<input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none" required />
						</div>
					</div>
					<div className="flex gap-4">
						<div className="flex-1">
							<label className="block text-[#065F46] font-semibold mb-1">Género</label>
							<select name="genero" value={form.genero} onChange={handleChange} className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none" required>
								<option value="">Selecciona</option>
								<option value="masculino">Masculino</option>
								<option value="femenino">Femenino</option>
								<option value="otro">Otro</option>
							</select>
						</div>
						<div className="flex-1">
							<label className="block text-[#065F46] font-semibold mb-1">Rol</label>
							<select name="rol" value={form.rol} onChange={handleChange} className="w-full px-4 py-2 border border-[#34D399] rounded-lg bg-[#A7F3D0] text-[#065F46] focus:outline-none" required>
								<option value="">Selecciona</option>
								{roles.map(r => (
									<option key={r.id} value={r.id}>{r.nombre}</option>
								))}
							</select>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<input type="checkbox" name="estado" checked={form.estado} onChange={handleChange} />
						<label className="text-[#065F46]">Activo</label>
					</div>
					<button type="submit" className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition">Registrar</button>
				</form>
				<div className="mt-6 text-center min-h-10">
					{mensaje && <p className="text-green-700 font-semibold">{mensaje}</p>}
					{error && <p className="text-red-600 font-semibold">{error}</p>}
				</div>
			</div>
		</div>
	);
}

export default RegisterPage;
