import React, { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Menu, Stethoscope } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isPublicRoute = ['/', '/register'].includes(location.pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgApp">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-700"></div>
      </div>
    );
  }

  // Public routes: Login & Register
  if (isPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // Private routes: redirect to Login if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role check: Only Administrador can access Dashboard and Usuarios
  const isAdmin = user?.rol?.toLowerCase() === 'administrador';
  const isAdminRoute = ['/dashboard', '/usuarios'].includes(location.pathname);

  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/gestion-citas" replace />;
  }

  return (
    <div className="flex min-h-screen bg-bgApp text-slate-800">
      {/* Sidebar for desktop and mobile */}
      <div className="md:sticky md:top-0 md:h-screen z-50 flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Container */}
      <div className="flex-grow flex flex-col min-h-screen min-w-0">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 md:hidden sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-sm">
              <Stethoscope size={16} color="#ffffff" />
            </div>
            <span className="font-bold text-base text-brand-800 tracking-tight">DentalCare</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors duration-200"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
