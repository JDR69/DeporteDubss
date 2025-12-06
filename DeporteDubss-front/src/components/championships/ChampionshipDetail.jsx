import React from 'react';

function ChampionshipDetail({ detalle, onInscribirEquipo }) {
  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 shadow-inner">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Equipos Section */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚽</span>
            <h4 className="text-lg font-bold text-emerald-900">Equipos Inscritos</h4>
            <span className="ml-auto bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
              {detalle?.Equipos?.length || 0}
            </span>
            {onInscribirEquipo && (
              <button
                onClick={onInscribirEquipo}
                className="ml-2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition text-sm font-semibold shadow-md"
                title="Inscribir equipo"
              >
                + Inscribir
              </button>
            )}
          </div>
          
          {detalle?.Equipos?.length ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detalle.Equipos.map((eq, index) => (
                <div key={eq.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  {eq.Logo ? (
                    <img src={eq.Logo} alt={eq.Nombre} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold">
                      {eq.Nombre?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-emerald-900 font-semibold truncate">{eq.Nombre}</p>
                    <p className="text-xs text-emerald-600">Posición: {eq.Posicion || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-700">{eq.Puntos} pts</p>
                    <p className="text-xs text-gray-600">PJ: {eq.PJ}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-3">🏆</div>
              <p className="text-gray-500 font-medium">No hay equipos registrados</p>
            </div>
          )}
        </div>

        {/* Partidos Section */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📅</span>
            <h4 className="text-lg font-bold text-emerald-900">Partidos</h4>
            <span className="ml-auto bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
              {detalle?.Partidos?.length || 0}
            </span>
          </div>
          
          {detalle?.Partidos?.length ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detalle.Partidos.map(p => (
                <div key={p.id} className="p-4 border-2 border-emerald-100 rounded-xl bg-gradient-to-r from-white to-emerald-50 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-900 font-bold text-sm">{p.Local}</span>
                    {p.Resultado ? (
                      <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg font-bold text-sm shadow-sm">
                        {p.Resultado.Goles_Local} - {p.Resultado.Goles_Visitante}
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-lg font-semibold text-xs">
                        ⏳ Pendiente
                      </div>
                    )}
                    <span className="text-emerald-900 font-bold text-sm">{p.Visitante}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                    {p.Instalacion && (
                      <div className="flex items-center gap-1">
                        <span>🏟️</span>
                        <span>{p.Instalacion}</span>
                      </div>
                    )}
                    {p.Fecha && (
                      <div className="flex items-center gap-1">
                        <span>📆</span>
                        <span>{p.Fecha}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-3">⚽</div>
              <p className="text-gray-500 font-medium">No hay partidos programados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChampionshipDetail;
