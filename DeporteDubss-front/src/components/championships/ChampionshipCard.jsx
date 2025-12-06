import React from 'react';

function ChampionshipCard({ camp, isAdmin, onToggleDetail, onDelete }) {
  const getEstadoBadge = (estado) => {
    const styles = {
      'En Curso': 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm',
      'Finalizado': 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm',
      'Pendiente': 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-sm'
    };
    return styles[estado] || styles['Pendiente'];
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="p-6 flex items-center gap-6">
        <div className="relative">
          {camp.Logo ? (
            <img src={camp.Logo} alt={camp.Nombre} className="w-16 h-16 object-cover rounded-xl shadow-md" />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-emerald-600 text-2xl font-bold shadow-md">
              {camp.Nombre?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-emerald-900 truncate">{camp.Nombre}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(camp.Estado)}`}>
              {camp.Estado}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-emerald-700">
            <div className="flex items-center gap-1">
              <span className="font-medium">⚽</span>
              <span>{camp.IDDeporte?.Nombre || camp.IDDeporte}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">🏅</span>
              <span>{camp.Categoria?.Nombre || camp.IDDeporte?.IDCategoria?.Nombre || '-'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">📅</span>
              <span>{camp.Fecha_Inicio} - {camp.Fecha_Fin}</span>
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button 
              onClick={() => onToggleDetail(camp.id)} 
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all text-sm font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
            >
              📊 Ver detalles
            </button>
            <button 
              onClick={() => onDelete(camp.id)} 
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChampionshipCard;
