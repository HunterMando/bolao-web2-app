import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { z } from 'zod';

// 🛡️ O MOLDE ZOD DO LOGIN
const loginSchema = z.object({
    email: z.string().min(1, 'O e-mail é obrigatório.').email('Formato de e-mail inválido.'),
    senha: z.string().min(1, 'A senha é obrigatória.')
});

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    
    // 👇 ESTADO PARA OS ERROS DO ZOD
    const [errosForm, setErrosForm] = useState<{ [key: string]: string }>({});
    
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCarregando(true);
        setErrosForm({}); // Limpa erros antigos
        
        // 🛡️ Validação "Safe" do Zod
        const validacao = loginSchema.safeParse({ email, senha });

        if (!validacao.success) {
            const errosFormatados: { [key: string]: string } = {};
            validacao.error.issues.forEach(issue => {
                errosFormatados[issue.path[0] as string] = issue.message;
            });
            setErrosForm(errosFormatados);
            toast.error('Verifique os campos destacados em vermelho.');
            setCarregando(false);
            return; 
        }

        try {
            const res = await api.post('/usuarios/login', validacao.data);
            
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

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '8px', 
        border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none',
        boxSizing: 'border-box' as 'border-box', transition: 'border-color 0.2s'
    };

    const labelStyle = {
        display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4b5563', fontSize: '0.95rem'
    };

    // COMPONENTE DE MENSAGEM DE ERRO
    const ErrorMessage = ({ mensagem }: { mensagem?: string }) => {
        if (!mensagem) return null;
        return <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px', display: 'block', fontWeight: '500' }}>⚠️ {mensagem}</span>;
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: '40px 20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#111827' }}>Acessar Conta</h2>
                
                <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>E-mail</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => {
                                setEmail(e.target.value);
                                if (errosForm.email) setErrosForm({ ...errosForm, email: '' }); // Limpa erro ao digitar
                            }} 
                            style={{ ...inputStyle, borderColor: errosForm.email ? '#ef4444' : '#d1d5db' }} 
                            placeholder="exemplo@email.com" 
                        />
                        <ErrorMessage mensagem={errosForm.email} />
                    </div>

                    <div>
                        <label style={labelStyle}>Senha</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type={mostrarSenha ? 'text' : 'password'}
                                value={senha}
                                onChange={e => {
                                    setSenha(e.target.value);
                                    if (errosForm.senha) setErrosForm({ ...errosForm, senha: '' }); // Limpa erro ao digitar
                                }}
                                placeholder="••••••••"
                                style={{ ...inputStyle, paddingRight: '45px', borderColor: errosForm.senha ? '#ef4444' : '#d1d5db' }}
                            />
                            <button
                                type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', padding: '4px' }}
                                title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {mostrarSenha ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        <ErrorMessage mensagem={errosForm.senha} />
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