import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Usuario } from '../services/api';
import { UserTable } from '../components/UserTable';
import { UserStats } from '../components/UserStats';
import { UserForm } from '../components/UserForm';
import { Modal } from '../components/Modal';
import { Search, SlidersHorizontal, Download, UserPlus, AlertCircle, RefreshCw } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const Usuarios: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  
  // Data States
  const [users, setUsers] = useState<Usuario[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter States
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterRol, setFilterRol] = useState<string>('todos');

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Matching the mockup showing 4 users per page

  // Load all users
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getUsuarios();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Apply search & filters whenever query, criteria, or users change
  useEffect(() => {
    let result = [...users];

    // Search Query (name, username, code, role)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((u) => {
        const username = (u.nombreUsuario || '').toLowerCase();
        const code = (u.codigo || '').toLowerCase();
        const role = (u.rol || '').toLowerCase();
        // Fallback role string match
        const roleName = (u.idRol === 1 ? 'administrador' : u.idRol === 2 ? 'dentista' : 'paciente');
        
        return username.includes(q) || code.includes(q) || role.includes(q) || roleName.includes(q);
      });
    }

    // Role Filter
    if (filterRol !== 'todos') {
      const roleId = Number(filterRol);
      result = result.filter((u) => u.idRol === roleId);
    }

    // Filter to only ACTIVE users (logical delete hides inactive users)
    result = result.filter((u) => u.estado?.toUpperCase() === 'ACTIVO');

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [query, filterRol, users]);

  // Create or Update User Handler
  const handleSaveUser = async (userData: Usuario) => {
    try {
      if (editingUser && editingUser.id) {
        // Edit Mode
        await apiService.updateUsuario(editingUser.id, userData);
        showSuccess("Datos actualizados correctamente.");
      } else {
        // Create Mode
        await apiService.createUsuario(userData);
        showSuccess("Datos actualizados correctamente.");
      }
      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      showError("Error al guardar la información.");
      throw err;
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (u: Usuario) => {
    if (!u.id) return;
    
    const confirmMessage = `¿Está seguro de que desea eliminar al usuario "${u.nombreUsuario}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await apiService.deleteUsuario(u.id);
        await loadUsers();
      } catch (err: any) {
        alert(err.message || 'Ocurrió un error al procesar la solicitud.');
      }
    }
  };

  // Export Simulation
  const handleExport = () => {
    // Export formatted JSON
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredUsers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <>
      <div className="max-w-[1200px] mx-auto animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-slate-500 mt-1">
              Controla el acceso y perfiles del personal de la clínica dental.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-[#004D40] hover:bg-[#00332c] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-teal-900/10 hover:shadow-lg transition-all duration-200 cursor-pointer self-start md:self-auto"
          >
            <UserPlus size={18} />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* Toolbar Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar usuario por nombre, código o rol..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-700 focus:ring-4 focus:ring-teal-700/5 transition-all duration-200 text-sm font-medium text-slate-700"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold transition-all duration-150 cursor-pointer ${
                  showFilters || filterRol !== 'todos'
                    ? 'bg-brand-50 text-brand-700 border-brand-200'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <SlidersHorizontal size={16} />
                <span>Filtros</span>
              </button>
              <button
                onClick={handleExport}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-sm font-bold transition-all duration-150 cursor-pointer"
              >
                <Download size={16} />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Expandable Filter Box */}
          {showFilters && (
            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 animate-slide-down">
              {/* Rol Filter */}
              <div className="flex flex-col gap-1.5 max-w-md">
                <label className="text-xs font-bold text-teal-800 uppercase tracking-wider">Filtrar por Rol</label>
                <select
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-700 cursor-pointer"
                >
                  <option value="todos">Todos los Roles</option>
                  <option value="1">Administrador</option>
                  <option value="2">Dentista</option>
                  <option value="3">Paciente / Operador</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] mt-6">
            <RefreshCw className="animate-spin text-brand-700 mb-2" size={32} />
            <span className="text-sm font-medium text-slate-500">Cargando usuarios...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-6 flex flex-col items-center text-center">
            <AlertCircle className="text-red-500 mb-2" size={32} />
            <h3 className="font-bold text-red-800">Error de Conexión</h3>
            <p className="text-sm text-red-600 mt-1 max-w-md">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl transition-colors duration-150 cursor-pointer"
            >
              Reintentar Carga
            </button>
          </div>
        ) : (
          /* Table Component */
          <UserTable
            users={filteredUsers}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onEdit={(u) => {
              setEditingUser(u);
              setShowForm(true);
            }}
            onDelete={handleDeleteUser}
          />
        )}

        {/* Dynamic Summary Cards */}
        {!loading && !error && <UserStats users={users} />}
      </div>

      {/* Form Modal */}
      {showForm && (
        <Modal
          title={editingUser ? 'Editar Usuario Clínico' : 'Registrar Nuevo Usuario'}
          subtitle={editingUser ? `Modifica los datos de acceso para: ${editingUser.nombreUsuario}` : 'Asigna rol, credenciales y código del sistema.'}
          onClose={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          hideHeader={true}
        >
          <UserForm
            user={editingUser}
            onSave={handleSaveUser}
            onCancel={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
          />
        </Modal>
      )}
    </>
  );
};
