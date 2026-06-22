import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Select from 'react-select';
import api from '../services/api';
import { z } from 'zod';

// 🛡️ O MOLDE ZOD (Refinado para tratar a URL opcional perfeitamente)
const apostaSchema = z.object({
    campanha_opcao_id: z.coerce.number().positive('Por favor, escolha o seu palpite.'),
    meio_pagamento_id: z.coerce.number().positive('Por favor, selecione uma forma de pagamento.'),
    comprovante: z.string().refine(val => {
        if (val === '') return true; // Se estiver vazio, passa direto (é opcional)
        try { new URL(val); return true; } catch { return false; } // Se tiver texto, TEM que ser URL
    }, 'Insira um link válido (ex: https://...).')
});

export default function NovaAposta() {
    const { campanhaId } = useParams();
    const navigate = useNavigate();

    const [opcoes, setOpcoes] = useState<any[]>([]);
    const [meiosPagamento, setMeiosPagamento] = useState<any[]>([]);
    const [campanhaNome, setCampanhaNome] = useState('');
    
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    
    const [errosForm, setErrosForm] = useState<{ [key: string]: string }>({});

    const [form, setForm] = useState({
        meio_pagamento_id: '', campanha_opcao_id: '', comprovante: ''
    });

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const resOpcoes = await api.get(`/campanhas-opcoes/campanha/${campanhaId}?ativos=true`);
                setOpcoes(resOpcoes.data);
                if (resOpcoes.data.length > 0) {
                    setCampanhaNome(resOpcoes.data[0]?.campanha?.nome || '');
                }

                const resPagamentos = await api.get('/meios-pagamento?ativos=true');
                setMeiosPagamento(resPagamentos.data);
            } catch (error) {
                toast.error('Erro ao carregar dados.');
            } finally {
                setCarregando(false);
            }
        };
        carregarDados();
    }, [campanhaId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvando(true);
        setErrosForm({}); 

        const validacao = apostaSchema.safeParse(form);

        if (!validacao.success) {
            const errosFormatados: { [key: string]: string } = {};
            validacao.error.issues.forEach(issue => {
                errosFormatados[issue.path[0] as string] = issue.message;
            });
            setErrosForm(errosFormatados);
            toast.error('Verifique os campos destacados em vermelho.');
            setSalvando(false);
            return; 
        }

        try {
            await api.post('/apostas', validacao.data);
            toast.success('Aposta enviada com sucesso! Aguarde a aprovação do Administrador.');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao realizar a aposta.');
        } finally {
            setSalvando(false);
        }
    };

    // 👇 ESTILOS PADRONIZADOS (Iguais à tela de Cadastro)
    const inputStyle = {
        width: '100%', padding: '10px 14px', borderRadius: '8px', 
        border: '1px solid', fontSize: '1rem', outline: 'none',
        boxSizing: 'border-box' as 'border-box', transition: 'border-color 0.2s',
        marginTop: '4px'
    };

    const labelStyle = {
        display: 'block', fontWeight: '600', color: '#4b5563', fontSize: '0.95rem'
    };

    const getCustomStyles = (hasError: boolean) => ({
        control: (base: any, state: any) => ({
            ...base,
            cursor: 'pointer', padding: '2px 4px', borderRadius: '8px', marginTop: '4px',
            borderColor: hasError ? '#ef4444' : (state.isFocused ? '#3b82f6' : '#d1d5db'),
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
            '&:hover': { borderColor: hasError ? '#ef4444' : (state.isFocused ? '#3b82f6' : '#9ca3af') }
        }),
        option: (base: any) => ({ ...base, cursor: 'pointer' }),
        menu: (base: any) => ({ ...base, zIndex: 100 }),
        menuList: (base: any) => ({
            ...base,
            '::-webkit-scrollbar': { width: '8px' },
            '::-webkit-scrollbar-track': { background: 'transparent' },
            '::-webkit-scrollbar-thumb': { background: '#6b7280', borderRadius: '8px' },
            '::-webkit-scrollbar-thumb:hover': { background: '#4b5563' }
        })
    });

    const ErrorMessage = ({ mensagem }: { mensagem?: string }) => {
        if (!mensagem) return null;
        return <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px', display: 'block', fontWeight: '500' }}>⚠️ {mensagem}</span>;
    };

    const selectOpcoes = opcoes.map(op => ({ value: op.id, label: op.descricao }));
    const selectPagamentos = meiosPagamento.map(mp => ({ value: mp.id, label: mp.descricao }));

    if (carregando) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ color: '#4b5563', marginTop: '20px' }}>Preparando o seu bilhete...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 20px 100px 20px' }}>
            <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
                <h2 className="titulo">Fazer Nova Aposta</h2>
                {campanhaNome && <h3 style={{ textAlign: 'center', color: '#4b5563', marginBottom: '25px' }}>{campanhaNome}</h3>}
                
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>Qual o seu Palpite?</label>
                        <Select
                            options={selectOpcoes}
                            styles={getCustomStyles(!!errosForm.campanha_opcao_id)}
                            placeholder="Selecione o seu palpite..."
                            onChange={(opcao: any) => {
                                setForm({ ...form, campanha_opcao_id: opcao.value });
                                if (errosForm.campanha_opcao_id) setErrosForm({ ...errosForm, campanha_opcao_id: '' });
                            }}
                            maxMenuHeight={160} 
                            menuPlacement="auto" 
                            isDisabled={salvando}
                        />
                        <ErrorMessage mensagem={errosForm.campanha_opcao_id} />
                    </div>

                    <div>
                        <label style={labelStyle}>Meio de Pagamento</label>
                        <Select
                            options={selectPagamentos}
                            styles={getCustomStyles(!!errosForm.meio_pagamento_id)}
                            placeholder="Como você vai pagar?"
                            onChange={(opcao: any) => {
                                setForm({ ...form, meio_pagamento_id: opcao.value });
                                if (errosForm.meio_pagamento_id) setErrosForm({ ...errosForm, meio_pagamento_id: '' });
                            }}
                            maxMenuHeight={160} 
                            menuPlacement="auto" 
                            isDisabled={salvando}
                        />
                        <ErrorMessage mensagem={errosForm.meio_pagamento_id} />
                    </div>

                    <div>
                        <label style={labelStyle}>Link do Comprovante (Opcional)</label>
                        <input 
                            type="text" 
                            value={form.comprovante} 
                            onChange={e => {
                                setForm({ ...form, comprovante: e.target.value });
                                if (errosForm.comprovante) setErrosForm({ ...errosForm, comprovante: '' });
                            }} 
                            placeholder="https://..." 
                            style={{ ...inputStyle, borderColor: errosForm.comprovante ? '#ef4444' : '#d1d5db' }}
                            disabled={salvando}
                        />
                        <ErrorMessage mensagem={errosForm.comprovante} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.7 : 1 }} disabled={salvando}>
                            {salvando ? 'Processando...' : 'Confirmar Aposta'}
                        </button>
                        <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.7 : 1 }} onClick={() => navigate('/')} disabled={salvando}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}