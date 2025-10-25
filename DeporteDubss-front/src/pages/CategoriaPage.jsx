
import React, { useEffect, useState } from 'react';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../api/auth';

function CategoriaPage() {
	const [nombre, setNombre] = useState('');
	const [categorias, setCategorias] = useState([]);
	const [editId, setEditId] = useState(null);
	const [editNombre, setEditNombre] = useState('');
	const [mensaje, setMensaje] = useState('');

	const cargarCategorias = async () => {
		try {
			const res = await getCategorias();
			setCategorias(res.data);
		} catch (err) {
			setMensaje('Error al cargar categorías');
		}
	};

	useEffect(() => {
		cargarCategorias();
	}, []);

	const handleAgregar = async () => {
		if (!nombre.trim()) return;
		try {
			await createCategoria({ nombre });
			setNombre('');
			setMensaje('Categoría agregada');
			cargarCategorias();
		} catch (err) {
			setMensaje('Error al agregar');
		}
	};

	const handleEliminar = async (id) => {
		if (!window.confirm('¿Eliminar esta categoría?')) return;
		try {
			await deleteCategoria(id);
			setMensaje('Eliminado');
			cargarCategorias();
		} catch (err) {
			setMensaje('Error al eliminar');
		}
	};

	const handleEditar = (cat) => {
		setEditId(cat.id);
		setEditNombre(cat.nombre);
	};

	const handleGuardar = async (id) => {
		if (!editNombre.trim()) return;
		try {
			await updateCategoria(id, { nombre: editNombre });
			setEditId(null);
			setEditNombre('');
			setMensaje('Actualizado');
			cargarCategorias();
		} catch (err) {
			setMensaje('Error al actualizar');
		}
	};

	return (
		<div className="min-h-screen bg-white py-8 px-4">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold text-[#065F46] mb-6">Categorías</h1>
				<div className="mb-6 flex gap-4">
					<input
						type="text"
						value={nombre}
						onChange={e => setNombre(e.target.value)}
						className="flex-1 px-4 py-2 border border-[#34D399] rounded-lg bg-[#F3F4F6] text-[#065F46] focus:outline-none focus:ring-2 focus:ring-[#34D399]"
						placeholder="Nombre de la categoría"
					/>
					<button
						onClick={handleAgregar}
						className="px-4 py-2 bg-[#34D399] text-white rounded-lg font-semibold hover:bg-[#065F46] transition"
					>Agregar</button>
				</div>
				<div className="overflow-x-auto mb-8">
					<table className="min-w-full bg-white rounded-lg shadow border border-[#34D399]">
						<thead className="bg-[#A7F3D0]">
							<tr>
								<th className="px-4 py-2 text-left text-[#065F46]">Nombre</th>
								<th className="px-4 py-2 text-left text-[#065F46]">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{categorias.length === 0 ? (
								<tr>
									<td colSpan={2} className="px-4 py-4 text-center text-[#065F46]">No hay categorías registradas.</td>
								</tr>
							) : (
								categorias.map(cat => (
									<tr key={cat.id} className="border-b border-[#34D399]">
										<td className="px-4 py-2 text-[#065F46]">
											{editId === cat.id ? (
												<input
													type="text"
													value={editNombre}
													onChange={e => setEditNombre(e.target.value)}
													className="px-2 py-1 border border-[#34D399] rounded bg-[#A7F3D0] text-[#065F46]"
												/>
											) : (
												cat.nombre
											)}
										</td>
										<td className="px-4 py-2 flex gap-2">
											{editId === cat.id ? (
												<>
													<button
														onClick={() => handleGuardar(cat.id)}
														className="px-3 py-1 bg-[#34D399] text-white rounded hover:bg-[#065F46] text-xs"
													>Guardar</button>
													<button
														onClick={() => { setEditId(null); setEditNombre(''); }}
														className="px-3 py-1 bg-[#F3F4F6] text-[#065F46] rounded hover:bg-[#34D399] hover:text-white text-xs"
													>Cancelar</button>
												</>
											) : (
												<>
													<button
														onClick={() => handleEditar(cat)}
														className="px-3 py-1 bg-[#A7F3D0] text-[#065F46] rounded hover:bg-[#34D399] hover:text-white text-xs"
													>Editar</button>
													<button
														onClick={() => handleEliminar(cat.id)}
														className="px-3 py-1 bg-[#F3F4F6] text-[#065F46] rounded hover:bg-[#34D399] hover:text-white text-xs"
													>Eliminar</button>
												</>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				{mensaje && <div className="text-center text-[#065F46] font-semibold mt-2">{mensaje}</div>}
			</div>
		</div>
	);
}

export default CategoriaPage;
