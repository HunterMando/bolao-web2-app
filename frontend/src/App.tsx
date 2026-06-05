import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Campanhas from './pages/Campanhas';
import NovaAposta from './pages/NovaAposta';
import Login from './pages/Login';
import NovaCampanha from './pages/NovaCampanha';
import Cadastro from './pages/Cadastro';
import ProtectedRoute from './components/ProtectedRoute';
import ResultadoCampanha from './pages/ResultadoCampanha';
import MeusBoloes from './pages/MeusBoloes';
import AdminDashboard from './pages/AdminDashboard'; // Importação do Dashboard

function App() {
  return (
    <>
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Campanhas />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas Protegidas (Exigem Login) */}
        <Route path="/apostar/:campanhaId" element={
          <ProtectedRoute>
            <NovaAposta />
          </ProtectedRoute>
        } />

        {/* Carteira de Apostas */}
        <Route path="/meus-boloes" element={
          <ProtectedRoute>
            <MeusBoloes />
          </ProtectedRoute>
        } />

        {/* Rotas Exclusivas de ADMIN */}
        <Route path="/nova-campanha" element={
          <ProtectedRoute adminOnly={true}>
            <NovaCampanha />
          </ProtectedRoute>
        } />

        <Route path="/resultado/:campanhaId" element={
          <ProtectedRoute adminOnly={true}>
            <ResultadoCampanha />
          </ProtectedRoute>
        } />

        {/* Nova Rota: Admin Dashboard */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Rota Fallback (Redireciona para home se a rota não existir) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;