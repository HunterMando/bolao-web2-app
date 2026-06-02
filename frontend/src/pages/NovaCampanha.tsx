import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Select from 'react-select';
import api from '../services/api';

export default function NovaCampanha() {
    const navigate = useNavigate();
    const [tiposCampanha, setTiposCampanha] = useState<any[]>([]);
    
    // Estado para os campos tradicionais
    const [form, setForm] = useState({
        nome: '', dt_inicio: '', dt_fim: '', taxa_operacional: '', valor_bolao: '', codigo_campanha: '', tipo_campanha_id: ''
    });

    // NOVO: Estado para guardar a lista de palpites dinâmicos (começa com 2 vazios obrigatórios)
    const [opcoes, setOpcoes] = useState<string[]>(['', '']);

    useEffect(() => {
        api.get('/tipos-campanha').then(res => setTiposCampanha(res.data));
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
        // Validação: Garante que o administrador não deixou caixas de palpite vazias
        if (opcoes.some(op => op.trim() === '')) return toast.error('Preencha todas as opções de palpite ou remova as vazias.');

        try {
            await api.post('/campanhas', {
                ...form,
                taxa_operacional: Number(form.taxa_operacional),
                valor_bolao: Number(form.valor_bolao),
                tipo_campanha_id: Number(form.tipo_campanha_id),
                opcoes: opcoes // <-- Enviamos a lista de palpites para o Back-end!
            });
            toast.success('Campanha e Palpites criados com sucesso!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao criar campanha.');
        }
    };

    const opcoesSelect = tiposCampanha.map(tipo => ({ value: tipo.id, label: tipo.descricao }));

    // Estilizamos o React Select para ficar idêntico à nossa classe ".form-control"
    const customStyles = {
        control: (base: any, state: any) => ({
            ...base,
            cursor: 'pointer', // A "mãozinha" no campo principal
            padding: '2px 4px',
            borderRadius: '8px',
            borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
            '&:hover': { borderColor: state.isFocused ? '#3b82f6' : '#9ca3af' }
        }),
        option: (base: any) => ({
            ...base,
            cursor: 'pointer' // A "mãozinha" nas opções da lista
        })
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 20px 100px 20px' }}>
            <div className="card" style={{ maxWidth: '600px' }}>
                <h2 className="titulo">Criar Nova Campanha</h2>
                
                <form onSubmit={handleSubmit}>
                    {/* ... (Os campos de Nome, Data, Taxa e Código continuam iguais) ... */}
                    <div className="form-group">
                        <label>Nome da Campanha</label>
                        <input type="text" className="form-control" required title="" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Real Madrid x B. Dortmund" />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Início</label>
                            <input type="datetime-local" className="form-control" required title="" value={form.dt_inicio} onChange={e => setForm({...form, dt_inicio: e.target.value})} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Fim</label>
                            <input type="datetime-local" className="form-control" required title="" value={form.dt_fim} onChange={e => setForm({...form, dt_fim: e.target.value})} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Taxa (%)</label>
                            <input type="number" step="0.01" className="form-control" required title="" value={form.taxa_operacional} onChange={e => setForm({...form, taxa_operacional: e.target.value})} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Valor (R$)</label>
                            <input type="number" step="0.01" className="form-control" required title="" value={form.valor_bolao} onChange={e => setForm({...form, valor_bolao: e.target.value})} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Código Único</label>
                        <input type="text" className="form-control" required title="" value={form.codigo_campanha} onChange={e => setForm({...form, codigo_campanha: e.target.value})} />
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
                        />
                    </div>

                    {/* ========================================================= */}
                    {/* AQUI COMEÇA A MAGIA DOS PALPITES DINÂMICOS                */}
                    {/* ========================================================= */}
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
                                />
                                <button 
                                    type="button" 
                                    onClick={() => removerOpcao(index)}
                                    style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold' }}
                                    title="Remover palpite"
                                >
                                    X
                                </button>
                            </div>
                        ))}

                        <button 
                            type="button" 
                            onClick={adicionarOpcao}
                            style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: '2px dashed #9ca3af', color: '#4b5563', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}
                        >
                            + Adicionar Novo Palpite
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Guardar Campanha Completa</button>
                        <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151' }} onClick={() => navigate('/')}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}