import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./layouts/Layout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { GestionCitas } from "./pages/GestionCitas";
import { PacientesListPage } from "./pages/FichaCliente/PacientesPagina";
import { RegistrarPacienteForm } from "./components/FichaCliente/RegistrarPacienteFrom";
import { Dashboard } from "./pages/Dashboard";
import { Tratamientos } from "./pages/Tratamientos";
import { Reportes } from "./pages/Reportes";
import { Usuarios } from "./pages/Usuarios";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />

          {/* Private Routes */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/gestion-citas" element={<Layout><GestionCitas /></Layout>} />
          <Route path="/pacientes" element={<Layout><PacientesListPage /></Layout>} />
          <Route
            path="/pacientes/nuevo"
            element={
              <Layout>
                <RegistrarPacienteForm
                  onCancelar={() => window.history.back()}
                  onSuccess={() => (window.location.href = "/pacientes")}
                />
              </Layout>
            }
          />
          <Route path="/tratamientos" element={<Layout><Tratamientos /></Layout>} />
          <Route path="/reportes" element={<Layout><Reportes /></Layout>} />
          <Route path="/usuarios" element={<Layout><Usuarios /></Layout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
