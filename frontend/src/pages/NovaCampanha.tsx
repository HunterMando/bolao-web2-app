import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Select from 'react-select';
import api from '../services/api';

export default function NovaCampanha() {
    const navigate = useNavigate();
    const [tiposCampanha, setTiposCampanha] = useState<any[]>([]);
    
    // ESTADOS DE LOADING
    const [carregando, setCarregando] = useState<boolean>(true);
    const [salvando, setSalvando] = useState<boolean>(false);
    
    // Estado para os campos tradicionais
    const [form, setForm] = useState({
        nome: '', dt_inicio: '', dt_fim: '', taxa_operacional: '', valor_bolao: '', codigo_campanha: '', tipo_campanha_id: ''
    });

    // Estado para guardar a lista de palpites dinâmicos (começa com 2 vazios obrigatórios)
    const [opcoes, setOpcoes] = useState<string[]>(['', '']);

    useEffect(() => {
        api.get('/tipos-campanha')
            .then(res => setTiposCampanha(res.data))
            .catch(() => toast.error('Erro ao carregar os tipos de campanha.'))
            .finally(() => setCarregando(false));
    }, []);

    // Função para atualizar o texto de um palpite específico
    const handleOpcaoChange = (index: number, valor: string) => {
        const novasOpcoes = [...opcoes];
        novasOpcoes[index] = valor;
        setOpcoes(novasOpcoes);
    };

    // Função para adicionar uma nova caixa de palpite vazia
    const adicionarOpcao = () => setOpcoes([...opcoes, '']);

    // Função para remover uma caixa de palpite (mínimo de 2)
    const removerOpcao = (index: number) => {
        if (opcoes.length > 2) {
            setOpcoes(opcoes.filter((_, i) => i !== index));
        } else {
            toast.error('Uma campanha precisa de pelo menos 2 opções de palpite!');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.tipo_campanha_id) return toast.error('Selecione um Tipo de Campanha.');
        if (opcoes.some(op => op.trim() === '')) return toast.error('Preencha todas as opções de palpite ou remova as vazias.');

        setSalvando(true);

        try {
            await api.post('/campanhas', {
                ...form,
                taxa_operacional: Number(form.taxa_operacional),
                valor_bolao: Number(form.valor_bolao),
                tipo_campanha_id: Number(form.tipo_campanha_id),
                opcoes: opcoes 
            });
            toast.success('Campanha e Palpites criados com sucesso!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao criar campanha.');
            setSalvando(false);
        }
    };

    const opcoesSelect = tiposCampanha.map(tipo => ({ value: tipo.id, label: tipo.descricao }));

    // ESTILOS PERSONALIZADOS DO SELECT (AGORA PADRONIZADO COM A NOVA APOSTA)
    const customStyles = {
        control: (base: any, state: any) => ({
            ...base,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '8px',
            borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
            '&:hover': { borderColor: state.isFocused ? '#3b82f6' : '#9ca3af' }
        }),
        option: (base: any) => ({
            ...base,
            cursor: 'pointer'
        }),
        menu: (base: any) => ({
            ...base,
            zIndex: 100 
        }),
        menuList: (base: any) => ({
            ...base,
            // Scrollbar padronizada com cores mais escuras
            '::-webkit-scrollbar': { width: '8px' },
            '::-webkit-scrollbar-track': { background: 'transparent' },
            '::-webkit-scrollbar-thumb': { background: '#6b7280', borderRadius: '8px' },
            '::-webkit-scrollbar-thumb:hover': { background: '#4b5563' }
        })
    };

    if (carregando) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ color: '#4b5563', marginTop: '20px' }}>Carregando opções da plataforma...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 20px 100px 20px' }}>
            <div className="card" style={{ maxWidth: '600px' }}>
                <h2 className="titulo">Criar Nova Campanha</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome da Campanha</label>
                        <input type="text" className="form-control" required title="" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Real Madrid x B. Dortmund" disabled={salvando} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Início</label>
                            <input type="datetime-local" className="form-control" required title="" value={form.dt_inicio} onChange={e => setForm({...form, dt_inicio: e.target.value})} disabled={salvando} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Fim</label>
                            <input type="datetime-local" className="form-control" required title="" value={form.dt_fim} onChange={e => setForm({...form, dt_fim: e.target.value})} disabled={salvando} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Taxa (%)</label>
                            <input type="number" step="0.01" className="form-control" required title="" value={form.taxa_operacional} onChange={e => setForm({...form, taxa_operacional: e.target.value})} disabled={salvando} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Valor (R$)</label>
                            <input type="number" step="0.01" className="form-control" required title="" value={form.valor_bolao} onChange={e => setForm({...form, valor_bolao: e.target.value})} disabled={salvando} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Código Único</label>
                        <input type="text" className="form-control" required title="" value={form.codigo_campanha} onChange={e => setForm({...form, codigo_campanha: e.target.value})} disabled={salvando} />
                    </div>

                    <div className="form-group">
                        <label>Tipo de Campanha</label>
                        <Select 
                            options={opcoesSelect}
                            styles={customStyles}
                            placeholder="Selecione ou pesquise..."
                            noOptionsMessage={() => "Nenhum tipo encontrado"}
                            onChange={(opcaoSelecionada: any) => setForm({...form, tipo_campanha_id: opcaoSelecionada.value})}
                            maxMenuHeight={160}
                            menuPlacement="auto"
                            isDisabled={salvando}
                        />
                    </div>

                    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#1f2937' }}>🎯 Opções de Palpite</h3>
                        
                        {opcoes.map((opcao, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    required 
                                    placeholder={`Ex: Opção ${index + 1}`}
                                    value={opcao}
                                    onChange={(e) => handleOpcaoChange(index, e.target.value)}
                                    disabled={salvando}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => removerOpcao(index)}
                                    style={{ backgroundColor: salvando ? '#fca5a5' : '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: salvando ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                                    title="Remover palpite"
                                    disabled={salvando}
                                >
                                    X
                                </button>
                            </div>
                        ))}

                        <button 
                            type="button" 
                            onClick={adicionarOpcao}
                            style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: '2px dashed #9ca3af', color: '#4b5563', borderRadius: '8px', cursor: salvando ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '5px', opacity: salvando ? 0.5 : 1 }}
                            disabled={salvando}
                        >
                            + Adicionar Novo Palpite
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, opacity: salvando ? 0.7 : 1, cursor: salvando ? 'not-allowed' : 'pointer' }} disabled={salvando}>
                            {salvando ? 'A Guardar...' : 'Guardar Campanha Completa'}
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