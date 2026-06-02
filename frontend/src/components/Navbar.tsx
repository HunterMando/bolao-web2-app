// 1. Importamos o useLocation além do useNavigate
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation(); // <-- 2. Capturamos a URL atual da página
    
    const usuarioString = localStorage.getItem('usuario');
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', backgroundColor: '#343a40', color: 'white', marginBottom: '20px', fontFamily: 'sans-serif' }}>
            <h2 style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
                🏆 Bolão App
            </h2>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {usuario ? (
                    <>
                        <span>Olá, <strong>{usuario.nome}</strong> ({usuario.tipo_usuario})</span>
                        
                        {/* 3. A MAGIA: O botão só aparece se for ADMIN E a página atual NÃO for a de criar campanha */}
                        {usuario.tipo_usuario === 'ADMIN' && location.pathname !== '/nova-campanha' && (
                            <button onClick={() => navigate('/nova-campanha')} style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                + Criar Campanha
                            </button>
                        )}

                        <button onClick={handleLogout} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Sair
                        </button>
                    </>
                ) : (
                    <button onClick={() => navigate('/login')} style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Fazer Login
                    </button>
                )}
            </div>
        </nav>
    );
}