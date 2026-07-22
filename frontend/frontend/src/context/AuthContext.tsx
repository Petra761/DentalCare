import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Usuario } from '../services/api';

export interface UserSession {
  id: number;
  codigo: string;
  nombreUsuario: string;
  idRol: number;
  rol: string;
  estado: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (nombreUsuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
  register: (nombreUsuario: string, contrasena: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDentist: boolean;
  isPatient: boolean;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    // Check local storage for active session
    const storedUser = localStorage.getItem('dental_session');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('dental_session');
      }
    }
    setIsMockMode(apiService.isMock());
    setLoading(false);

    // Sync mock mode changes
    const interval = setInterval(() => {
      setIsMockMode(apiService.isMock());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const login = async (nombreUsuario: string, contrasena: string) => {
    try {
      const response = await apiService.login(nombreUsuario, contrasena);
      const sessionData: UserSession = response.usuario;
      setUser(sessionData);
      localStorage.setItem('dental_session', JSON.stringify(sessionData));
      if (response.token) {
        localStorage.setItem('dental_token', response.token);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dental_session');
    localStorage.removeItem('dental_token');
  };

  const register = async (nombreUsuario: string, contrasena: string) => {
    try {
      // Patients are role id 3, code pattern PACxxx, active by default
      const randomCode = 'PAC' + Math.floor(100 + Math.random() * 900);
      const payload: Usuario = {
        idRol: 3,
        codigo: randomCode,
        nombreUsuario,
        contrasena,
        estado: 'ACTIVO'
      };
      await apiService.createUsuario(payload);
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  };

  const isAdmin = user?.rol === 'Administrador' || user?.idRol === 1;
  const isDentist = user?.rol === 'Dentista' || user?.idRol === 2;
  const isPatient = user?.rol === 'Paciente' || user?.idRol === 3;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        isAdmin,
        isDentist,
        isPatient,
        isMockMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
