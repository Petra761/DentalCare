import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, LogOut, User, Menu, X, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isDark = document.body.classList.contains('dark-theme');
    setDarkTheme(isDark);
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle('dark-theme');
    setDarkTheme(!darkTheme);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.navContainer}>
        {/* Brand Logo */}
        <NavLink to="/" style={styles.brand} onClick={() => setMobileOpen(false)}>
          <div style={styles.logoCircle}>
            <Stethoscope size={24} color="#ffffff" />
          </div>
          <span style={styles.brandText}>DentaCare</span>
        </NavLink>

        {/* Desktop Links (Simplified: Auth/Dashboard only) */}
        <div className="nav-desktop-links" style={styles.desktopLinks}>
          {isAuthenticated && (
            <>
              <NavLink to="/gestion-citas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Gestión de Citas
              </NavLink>
              <div style={styles.userInfo}>
                <User size={16} />
                <span style={styles.userName}>{user?.nombreUsuario} ({user?.rol})</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={styles.logoutBtn}>
                <LogOut size={16} />
                Salir
              </button>
            </>
          )}

          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} style={styles.themeToggle} aria-label="Cambiar tema">
            {darkTheme ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#475569" />}
          </button>
        </div>

        {/* Mobile Buttons */}
        <div className="nav-mobile-right" style={styles.mobileRight}>
          <button onClick={toggleTheme} style={styles.themeToggleMobile} aria-label="Cambiar tema">
            {darkTheme ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#475569" />}
          </button>
          
          {isAuthenticated && (
            <button style={styles.menuBtn} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && isAuthenticated && (
        <div style={styles.mobileMenu}>
          <NavLink to="/gestion-citas" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>
            Gestión de Citas (${user?.nombreUsuario})
          </NavLink>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ ...styles.mobileLink, width: '100%' }}>
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    backdropFilter: 'blur(10px)',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
  },
  navContainer: {
    height: '4.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: 800,
    fontSize: '1.4rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--text-primary)',
  },
  logoCircle: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary-400), var(--primary-700))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(20, 184, 166, 0.25)',
  },
  brandText: {
    background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '800',
  },
  desktopLinks: {
    alignItems: 'center',
    gap: '2rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    padding: '0.25rem 0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-full)',
  },
  userName: {
    fontWeight: 600,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  themeToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  mobileRight: {
    gap: '0.5rem',
  },
  themeToggleMobile: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenu: {
    position: 'absolute',
    top: '4.5rem',
    left: 0,
    width: '100%',
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  mobileLink: {
    padding: '0.5rem 0',
    fontSize: '1.1rem',
    fontWeight: 500,
    borderBottom: '1px solid var(--bg-secondary)',
    color: 'var(--text-primary)',
  }
};
