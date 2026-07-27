import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const Login: React.FC = () => {
  const { login, isMockMode } = useAuth();
  const { showError } = useNotification();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(nombreUsuario, contrasena);
      const stored = localStorage.getItem('dental_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.rol === 'Administrador' || parsed.idRol === 1) {
          navigate('/dashboard');
          return;
        }
      }
      navigate('/gestion-citas');
    } catch (err: any) {
      const msg = err.message || 'Usuario o contraseña incorrectos.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div className="card" style={styles.card}>
        <div style={styles.logoCircle}>
          <Stethoscope size={32} color="#ffffff" />
        </div>
        <h2 style={styles.title}>Iniciar Sesión</h2>
        <p style={styles.subtitle}>Ingresa tus credenciales para acceder a tu panel de control dental</p>

        {isMockMode && (
          <div style={styles.mockAlert}>
            <AlertCircle size={16} color="var(--primary-700)" />
            <div style={styles.mockAlertText}>
              <strong>Modo de Demostración:</strong> El backend está fuera de línea. Puedes ingresar con:
              <br />• Administrador: <code>admin</code> / <code>admin123</code>
              <br />• Dentista: <code>dr.garcia</code> / <code>dentista123</code>
              <br />• Paciente: <code>paciente1</code> / <code>paciente123</code>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Nombre de Usuario</label>
            <div style={styles.inputWithIcon}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                required
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="ej. admin"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={styles.inputWithIcon}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
          >
            {loading ? 'Iniciando sesión...' : 'Entrar al Panel'}
          </button>
        </form>

        {/* Registro deshabilitado desde login */}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    padding: '4rem 1.5rem',
    background: 'radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.04) 0%, rgba(99, 102, 241, 0.01) 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '3rem 2.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoCircle: {
    width: '4rem',
    height: '4rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary-400), var(--primary-700))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 8px 24px rgba(20, 184, 166, 0.25)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '2rem',
  },
  mockAlert: {
    backgroundColor: 'var(--primary-50)',
    border: '1px dashed var(--primary-300)',
    borderRadius: 'var(--radius-sm)',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    gap: '0.75rem',
    textAlign: 'left',
    width: '100%',
  },
  mockAlertText: {
    fontSize: '0.8rem',
    color: 'var(--primary-900)',
    lineHeight: '1.5',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    fontSize: '0.85rem',
    width: '100%',
    marginBottom: '1.5rem',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    textAlign: 'left',
  },
  form: {
    width: '100%',
  },
  inputWithIcon: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  registerLink: {
    color: 'var(--primary-600)',
    fontWeight: 700,
  }
};
