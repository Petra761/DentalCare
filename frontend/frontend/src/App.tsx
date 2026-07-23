import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { GestionCitas } from "./pages/GestionCitas";
import { PacientesListPage } from "./pages/FichaCliente/PacientesPagina";
import { RegistrarPacienteForm } from "./components/FichaCliente/RegistrarPacienteFrom";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas del equipo — con Layout compartido (Navbar + Footer) */}
          <Route
            element={
              <Layout>
                <Login />
              </Layout>
            }
            path="/"
          />
          <Route
            element={
              <Layout>
                <Register />
              </Layout>
            }
            path="/register"
          />

          {/* Nuestra página — completamente independiente, SIN Layout */}
          <Route path="/gestion-citas" element={<GestionCitas />} />
          <Route path="/pacientes" element={<PacientesListPage />} />
          <Route
            path="/pacientes/nuevo"
            element={
              <RegistrarPacienteForm
                onCancelar={() => window.history.back()}
                onSuccess={() => (window.location.href = "/pacientes")}
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
