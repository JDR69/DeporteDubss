import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCampeonatos, createCampeonato, updateCampeonato, deleteCampeonato, getDeportes } from '../api/auth';
import Loading from '../components/loading';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import ToastContainer from '../components/Toast';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import { formatDate, validators, validate, getChampionshipStatusColor } from '../utils/helpers';

function CampeonatosPage() {
  const { user } = useAuth();
  const { toasts, success, error: showError, hideToast } = useToast();
  
  const [campeonatos, setCampeonatos] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  
  const [formData, setFormData] = useState({
    Nombre: '',
    IDDeporte: '',
    Fecha_Inicio: '',
    Fecha_Fin: '',
    Estado: 'Pendiente'
  });
  
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campData, depData] = await Promise.all([
        getCampeonatos(),
        getDeportes()
      ]);
      setCampeonatos(campData);
      setDeportes(depData);
    } catch (err) {
      showError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    errors.Nombre = validate(formData.Nombre, [validators.required, validators.minLength(3)]);
    errors.IDDeporte = validate(formData.IDDeporte, [validators.required]);
    errors.Fecha_Inicio = validate(formData.Fecha_Inicio, [validators.required]);
    errors.Fecha_Fin = validate(formData.Fecha_Fin, [validators.required]);
    
    const dateError = validators.dateRange(formData.Fecha_Inicio, formData.Fecha_Fin);
    if (dateError) {
      errors.Fecha_Fin = dateError;
    }

    setFormErrors(errors);
    return !Object.values(errors).some(e => e !== null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        ...formData,
        IDUsuario: user?.id // Organizador
      };

      if (editingId) {
        await updateCampeonato(editingId, dataToSend);
        success('Campeonato actualizado exitosamente');
      } else {
        await createCampeonato(dataToSend);
        success('Campeonato creado exitosamente');
      }
      
      loadData();
      closeModal();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al guardar el campeonato');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campeonato) => {
    setEditingId(campeonato.IDCampeonato);
    setFormData({
      Nombre: campeonato.Nombre,
      IDDeporte: campeonato.IDDeporte,
      Fecha_Inicio: campeonato.Fecha_Inicio,
      Fecha_Fin: campeonato.Fecha_Fin,
      Estado: campeonato.Estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteCampeonato(id);
      success('Campeonato eliminado exitosamente');
      loadData();
    } catch (err) {
      showError('Error al eliminar el campeonato');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      Nombre: '',
      IDDeporte: '',
      Fecha_Inicio: '',
      Fecha_Fin: '',
      Estado: 'Pendiente'
    });
    setFormErrors({});
  };

  const filteredCampeonatos = campeonatos.filter(c => {
    const matchesSearch = c.Nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || c.Estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const canCreate = hasPermission(user?.rol, PERMISSIONS.CREATE_CHAMPIONSHIP);
  const canEdit = hasPermission(user?.rol, PERMISSIONS.EDIT_CHAMPIONSHIP);
  const canDelete = hasPermission(user?.rol, PERMISSIONS.DELETE_CHAMPIONSHIP);

  if (loading && campeonatos.length === 0) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Campeonatos</h1>
            <p className="text-gray-600 mt-1">Gestión de campeonatos deportivos</p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Nuevo Campeonato
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nombre..."
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Curso">En Curso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Nombre</th>
                  <th className="px-6 py-3 text-left">Deporte</th>
                  <th className="px-6 py-3 text-left">Fecha Inicio</th>
                  <th className="px-6 py-3 text-left">Fecha Fin</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  {(canEdit || canDelete) && <th className="px-6 py-3 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCampeonatos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron campeonatos
                    </td>
                  </tr>
                ) : (
                  filteredCampeonatos.map((campeonato) => {
                    const deporte = deportes.find(d => d.IDDeporte === campeonato.IDDeporte);
                    return (
                      <tr key={campeonato.IDCampeonato} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{campeonato.Nombre}</td>
                        <td className="px-6 py-4 text-gray-600">{deporte?.Nombre || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(campeonato.Fecha_Inicio)}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(campeonato.Fecha_Fin)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getChampionshipStatusColor(campeonato.Estado)}`}>
                            {campeonato.Estado}
                          </span>
                        </td>
                        {(canEdit || canDelete) && (
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              {canEdit && (
                                <button
                                  onClick={() => handleEdit(campeonato)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                  Editar
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => setDeleteDialog({ isOpen: true, id: campeonato.IDCampeonato })}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                  Eliminar
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {editingId ? 'Editar Campeonato' : 'Nuevo Campeonato'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.Nombre}
                    onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.Nombre ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.Nombre && <p className="text-red-500 text-sm mt-1">{formErrors.Nombre}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deporte *</label>
                  <select
                    value={formData.IDDeporte}
                    onChange={(e) => setFormData({ ...formData, IDDeporte: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.IDDeporte ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Seleccionar deporte</option>
                    {deportes.map(d => (
                      <option key={d.IDDeporte} value={d.IDDeporte}>{d.Nombre}</option>
                    ))}
                  </select>
                  {formErrors.IDDeporte && <p className="text-red-500 text-sm mt-1">{formErrors.IDDeporte}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio *</label>
                    <input
                      type="date"
                      value={formData.Fecha_Inicio}
                      onChange={(e) => setFormData({ ...formData, Fecha_Inicio: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.Fecha_Inicio ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.Fecha_Inicio && <p className="text-red-500 text-sm mt-1">{formErrors.Fecha_Inicio}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin *</label>
                    <input
                      type="date"
                      value={formData.Fecha_Fin}
                      onChange={(e) => setFormData({ ...formData, Fecha_Fin: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.Fecha_Fin ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.Fecha_Fin && <p className="text-red-500 text-sm mt-1">{formErrors.Fecha_Fin}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={formData.Estado}
                    onChange={(e) => setFormData({ ...formData, Estado: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Curso">En Curso</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={() => handleDelete(deleteDialog.id)}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este campeonato? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  );
}

export default CampeonatosPage;
