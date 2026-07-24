import React, { useState, useEffect } from 'react';
import type { Usuario, Rol } from '../services/api';
import { apiService } from '../services/api';
import { 
  UserPlus, 
  Hash, 
  AtSign, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  Info, 
  Save 
} from 'lucide-react';

interface UserFormProps {
  user: Usuario | null; // null if creating a new user
  onSave: (userData: Usuario) => Promise<void>;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [idRol, setIdRol] = useState<number>(0);
  const [codigo, setCodigo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [estado, setEstado] = useState('ACTIVO');
  const [roles, setRoles] = useState<Rol[]>([]);
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Interactive UI States (Focus & Hovers)
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Fetch available roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await apiService.getRoles();
        // Load only active roles for user registration
        setRoles(data.filter(r => r.estado?.toUpperCase() === 'ACTIVO'));
      } catch (err) {
        console.error('Error al cargar los roles:', err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (user) {
      setNombreUsuario(user.nombreUsuario || '');
      setIdRol(user.idRol || 0);
      setCodigo(user.codigo || '');
      setEstado(user.estado || 'ACTIVO');
      setContrasena(user.contrasena || ''); // Pre-fill password as requested
    } else {
      setNombreUsuario('');
      setIdRol(0); // Prompt user to select
      // Auto-generate code with 'DC-' prefix instead of 'USR'
      const randomNum = Math.floor(100 + Math.random() * 900);
      setCodigo(`DC-${randomNum}`);
      setContrasena('');
      setEstado('ACTIVO');
    }
    setError('');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreUsuario.trim()) {
      setError('El nombre de usuario es requerido.');
      return;
    }
    if (!codigo.trim()) {
      setError('El código de usuario es requerido.');
      return;
    }
    if (idRol === 0) {
      setError('Por favor, seleccione un rol del sistema.');
      return;
    }
    if (!contrasena.trim()) {
      setError('La contraseña es requerida.');
      return;
    }
    if (contrasena.trim().length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload: Usuario = {
        idRol,
        codigo: codigo.trim(),
        nombreUsuario: nombreUsuario.trim(),
        estado,
        contrasena: contrasena.trim(),
      };

      if (user) {
        payload.id = user.id;
      }

      await onSave(payload);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper styles for focus states
  const getInputStyle = (fieldName: string) => {
    const isFocused = focusedField === fieldName;
    return {
      ...styles.input,
      borderColor: isFocused ? '#009688' : '#E2E8F0',
      boxShadow: isFocused ? '0 0 0 3px rgba(0, 150, 136, 0.15)' : 'none',
      backgroundColor: '#ffffff',
    };
  };

  return (
    <div style={styles.container}>
      {/* Integrated Mockup Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconCircle}>
            <UserPlus size={20} color="#004D40" />
          </div>
          <h2 style={styles.title}>
            {user ? 'Editar Usuario Clínico' : 'Registro de Nuevo Usuario'}
          </h2>
        </div>
        <span style={styles.headerRight}>DentalCare HR</span>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {error && (
          <div style={styles.errorAlert}>
            <span>{error}</span>
          </div>
        )}

        <div style={styles.grid}>
          {/* Código de Empleado */}
          <div style={styles.field}>
            <label style={styles.label}>Código de Empleado</label>
            <div style={styles.inputContainer}>
              <span style={styles.inputIcon}>
                <Hash size={18} color="#94A3B8" />
              </span>
              <input
                type="text"
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                onFocus={() => setFocusedField('codigo')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('codigo')}
                placeholder="#DC-000"
              />
            </div>
          </div>

          {/* Nombre de Usuario */}
          <div style={styles.field}>
            <label style={styles.label}>Nombre de Usuario</label>
            <div style={styles.inputContainer}>
              <span style={styles.inputIcon}>
                <AtSign size={18} color="#94A3B8" />
              </span>
              <input
                type="text"
                required
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                onFocus={() => setFocusedField('nombreUsuario')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('nombreUsuario')}
                placeholder="ej. jdoe"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div style={styles.field}>
            <label style={styles.label}>
              Contraseña
            </label>
            <div style={styles.inputContainer}>
              <span style={styles.inputIcon}>
                <Lock size={18} color="#94A3B8" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                onFocus={() => setFocusedField('contrasena')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...getInputStyle('contrasena'),
                  paddingRight: '44px' // spacing for the eye button
                }}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
              </button>
            </div>
          </div>

          {/* Rol del Sistema */}
          <div style={styles.field}>
            <label style={styles.label}>Rol del Sistema</label>
            <div style={styles.inputContainer}>
              <span style={styles.inputIcon}>
                <Building2 size={18} color="#94A3B8" />
              </span>
              <select
                value={idRol}
                onChange={(e) => setIdRol(Number(e.target.value))}
                onFocus={() => setFocusedField('idRol')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...getInputStyle('idRol'),
                  cursor: 'pointer'
                }}
              >
                <option value={0} disabled hidden>Seleccionar rol</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
                {/* Fallback to original roles in case API/mock load is empty */}
                {roles.length === 0 && (
                  <>
                    <option value={1}>Administrador</option>
                    <option value={2}>Dentista</option>
                    <option value={3}>Paciente / Operador</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>



        {/* Info Alert Box */}
        <div style={styles.infoAlert}>
          <Info size={20} color="#009688" style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={styles.infoText}>
            Asegúrese de que el nombre de usuario sea único. La contraseña debe contener al menos 8 caracteres y ser compartida de forma segura con el nuevo miembro del personal.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            onMouseEnter={() => setHoveredButton('cancel')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              ...styles.cancelBtn,
              backgroundColor: hoveredButton === 'cancel' ? '#F8FAFC' : '#ffffff',
              borderColor: hoveredButton === 'cancel' ? '#94A3B8' : '#E2E8F0',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            onMouseEnter={() => setHoveredButton('save')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              ...styles.saveBtn,
              backgroundColor: hoveredButton === 'save' ? '#00332c' : '#004D40',
            }}
          >
            <Save size={16} />
            <span>{submitting ? 'Guardando...' : 'Guardar Usuario'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  header: {
    padding: '24px 28px',
    backgroundColor: '#E6F4FA',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: 'none',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#D1EAF4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#004D40',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  headerRight: {
    fontSize: '11px',
    color: '#94A3B8',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  form: {
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0F172A',
  },
  optional: {
    fontSize: '11px',
    color: '#94A3B8',
    fontWeight: 400,
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    height: '44px',
    padding: '10px 14px 10px 42px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1E293B',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  eyeButton: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  radioGroup: {
    display: 'flex',
    gap: '40px',
    marginTop: '4px',
  },
  radioOption: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  radioCircle: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid #CBD5E1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  radioDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#004D40',
  },
  radioTextContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  radioLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0F172A',
  },
  radioSublabel: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '1px',
  },
  infoAlert: {
    padding: '14px 18px',
    backgroundColor: '#E6F4FA',
    borderRadius: '10px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    lineHeight: 1.5,
  },
  infoText: {
    fontSize: '12px',
    color: '#1E293B',
    margin: 0,
    fontWeight: 500,
  },
  errorAlert: {
    padding: '12px 16px',
    backgroundColor: '#FFEBEE',
    border: '1px solid #FFCDD2',
    color: '#C62828',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '12px',
  },
  cancelBtn: {
    height: '44px',
    padding: '0 32px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1E293B',
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  saveBtn: {
    height: '44px',
    padding: '0 32px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#004D40',
    border: '1px solid transparent',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,77,64,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
};
