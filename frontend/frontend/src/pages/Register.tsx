import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmContrasena, setConfirmContrasena] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (contrasena !== confirmContrasena) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      await register(nombreUsuario, contrasena);
      setSuccess(true);
      setNombreUsuario('');
      setContrasena('');
      setConfirmContrasena('');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse. Intenta de nuevo.');
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
        <h2 style={styles.title}>Registro de Paciente</h2>
        <p style={styles.subtitle}>Crea tu cuenta de paciente para poder gestionar tus citas en línea</p>

        {success ? (
          <div style={styles.successBox}>
            <CheckCircle2 size={48} color="var(--success)" />
            <h4 style={styles.successTitle}>¡Registro Completado!</h4>
            <p style={styles.successDesc}>
              Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión con tus credenciales.
            </p>
            <Link to="/" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Ir a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <>
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
                    placeholder="ej. juanperez"
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
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
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

              <div className="form-group">
                <label className="form-label">Confirmar Contraseña</label>
                <div style={styles.inputWithIcon}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmContrasena}
                    onChange={(e) => setConfirmContrasena(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="Repite tu contraseña"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
              >
                {loading ? 'Procesando registro...' : 'Crear Cuenta Paciente'}
              </button>
            </form>
          </>
        )}

        {!success && (
          <div style={styles.footer}>
            <span>¿Ya tienes una cuenta?</span>
            <Link to="/login" style={styles.loginLink}>
              Inicia sesión aquí
            </Link>
          </div>
        )}
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
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    padding: '1rem 0',
  },
  successTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  successDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
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
  loginLink: {
    color: 'var(--primary-600)',
    fontWeight: 700,
  }
};
