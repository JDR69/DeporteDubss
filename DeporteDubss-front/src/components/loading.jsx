
import React from 'react';

function Loading({ message = 'Cargando...', show = false }) {
	if (!show) return null;
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
			<div className="flex flex-col items-center gap-4 bg-white rounded-xl p-8 shadow-lg border-2 border-[#34D399]">
				<svg className="animate-spin h-10 w-10 text-[#34D399]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
					<path className="opacity-75" fill="#34D399" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
				</svg>
				<span className="text-[#065F46] font-semibold text-lg animate-pulse">{message}</span>
			</div>
		</div>
	);
}

export default Loading;
