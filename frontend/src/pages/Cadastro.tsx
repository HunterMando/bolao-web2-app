import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // <-- Trocando alert por toast
import api from '../services/api';

export default function Cadastro() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nome: '', cpf: '', email: '', telefone: '', tipo_usuario: 'COMUM', senha: ''
    });

    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/usuarios', form);
            toast.success('Cadastro realizado com sucesso! Faça seu login.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao realizar o cadastro.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            {/* Usando a classe card global */}
            <div className="card" style={{ maxWidth: '450px' }}>
                <h2 className="titulo">Criar Nova Conta</h2>
                
                <form onSubmit={handleCadastro}>
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <input type="text" className="form-control" required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                    </div>

                    <div className="form-group">
                        <label>CPF</label>
                        <input type="text" className="form-control" required value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
                    </div>

                    <div className="form-group">
                        <label>Telefone</label>
                        <input type="text" className="form-control" required value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
                    </div>

                    <div className="form-group">
                        <label>E-mail</label>
                        <input type="email" className="form-control" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>

                    <div className="form-group">
                        <label>Senha</label>
                        <input type="password" className="form-control" required value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} />
                    </div>

                    <div className="form-group">
                        <label>Tipo de Perfil (Apenas Testes)</label>
                        <select className="form-control" value={form.tipo_usuario} onChange={e => setForm({...form, tipo_usuario: e.target.value})}>
                            <option value="COMUM">Usuário Comum (Apostador)</option>
                            <option value="ADMIN">Administrador (Cria Campanhas)</option>
                        </select>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary">Cadastrar</button>
                        <button type="button" className="btn btn-link" onClick={() => navigate('/login')}>
                            Já tenho conta. Fazer Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}