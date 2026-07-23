import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Activity, 
  BarChart3, 
  User, 
  LogOut, 
  Stethoscope,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/', { replace: true });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Agenda', path: '/gestion-citas', icon: Calendar },
    { name: 'Pacientes', path: '/pacientes', icon: Users },
    { name: 'Tratamientos', path: '/tratamientos', icon: Activity },
    { name: 'Reportes', path: '/reportes', icon: BarChart3 },
    { name: 'Usuarios', path: '/usuarios', icon: User },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand + close btn */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-3 decoration-transparent">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-md shadow-teal-500/25">
                <Stethoscope size={20} color="#ffffff" />
              </div>
              <span className="font-bold text-lg text-brand-800 tracking-tight">DentalCare</span>
            </NavLink>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 md:hidden cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {menuItems
              .filter(item => {
                if (item.path === '/dashboard' || item.path === '/usuarios') {
                  return user?.rol === 'Administrador' || user?.idRol === 1;
                }
                return true;
              })
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* Bottom user info + logout */}
        <div className="flex flex-col gap-5 border-t border-slate-100 pt-5">
          {user && (
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm select-none">
                {getInitials(user.nombreUsuario)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-800 truncate">{user.nombreUsuario}</span>
                <span className="text-[11px] text-slate-400 truncate">{user.rol}</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-200 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
