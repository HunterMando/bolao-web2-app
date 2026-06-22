import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Select from 'react-select';
import { z } from 'zod';

// 🛡️ O MOLDE ZOD DO FRONT-END
const usuarioSchema = z.object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 letras.'),
    email: z.string().email('Formato de e-mail inválido.'),
    cpf: z.string().regex(/^\d{11}$/, 'O CPF deve conter exatamente 11 números.'),
    telefone: z.string().regex(/^\d{10,11}$/, 'O telefone deve conter o DDD e o número válido.'),
    tipo_usuario: z.string(),
    senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.')
});

export default function Cadastro() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nome: '', cpf: '', email: '', telefone: '', tipo_usuario: 'COMUM', senha: ''
    });

    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    
    // 👇 NOVO: Estado para guardar os erros específicos de cada campo
    const [errosForm, setErrosForm] = useState<{ [key: string]: string }>({});

    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setCarregando(true);
        setErrosForm({}); // Limpa os erros anteriores ao tentar novamente
        
        // 🧹 Limpa pontuações e letras antes de validar
        const dadosLimpos = {
            ...form,
            cpf: form.cpf.replace(/\D/g, ''),
            telefone: form.telefone.replace(/\D/g, '')
        };

        // 🛡️ Validação do Zod
        const validacao = usuarioSchema.safeParse(dadosLimpos);
        
        if (!validacao.success) {
            // 👇 Mapeia todos os erros do Zod para o estado "errosForm"
            const errosFormatados: { [key: string]: string } = {};
            validacao.error.issues.forEach(issue => {
                const campo = issue.path[0] as string;
                errosFormatados[campo] = issue.message;
            });
            
            setErrosForm(errosFormatados);
            toast.error('Verifique os campos destacados em vermelho.');
            setCarregando(false);
            return; 
        }

        try {
            // Se passou, envia para a API
            await api.post('/usuarios', validacao.data);
            toast.success('Cadastro realizado com sucesso! Faça o seu login.');
            navigate('/login');
        } catch (error) {
            const err = error as any;
            toast.error(err.response?.data?.erro || 'Erro ao realizar o cadastro.');
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

    // Componente auxiliar para não repetirmos o código de mostrar os erros
    const ErrorMessage = ({ mensagem }: { mensagem?: string }) => {
        if (!mensagem) return null;
        return <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px', display: 'block', fontWeight: '500' }}>⚠️ {mensagem}</span>;
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: '40px 20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#111827' }}>Criar Nova Conta</h2>
                
                <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
                    
                    <div>
                        <label style={labelStyle}>Nome Completo</label>
                        <input 
                            type="text" 
                            value={form.nome} 
                            onChange={e => setForm({...form, nome: e.target.value})} 
                            style={{ ...inputStyle, borderColor: errosForm.nome ? '#ef4444' : '#d1d5db' }} 
                            placeholder="Digite o seu nome" 
                        />
                        <ErrorMessage mensagem={errosForm.nome} />
                    </div>

                    <div>
                        <label style={labelStyle}>CPF</label>
                        <input 
                            type="text" 
                            value={form.cpf} 
                            onChange={e => setForm({...form, cpf: e.target.value})} 
                            style={{ ...inputStyle, borderColor: errosForm.cpf ? '#ef4444' : '#d1d5db' }} 
                            placeholder="000.000.000-00" 
                        />
                        <ErrorMessage mensagem={errosForm.cpf} />
                    </div>

                    <div>
                        <label style={labelStyle}>Telefone</label>
                        <input 
                            type="text" 
                            value={form.telefone} 
                            onChange={e => setForm({...form, telefone: e.target.value})} 
                            style={{ ...inputStyle, borderColor: errosForm.telefone ? '#ef4444' : '#d1d5db' }} 
                            placeholder="(00) 00000-0000" 
                        />
                        <ErrorMessage mensagem={errosForm.telefone} />
                    </div>

                    <div>
                        <label style={labelStyle}>E-mail</label>
                        <input 
                            type="email" 
                            value={form.email} 
                            onChange={e => setForm({...form, email: e.target.value})} 
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
                                value={form.senha}
                                onChange={e => setForm({...form, senha: e.target.value})}
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

                    <div>
                        <label style={labelStyle}>Tipo de Perfil (Apenas Testes)</label>
                        <Select 
                            isDisabled={carregando}
                            options={[{ value: 'COMUM', label: 'Usuário Comum (Apostador)' }, { value: 'ADMIN', label: 'Administrador (Cria Campanhas)' }]}
                            value={{ value: form.tipo_usuario, label: form.tipo_usuario === 'ADMIN' ? 'Administrador (Cria Campanhas)' : 'Usuário Comum (Apostador)' }}
                            onChange={(selecionado: any) => setForm({...form, tipo_usuario: selecionado ? selecionado.value : 'COMUM'})}
                            maxMenuHeight={160} 
                            styles={{ 
                                menu: (base) => ({ ...base, zIndex: 100 }),
                                control: (base) => ({ ...base, cursor: 'pointer', padding: '2px', borderRadius: '8px', borderColor: '#d1d5db' }),
                                option: (base) => ({ ...base, cursor: 'pointer' }),  
                            }}
                        />
                    </div>

                    <button type="submit" disabled={carregando} className="btn" style={{ width: '100%', padding: '14px', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: carregando ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'all 0.3s ease' }}>
                        {carregando ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Já tenho conta. Fazer Login</Link>
                </div>
            </div>
        </div>
    );
}