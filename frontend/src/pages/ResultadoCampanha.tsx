import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Select from 'react-select';

export default function ResultadoCampanha() {
    const { campanhaId } = useParams();
    const navigate = useNavigate();

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [campanha, setCampanha] = useState<any>(null);
    const [opcoes, setOpcoes] = useState<any[]>([]);
    const [opcaoVencedora, setOpcaoVencedora] = useState<string>('');
    
    const [mostrarModalConfirma, setMostrarModalConfirma] = useState(false);
    const [jaApurada, setJaApurada] = useState(false);

    useEffect(() => {
        api.get(`/campanhas/${campanhaId}`)
            .then(res => {
                setCampanha(res.data);
                const opcoesEncontradas = res.data.campanhaOpcoes || res.data.opcoes || res.data.CampanhaOpcoes || [];
                setOpcoes(opcoesEncontradas);

                // --- Lógica de Bloqueio: Verifica se já existe um vencedor ---
                const resultadoExistente = opcoesEncontradas.find((op: any) => op.eh_resultado_final === true);
                if (resultadoExistente) {
                    setJaApurada(true);
                    setOpcaoVencedora(String(resultadoExistente.id));
                }
            })
            .catch(err => {
                console.error("Erro ao buscar campanha:", err);
                toast.error('Erro ao carregar os dados da campanha.');
                navigate('/');
            })
            .finally(() => setCarregando(false));
    }, [campanhaId, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (jaApurada) return; // Segurança extra
        if (!opcaoVencedora) {
            toast.error('Selecione uma opção vencedora!');
            return;
        }
        setMostrarModalConfirma(true);
    };

    const confirmarApuracao = async () => {
        setMostrarModalConfirma(false);
        setSalvando(true);
        
        try {
            await api.patch(`/campanhas/${campanhaId}/resultado`, {
                opcao_vencedora_id: Number(opcaoVencedora)
            });
            
            toast.success('Resultado apurado com sucesso!');
            setJaApurada(true); // Bloqueia a UI após o sucesso
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao definir o resultado.');
        } finally {
            setSalvando(false);
        }
    };

    if (carregando) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ color: '#4b5563', marginTop: '20px' }}>Carregando...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '10px', color: '#111827', textAlign: 'center' }}>🏆 Apurar Resultado</h1>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px' }}>
                Definindo o vencedor para: <strong style={{ color: '#1f2937' }}>{campanha?.nome}</strong>
            </p>

            <div className="card" style={{ padding: '30px 40px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4b5563', fontSize: '0.95rem' }}>
                            Selecione o Palpite Vencedor
                        </label>
                        
                        {opcoes.length === 0 ? (
                            <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px' }}>
                                Nenhuma opção cadastrada.
                            </div>
                        ) : (
                            <Select 
                                placeholder={jaApurada ? "Campanha já apurada" : "-- Escolha a opção correta --"}
                                isDisabled={salvando || jaApurada} // <--- BLOQUEADO SE JÁ APURADA
                                options={opcoes.map(opcao => ({
                                    value: String(opcao.id),
                                    label: opcao.descricao
                                }))}
                                value={
                                    opcaoVencedora 
                                    ? { value: opcaoVencedora, label: opcoes.find(o => String(o.id) === opcaoVencedora)?.descricao } 
                                    : null
                                }
                                onChange={(selecionado: any) => {
                                    setOpcaoVencedora(selecionado ? selecionado.value : '');
                                }}
                                maxMenuHeight={160} 
                                styles={{ 
                                    control: (base) => ({ ...base, cursor: jaApurada ? 'not-allowed' : 'pointer', padding: '4px' }),
                                    option: (base) => ({ ...base, cursor: jaApurada ? 'not-allowed' : 'pointer' })
                                }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <button 
                            type="button" 
                            className="btn" 
                            onClick={() => navigate('/')}
                            style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                            disabled={salvando}
                        >
                            {jaApurada ? 'Voltar' : 'Cancelar'}
                        </button>
                        
                        <button 
                            type="submit" 
                            className="btn" 
                            style={{ 
                                flex: 2, 
                                backgroundColor: (!opcaoVencedora || salvando || jaApurada) ? '#d1d5db' : '#f59e0b', 
                                color: (!opcaoVencedora || salvando || jaApurada) ? '#9ca3af' : 'white', 
                                padding: '14px', 
                                fontWeight: 'bold',
                                cursor: (!opcaoVencedora || salvando || jaApurada) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            disabled={!opcaoVencedora || salvando || jaApurada} // <--- BLOQUEADO SE JÁ APURADA
                        >
                            {jaApurada ? 'Já Apurado' : (salvando ? 'Processando...' : 'Confirmar e Salvar')}
                        </button>
                    </div>
                </form>
            </div>

            {/* MODAL */}
            {mostrarModalConfirma && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div className="card" style={{ padding: '30px', maxWidth: '420px', width: '90%', textAlign: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>⚠️</div>
                        <h2 style={{ color: '#111827', marginBottom: '15px' }}>Confirmar Apuração?</h2>
                        <p style={{ color: '#4b5563', marginBottom: '25px', lineHeight: '1.5' }}>
                            Esta ação é <strong>irreversível</strong>. A campanha será fechada e os resultados gravados permanentemente.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setMostrarModalConfirma(false)} className="btn" style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '12px', fontWeight: 'bold' }}>Voltar</button>
                            <button onClick={confirmarApuracao} className="btn" style={{ flex: 1, backgroundColor: '#f59e0b', color: 'white', padding: '12px', fontWeight: 'bold' }}>Sim, Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}