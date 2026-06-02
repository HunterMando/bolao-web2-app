import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Select from 'react-select';
import api from '../services/api';

export default function NovaAposta() {
    const { campanhaId } = useParams();
    const navigate = useNavigate();

    const [opcoes, setOpcoes] = useState<any[]>([]);
    const [meiosPagamento, setMeiosPagamento] = useState<any[]>([]);
    const [campanhaNome, setCampanhaNome] = useState('');
    const [carregando, setCarregando] = useState(true);

    const [form, setForm] = useState({
        meio_pagamento_id: '', campanha_opcao_id: '', comprovante: ''
    });

    useEffect(() => {
        const carregarDados = async () => {
            try {
                // 1. Tenta buscar os Palpites
                // ATENÇÃO: Verifique se no seu backend a rota é exatamente essa!
                const resOpcoes = await api.get(`/campanhas-opcoes/campanha/${campanhaId}`);
                setOpcoes(resOpcoes.data);
                if (resOpcoes.data.length > 0) {
                    // Se 'campanha' não vier do Back-end, ele não quebra e deixa o título em branco
                    setCampanhaNome(resOpcoes.data[0]?.campanha?.nome || '');
                }

                // 2. Tenta buscar os Meios de Pagamento
                // ATENÇÃO: Verifique se no seu backend a rota é exatamente essa!
                const resPagamentos = await api.get('/meios-pagamento');
                setMeiosPagamento(resPagamentos.data);

            } catch (error: any) {
                // O NOSSO ESPIÃO: Mostra o erro real no console do navegador
                console.error("🔥 FALHA NA API:", error.response || error);

                // Mostra um erro mais descritivo na tela
                const msgErro = error.response?.data?.erro || 'Erro ao carregar dados. Verifique o F12.';
                toast.error(msgErro);
            } finally {
                setCarregando(false);
            }
        };

        carregarDados();
    }, [campanhaId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.campanha_opcao_id) return toast.error('Selecione o seu palpite!');
        if (!form.meio_pagamento_id) return toast.error('Selecione a forma de pagamento!');

        try {
            await api.post('/apostas', {
                meio_pagamento_id: Number(form.meio_pagamento_id),
                campanha_opcao_id: Number(form.campanha_opcao_id),
                comprovante: form.comprovante
            });
            toast.success('Aposta registrada com sucesso! Boa sorte!');
            navigate('/meus-boloes');
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao registrar aposta.');
        }
    };

    const selectPalpites = opcoes.map(o => ({ value: o.id, label: o.descricao }));
    const selectPagamentos = meiosPagamento.map(m => ({ value: m.id, label: m.descricao }));

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
        })
    };

    if (carregando) {
        return (
            // Trocamos o marginTop por minHeight: '60vh' para centralizar perfeitamente!
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ color: '#4b5563', marginTop: '20px' }}>Preparando o seu bilhete...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 20px' }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 className="titulo">Confirmar Aposta</h2>

                {/* O troféu foi removido e o espaçamento ajustado */}
                {campanhaNome && (
                    <h4 style={{ textAlign: 'center', color: '#3b82f6', marginBottom: '25px', fontSize: '1.2rem' }}>
                        {campanhaNome}
                    </h4>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>O seu Palpite</label>
                        <Select
                            options={selectPalpites}
                            styles={customStyles}
                            placeholder="Selecione o resultado esperado..."
                            noOptionsMessage={() => "Nenhuma opção encontrada."}
                            onChange={(opcao: any) => setForm({ ...form, campanha_opcao_id: opcao.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Meio de Pagamento</label>
                        <Select
                            options={selectPagamentos}
                            styles={customStyles}
                            placeholder="Como você vai pagar?"
                            onChange={(opcao: any) => setForm({ ...form, meio_pagamento_id: opcao.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Link do Comprovante (Opcional)</label>
                        <input type="text" className="form-control" title="" value={form.comprovante} onChange={e => setForm({ ...form, comprovante: e.target.value })} placeholder="https://..." />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Confirmar Aposta</button>
                        <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151' }} onClick={() => navigate('/')}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}