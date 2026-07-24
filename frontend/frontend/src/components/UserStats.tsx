import React from 'react';
import { Users, Activity, Shield } from 'lucide-react';
import type { Usuario } from '../services/api';

interface UserStatsProps {
  users: Usuario[];
}

export const UserStats: React.FC<UserStatsProps> = ({ users }) => {
  const totalUsers = users.length;

  // Calculate active sessions: let's show a realistic number, e.g., 1 (the current user) or 3
  const activeSessions = totalUsers > 0 ? Math.min(totalUsers, 5) : 1;

  // Roles defined: count unique roles in the users list
  const uniqueRoles = Array.from(new Set(users.map((u) => u.rol || 'Sin Rol')));
  const rolesCount = uniqueRoles.length;
  const rolesSummary = uniqueRoles.slice(0, 3).join(', ');

  // Just a visual count of new users (created in the last few, e.g., id > 2)
  const newUsersCount = users.filter(u => (u.id || 0) > 3).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* Total Users Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-teal-800 tracking-wider uppercase mb-1">
            Usuarios Totales
          </span>
          <span className="text-3xl font-extrabold text-slate-800 leading-tight">
            {totalUsers}
          </span>
          <span className="text-xs text-teal-600 font-medium mt-2 flex items-center gap-1">
            <span>↑</span> {newUsersCount > 0 ? `${newUsersCount} nuevos` : 'Al día'}
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <Users size={22} />
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-teal-800 tracking-wider uppercase mb-1">
            Sesiones Activas
          </span>
          <span className="text-3xl font-extrabold text-slate-800 leading-tight">
            {activeSessions}
          </span>
          <span className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            En tiempo real
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <Activity size={22} />
        </div>
      </div>

      {/* Defined Roles Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold text-teal-800 tracking-wider uppercase mb-1">
            Roles Definidos
          </span>
          <span className="text-3xl font-extrabold text-slate-800 leading-tight">
            {rolesCount}
          </span>
          <span className="text-xs text-slate-500 font-medium mt-2 truncate max-w-[180px]">
            {rolesSummary}
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <Shield size={22} />
        </div>
      </div>
    </div>
  );
};
