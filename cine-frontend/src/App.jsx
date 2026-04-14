// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import Navbar        from './components/Navbar';
import CarteraPage   from './pages/CartelaPage';
import PeliculaPage  from './pages/PeliculaPage';
import AsientosPage  from './pages/AsientosPage';
import TiquetePage   from './pages/TiquetePage';
import ValidarPage   from './pages/ValidarPage';
import AdminPage     from './pages/AdminPage';
import LoginPage     from './pages/LoginPage';
import PerfilPage    from './pages/PerfilPage';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-cinema-amber">Cargando...</div>;
  if (!user || user.rol !== 'admin') return <Navigate to="/login" />;
  return children;
};

const AppRoutes = () => (
  <div className="min-h-screen bg-cinema-black">
    <Navbar />
    <Routes>
      <Route path="/"                    element={<CarteraPage />} />
      <Route path="/pelicula/:id"        element={<PeliculaPage />} />
      <Route path="/funcion/:id/asientos" element={<AsientosPage />} />
      <Route path="/tiquete/:codigo"     element={<TiquetePage />} />
      <Route path="/validar"             element={<ValidarPage />} />
      <Route path="/login"               element={<LoginPage />} />
      <Route path="/admin"               element={<AdminRoute><AdminPage /></AdminRoute>} />
      <Route path="/perfil"              element={<PerfilPage />} />
      <Route path="*"                    element={<Navigate to="/" />} />
    </Routes>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
