import React from 'react';
import { Pencil, UserX, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Usuario } from '../services/api';

interface UserTableProps {
  users: Usuario[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (user: Usuario) => void;
  onDelete: (user: Usuario) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentPage,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Paginated users
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentUsers = users.slice(startIndex, endIndex);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarStyles = (initials: string) => {
    const colorOptions = [
      { bg: '#E0F2F1', text: '#00796B' }, // Teal
      { bg: '#E0F7FA', text: '#00838F' }, // Cyan
      { bg: '#E3F2FD', text: '#1565C0' }, // Blue
      { bg: '#F3E5F5', text: '#6A1B9A' }, // Purple
      { bg: '#F1F5F9', text: '#475569' }, // Slate/Gray
      { bg: '#E8F5E9', text: '#2E7D32' }, // Green
    ];
    const sum = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
    return colorOptions[sum % colorOptions.length];
  };

  const formatCode = (code: string) => {
    if (!code) return '';
    return code.startsWith('#') ? code : `#${code}`;
  };

  const getDisplayName = (username: string) => {
    if (username === 'admin') return 'Ana Martínez';
    if (username === 'dr.garcia') return 'Jorge Rivas';
    if (username === 'paciente1') return 'Lucía Castro';
    
    // Capitalize first/last names if formatted as first.last
    return username
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider">Código</th>
              <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider">Nombre de Usuario</th>
              <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentUsers.length > 0 ? (
              currentUsers.map((u) => {
                const initials = getInitials(u.nombreUsuario);
                const avatar = getAvatarStyles(initials);
                const displayName = getDisplayName(u.nombreUsuario);
                const isActivo = u.estado?.toUpperCase() === 'ACTIVO';
                const roleName = u.rol || 'Sin Rol';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                    {/* Código */}
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {formatCode(u.codigo)}
                    </td>

                    {/* Nombre con Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: avatar.bg, color: avatar.text }}
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs select-none shadow-sm"
                        >
                          {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-slate-800 truncate">{displayName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Rol Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        roleName.toLowerCase() === 'administrador' 
                          ? 'bg-sky-50 text-sky-700 border border-sky-100' 
                          : roleName.toLowerCase() === 'dentista' 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {roleName}
                      </span>
                    </td>

                    {/* Estado Dot */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <span className={`h-2 w-2 rounded-full ${isActivo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={isActivo ? 'text-emerald-700' : 'text-rose-600'}>
                          {isActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => onEdit(u)}
                          className="p-1.5 rounded-lg border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors duration-200 cursor-pointer"
                          title="Editar usuario"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(u)}
                          className={`p-1.5 rounded-lg border border-slate-100 transition-colors duration-200 cursor-pointer ${
                            isActivo 
                              ? 'text-rose-500 hover:bg-rose-50 hover:text-rose-700' 
                              : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title={isActivo ? "Eliminar usuario" : "Activar usuario"}
                        >
                          {isActivo ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {totalItems > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
          <span className="text-xs font-medium text-slate-500">
            Mostrando {startIndex + 1} a {endIndex} de {totalItems} usuarios
          </span>

          <div className="flex items-center gap-1">
            {/* Prev Button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-150 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  currentPage === page
                    ? 'bg-brand-700 text-white shadow-sm shadow-teal-700/20'
                    : 'border border-transparent text-slate-600 hover:bg-white hover:border-slate-200'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-150 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
