import React, { useState, useEffect } from 'react';
import { getEquipos, inscribirEquipo } from '../../api/auth';

function EnrollTeamModal({ campeonatoId, onClose, onSuccess, equiposInscritos = [] }) {
  const [equipos, setEquipos] = useState([]);
  const [selectedEquipo, setSelectedEquipo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      const { data } = await getEquipos();
      setEquipos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading teams:', err);
      setError('Error al cargar los equipos');
    }
  };

  const handleInscribir = async () => {
    if (!selectedEquipo) {
      setError('Selecciona un equipo');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await inscribirEquipo(campeonatoId, selectedEquipo);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error enrolling team:', err);
      setError(err.response?.data?.detail || 'Error al inscribir el equipo');
    } finally {
      setLoading(false);
    }
  };

  const equiposDisponibles = equipos.filter(eq => 
    !equiposInscritos.some(inscrito => inscrito.id === eq.id) &&
    (searchTerm === '' || eq.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚽</span>
              <h2 className="text-2xl font-bold text-white">Inscribir Equipo</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-emerald-800 font-semibold mb-2 text-sm">
              Buscar Equipo
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Escribe para buscar..."
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl bg-emerald-50 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-emerald-800 font-semibold mb-2 text-sm">
              Equipos Disponibles ({equiposDisponibles.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {equiposDisponibles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-3">🏆</div>
                  <p className="text-gray-500">No hay equipos disponibles</p>
                </div>
              ) : (
                equiposDisponibles.map(eq => (
                  <label
                    key={eq.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      selectedEquipo === eq.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-emerald-200 bg-white hover:bg-emerald-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="equipo"
                      value={eq.id}
                      checked={selectedEquipo === eq.id}
                      onChange={() => setSelectedEquipo(eq.id)}
                      className="w-5 h-5 text-emerald-600"
                    />
                    {eq.Logo ? (
                      <img src={eq.Logo} alt={eq.Nombre} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center text-emerald-700 font-bold">
                        {eq.Nombre?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-emerald-900">{eq.Nombre}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleInscribir}
            disabled={loading || !selectedEquipo}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Inscribiendo...' : '✅ Inscribir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnrollTeamModal;
