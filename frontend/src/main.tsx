// frontend/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- Importamos o motor de rotas
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Envolvemos o nosso App com o motor de rotas */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);