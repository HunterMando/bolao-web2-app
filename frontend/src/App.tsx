import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Campanhas from './pages/Campanhas';
import NovaAposta from './pages/NovaAposta';
import Login from './pages/Login';
import NovaCampanha from './pages/NovaCampanha';
import Cadastro from './pages/Cadastro';
import ProtectedRoute from './components/ProtectedRoute';
import ResultadoCampanha from './pages/ResultadoCampanha';

function App() {
  return (
    <>
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Rotas Públicas (Qualquer pessoa pode aceder) */}
        <Route path="/" element={<Campanhas />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas Protegidas (Exigem Login) */}
        <Route path="/apostar/:campanhaId" element={
          <ProtectedRoute>
            <NovaAposta />
          </ProtectedRoute>
        } />

        {/* Rotas Exclusivas de ADMIN */}
        <Route path="/nova-campanha" element={
          <ProtectedRoute adminOnly={true}>
            <NovaCampanha />
          </ProtectedRoute>
        } />

        {/* Rota Protegida (só para ADMIN) */}
        <Route path="/resultado/:campanhaId" element={
          <ProtectedRoute adminOnly={true}>
            <ResultadoCampanha />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;