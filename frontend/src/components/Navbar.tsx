import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Recupera o usuário
    const usuarioString = localStorage.getItem('usuario');
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;
    const isAdmin = usuario?.tipo_usuario === 'ADMIN';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    // Estilo base para botões da Navbar
    const btnStyle = { 
        padding: '6px 12px', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        fontSize: '0.85rem'
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', backgroundColor: '#343a40', color: 'white', marginBottom: '20px', fontFamily: 'sans-serif', alignItems: 'center' }}>
            <h2 style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
                🏆 Bolão App
            </h2>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {usuario ? (
                    <>
                        <span style={{ fontSize: '0.9rem', marginRight: '10px' }}>
                            Olá, <strong>{usuario.nome}</strong> ({usuario.tipo_usuario})
                        </span>
                        
                        {/* BOTÕES PARA USUÁRIO COMUM */}
                        {!isAdmin && (
                            <button 
                                onClick={() => navigate('/meus-boloes')} 
                                style={{ ...btnStyle, backgroundColor: '#17a2b8', color: 'white' }}
                            >
                                🎟️ Meus Bolões
                            </button>
                        )}
                        
                        {/* BOTÕES PARA ADMIN */}
                        {isAdmin && (
                            <>
                                {/* Link para o Dashboard */}
                                <button 
                                    onClick={() => navigate('/admin/dashboard')} 
                                    style={{ ...btnStyle, backgroundColor: '#6f42c1', color: 'white' }}
                                >
                                    📊 Dashboard
                                </button>

                                {/* Link para Criar Campanha - AGORA APARECE SEMPRE */}
                                <button 
                                    onClick={() => navigate('/nova-campanha')} 
                                    style={{ ...btnStyle, backgroundColor: '#ffc107', color: '#000' }}
                                >
                                    + Criar Campanha
                                </button>
                            </>
                        )}

                        {/* BOTÃO SAIR (Igual para todos) */}
                        <button 
                            onClick={handleLogout} 
                            style={{ ...btnStyle, backgroundColor: '#dc3545', color: 'white' }}
                        >
                            Sair
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => navigate('/login')} 
                        style={{ ...btnStyle, backgroundColor: '#28a745', color: 'white' }}
                    >
                        Fazer Login
                    </button>
                )}
            </div>
        </nav>
    );
}