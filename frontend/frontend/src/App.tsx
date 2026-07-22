import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { GestionCitas } from './pages/GestionCitas';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas del equipo — con Layout compartido (Navbar + Footer) */}
          <Route element={<Layout><Login /></Layout>} path="/" />
          <Route element={<Layout><Register /></Layout>} path="/register" />

          {/* Nuestra página — completamente independiente, SIN Layout */}
          <Route path="/gestion-citas" element={<GestionCitas />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
