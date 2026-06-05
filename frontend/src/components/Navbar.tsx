import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    
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
        padding: '8px 16px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: '600',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    return (
        <>
            {/* 🎨 CSS Injetado para os efeitos de Hover (Animações) */}
            <style>{`
                .nav-btn {
                    transition: all 0.2s ease-in-out;
                }
                .nav-btn:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .logo-text {
                    transition: all 0.2s ease;
                }
                .logo-text:hover {
                    opacity: 0.8;
                    transform: scale(1.02);
                }
            `}</style>

            <nav style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '16px 30px', 
                backgroundColor: '#0f172a', // Tom escuro moderno (Slate 900)
                color: 'white', 
                marginBottom: '30px', 
                fontFamily: "'Inter', sans-serif", 
                alignItems: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <h2 
                    className="logo-text"
                    style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }} 
                    onClick={() => navigate('/')}
                >
                    <span style={{ fontSize: '1.8rem' }}>🏆</span> Bolão App
                </h2>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {usuario ? (
                        <>
                            {/* BADGE DO USUÁRIO */}
                            <div style={{ 
                                backgroundColor: '#1e293b', // Slate 800
                                padding: '6px 14px', 
                                borderRadius: '20px',
                                border: '1px solid #334155',
                                marginRight: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                                    Olá, <strong style={{ color: 'white' }}>{usuario.nome}</strong> 
                                    <span style={{ fontSize: '0.75rem', backgroundColor: isAdmin ? '#4f46e5' : '#059669', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 'bold' }}>
                                        {usuario.tipo_usuario}
                                    </span>
                                </span>
                            </div>
                            
                            {/* BOTÕES PARA USUÁRIO COMUM */}
                            {!isAdmin && (
                                <button 
                                    className="nav-btn"
                                    onClick={() => navigate('/meus-boloes')} 
                                    style={{ ...btnStyle, backgroundColor: '#0ea5e9', color: 'white' }}
                                >
                                    🎟️ Meus Bolões
                                </button>
                            )}
                            
                            {/* BOTÕES PARA ADMIN */}
                            {isAdmin && (
                                <>
                                    <button 
                                        className="nav-btn"
                                        onClick={() => navigate('/admin/dashboard')} 
                                        style={{ ...btnStyle, backgroundColor: '#6366f1', color: 'white' }}
                                    >
                                        📊 Dashboard
                                    </button>

                                    <button 
                                        className="nav-btn"
                                        onClick={() => navigate('/nova-campanha')} 
                                        style={{ ...btnStyle, backgroundColor: '#f59e0b', color: '#fff' }}
                                    >
                                        ➕ Criar Campanha
                                    </button>
                                </>
                            )}

                            {/* BOTÃO SAIR */}
                            <button 
                                className="nav-btn"
                                onClick={handleLogout} 
                                style={{ ...btnStyle, backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '7px 15px' }}
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <button 
                            className="nav-btn"
                            onClick={() => navigate('/login')} 
                            style={{ ...btnStyle, backgroundColor: '#10b981', color: 'white' }}
                        >
                            Fazer Login
                        </button>
                    )}
                </div>
            </nav>
        </>
    );
}