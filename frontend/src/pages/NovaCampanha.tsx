import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Select from 'react-select';
import api from '../services/api';
import { z } from 'zod';

// 🛡️ O MOLDE ZOD (Validação rigorosa de regras de negócio)
const campanhaSchema = z.object({
    nome: z.string().min(3, 'O nome da campanha deve ter pelo menos 3 letras.'),
    codigo_campanha: z.string().min(3, 'O código único deve ter pelo menos 3 caracteres.'),
    tipo_campanha_id: z.coerce.number().positive('Por favor, selecione um esporte válido.'),
    dt_inicio: z.string().min(1, 'A data de início é obrigatória.'),
    dt_fim: z.string().min(1, 'A data de encerramento é obrigatória.'),
    valor_bolao: z.coerce.number().positive('O valor da aposta deve ser maior que zero (Ex: 10).'),
    taxa_operacional: z.coerce.number().min(0, 'A taxa não pode ser negativa.').max(100, 'A taxa máxima é 100%.'),
    opcoes: z.array(z.string().min(1, 'Este palpite não pode estar vazio.')).min(2, 'Adicione pelo menos 2 palpites.')
}).refine(data => {
    if (!data.dt_inicio || !data.dt_fim) return true;
    return new Date(data.dt_fim) > new Date(data.dt_inicio);
}, {
    message: "A data de encerramento deve ser posterior à data de início.",
    path: ['dt_fim']
});

export default function NovaCampanha() {
    const navigate = useNavigate();
    const [tiposCampanha, setTiposCampanha] = useState<any[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [salvando, setSalvando] = useState<boolean>(false);
    
    // 👇 ESTADO PARA OS ERROS DO ZOD
    const [errosForm, setErrosForm] = useState<{ [key: string]: string }>({});
    
    const [form, setForm] = useState({
        nome: '', dt_inicio: '', dt_fim: '', taxa_operacional: '', valor_bolao: '', codigo_campanha: '', tipo_campanha_id: ''
    });

    const [opcoes, setOpcoes] = useState<string[]>(['', '']);

    useEffect(() => {
        api.get('/tipos-campanha?ativos=true')
            .then(res => setTiposCampanha(res.data))
            .catch(() => toast.error('Erro ao carregar os tipos de campanha.'))
            .finally(() => setCarregando(false));
    }, []);

    const handleOpcaoChange = (index: number, valor: string) => {
        const novasOpcoes = [...opcoes];
        novasOpcoes[index] = valor;
        setOpcoes(novasOpcoes);
        
        // Limpa o erro do palpite específico enquanto o utilizador digita
        if (errosForm[`opcoes_${index}`]) {
            const novosErros = { ...errosForm };
            delete novosErros[`opcoes_${index}`];
            setErrosForm(novosErros);
        }
    };

    const adicionarOpcao = () => setOpcoes([...opcoes, '']);

    const removerOpcao = (index: number) => {
        if (opcoes.length <= 2) {
            toast.error('A campanha precisa ter no mínimo 2 palpites.');
            return;
        }
        const novasOpcoes = opcoes.filter((_, i) => i !== index);
        setOpcoes(novasOpcoes);
        setErrosForm({}); // Limpa erros ao remover para não desalinhar
    };

    // 👇 FUNÇÃO ÚNICA DE SUBMISSÃO COM ZOD
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvando(true);
        setErrosForm({}); // Limpa os erros antigos

        const dadosCompletos = { ...form, opcoes };
        const validacao = campanhaSchema.safeParse(dadosCompletos);

        if (!validacao.success) {
            const errosFormatados: { [key: string]: string } = {};
            validacao.error.issues.forEach(issue => {
                if (issue.path[0] === 'opcoes' && typeof issue.path[1] === 'number') {
                    errosFormatados[`opcoes_${issue.path[1]}`] = issue.message;
                } else {
                    errosFormatados[issue.path[0] as string] = issue.message;
                }
            });
            setErrosForm(errosFormatados);
            toast.error('Verifique os campos destacados em vermelho.');
            setSalvando(false);
            return; 
        }

        try {
            await api.post('/campanhas', validacao.data);
            toast.success('Campanha e Palpites criados com sucesso!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao criar campanha.');
        } finally {
            setSalvando(false);
        }
    };

    const opcoesSelect = tiposCampanha.map(tipo => ({ value: tipo.id, label: tipo.descricao }));

    // ESTILOS DO SELECT COM SUPORTE A ERRO (Borda Vermelha)
    const customStyles = {
        control: (base: any, state: any) => ({
            ...base,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '8px',
            borderColor: errosForm.tipo_campanha_id ? '#ef4444' : (state.isFocused ? '#3b82f6' : '#d1d5db'),
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
            '&:hover': { borderColor: errosForm.tipo_campanha_id ? '#ef4444' : (state.isFocused ? '#3b82f6' : '#9ca3af') }
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
    };

    // COMPONENTE DE MENSAGEM DE ERRO
    const ErrorMessage = ({ mensagem }: { mensagem?: string }) => {
        if (!mensagem) return null;
        return <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px', display: 'block', fontWeight: '500' }}>⚠️ {mensagem}</span>;
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
                
                {/* Adicionado noValidate para desligar os balões do navegador */}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label>Nome da Campanha</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={form.nome} 
                            onChange={e => setForm({...form, nome: e.target.value})} 
                            placeholder="Ex: Real Madrid x B. Dortmund" 
                            disabled={salvando} 
                            style={{ borderColor: errosForm.nome ? '#ef4444' : undefined }}
                        />
                        <ErrorMessage mensagem={errosForm.nome} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Início</label>
                            <input 
                                type="datetime-local" 
                                className="form-control" 
                                value={form.dt_inicio} 
                                onChange={e => setForm({...form, dt_inicio: e.target.value})} 
                                disabled={salvando} 
                                style={{ borderColor: errosForm.dt_inicio ? '#ef4444' : undefined }}
                            />
                            <ErrorMessage mensagem={errosForm.dt_inicio} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Fim</label>
                            <input 
                                type="datetime-local" 
                                className="form-control" 
                                value={form.dt_fim} 
                                onChange={e => setForm({...form, dt_fim: e.target.value})} 
                                disabled={salvando} 
                                style={{ borderColor: errosForm.dt_fim ? '#ef4444' : undefined }}
                            />
                            <ErrorMessage mensagem={errosForm.dt_fim} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Taxa (%)</label>
                            <input 
                                type="number" step="0.01" 
                                className="form-control" 
                                value={form.taxa_operacional} 
                                onChange={e => setForm({...form, taxa_operacional: e.target.value})} 
                                disabled={salvando} 
                                style={{ borderColor: errosForm.taxa_operacional ? '#ef4444' : undefined }}
                            />
                            <ErrorMessage mensagem={errosForm.taxa_operacional} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Valor (R$)</label>
                            <input 
                                type="number" step="0.01" 
                                className="form-control" 
                                value={form.valor_bolao} 
                                onChange={e => setForm({...form, valor_bolao: e.target.value})} 
                                disabled={salvando} 
                                style={{ borderColor: errosForm.valor_bolao ? '#ef4444' : undefined }}
                            />
                            <ErrorMessage mensagem={errosForm.valor_bolao} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Código Único</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={form.codigo_campanha} 
                            onChange={e => setForm({...form, codigo_campanha: e.target.value})} 
                            disabled={salvando} 
                            style={{ borderColor: errosForm.codigo_campanha ? '#ef4444' : undefined }}
                        />
                        <ErrorMessage mensagem={errosForm.codigo_campanha} />
                    </div>

                    <div className="form-group">
                        <label>Tipo de Campanha</label>
                        <Select 
                            options={opcoesSelect}
                            styles={customStyles}
                            placeholder="Selecione ou pesquise..."
                            noOptionsMessage={() => "Nenhum tipo encontrado"}
                            onChange={(opcaoSelecionada: any) => setForm({...form, tipo_campanha_id: opcaoSelecionada?.value || ''})}
                            maxMenuHeight={160}
                            menuPlacement="auto"
                            isDisabled={salvando}
                        />
                        <ErrorMessage mensagem={errosForm.tipo_campanha_id} />
                    </div>

                    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#1f2937' }}>🎯 Opções de Palpite</h3>
                        
                        <ErrorMessage mensagem={errosForm.opcoes} />

                        {opcoes.map((opcao, index) => (
                            <div key={index} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder={`Ex: Opção ${index + 1}`}
                                        value={opcao}
                                        onChange={(e) => handleOpcaoChange(index, e.target.value)}
                                        disabled={salvando}
                                        style={{ borderColor: errosForm[`opcoes_${index}`] ? '#ef4444' : undefined }}
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
                                <ErrorMessage mensagem={errosForm[`opcoes_${index}`]} />
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