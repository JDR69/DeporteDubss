
// Cambia el UPLOAD_PRESET por el de tu configuración de Cloudinary
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dfkv6g00w/image/upload';
const UPLOAD_PRESET = 'DeporteDubss'; // Pega aquí tu upload_preset de Cloudinary

export async function uploadImageToCloudinary(file) {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('upload_preset', UPLOAD_PRESET);
	const res = await fetch(CLOUDINARY_URL, {
		method: 'POST',
		body: formData
	});
	if (!res.ok) throw new Error('Error al subir imagen');
	const data = await res.json();
	return data.secure_url;
}
