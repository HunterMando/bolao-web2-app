// frontend/src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const resposta = await api.post('/usuarios/login', { email, senha });
            
            localStorage.setItem('token', resposta.data.token);
            localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario));

            // MAGIA: Adeus alert(), olá Toast!
            toast.success('Login efetuado com sucesso!');
            navigate('/');
            
        } catch (error: any) {
            // MAGIA: Toast de Erro (Fica vermelho e elegante)
            toast.error(error.response?.data?.erro || 'Erro ao fazer login.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
            <div className="card">
                <h2 className="titulo">Entrar no Sistema</h2>
                
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input 
                            type="email" 
                            className="form-control"
                            required 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Senha</label>
                        <input 
                            type="password" 
                            className="form-control"
                            required 
                            value={senha} 
                            onChange={e => setSenha(e.target.value)} 
                            placeholder="••••••••"
                        />
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary">
                            Entrar
                        </button>

                        <button 
                            type="button" 
                            className="btn btn-link"
                            onClick={() => navigate('/cadastro')} 
                        >
                            Ainda não tem conta? Cadastre-se
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}