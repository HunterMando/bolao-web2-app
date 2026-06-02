import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// 2. Trocamos "JSX.Element" por "ReactNode"
export default function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode, adminOnly?: boolean }) {
    const token = localStorage.getItem('token');
    const usuarioString = localStorage.getItem('usuario');
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && usuario?.tipo_usuario !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
}