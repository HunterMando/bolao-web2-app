import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    
    // 👇 O novo estado que controla a visibilidade da senha
    const [mostrarSenha, setMostrarSenha] = useState(false);
    
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCarregando(true);
        
        try {
            // 👇 A CORREÇÃO ESTÁ AQUI: Mudamos de '/login' para '/usuarios/login'
            const res = await api.post('/usuarios/login', { email, senha });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
            toast.success('Login realizado com sucesso!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao fazer login. Verifique as suas credenciais.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        /* 👇 A Mágica da Centralização: Ocupa a altura da tela e centraliza o conteúdo */
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 'calc(100vh - 120px)', // Compensa o tamanho do Navbar para ficar no centro exato
            padding: '20px' 
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#111827' }}>Entrar no Sistema</h2>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4b5563', fontSize: '0.95rem' }}>
                            E-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="exemplo@email.com"
                            style={{ 
                                width: '100%', padding: '12px 16px', borderRadius: '8px', 
                                border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' 
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4b5563', fontSize: '0.95rem' }}>
                            Senha
                        </label>
                        
                        {/* 👇 Container relativo para podermos posicionar o botão por cima do input */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                // Se mostrarSenha for true, vira texto. Se false, vira pontinhos.
                                type={mostrarSenha ? 'text' : 'password'}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ 
                                    width: '100%', padding: '12px 16px', 
                                    paddingRight: '45px', // Dá espaço para o ícone não sobrepor o texto
                                    borderRadius: '8px', border: '1px solid #d1d5db', 
                                    fontSize: '1rem', outline: 'none' 
                                }}
                            />
                            
                            {/* O Botão do Olhinho */}
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                style={{
                                    position: 'absolute', right: '12px',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: '#6b7280', display: 'flex', alignItems: 'center', padding: '4px'
                                }}
                                title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {mostrarSenha ? (
                                    // Ícone de Olho Fechado (SVG Premium)
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    // Ícone de Olho Aberto (SVG Premium)
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={carregando} 
                        className="btn"
                        style={{ 
                            width: '100%', padding: '14px', backgroundColor: '#3b82f6', 
                            color: 'white', fontWeight: 'bold', borderRadius: '8px', border: 'none', 
                            cursor: carregando ? 'not-allowed' : 'pointer', marginTop: '10px' 
                        }}
                    >
                        {carregando ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <Link to="/cadastro" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>
                        Ainda não tem conta? Cadastre-se
                    </Link>
                </div>
            </div>
        </div>
    );
}