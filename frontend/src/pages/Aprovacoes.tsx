import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Aprovacoes() {
    const [pendentes, setPendentes] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        carregarPendentes();
    }, []);

    const carregarPendentes = () => {
        const token = localStorage.getItem('token');
        api.get('/apostas/pendentes', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setPendentes(res.data))
            .catch(() => toast.error('Erro ao buscar aprovações pendentes.'))
            .finally(() => setCarregando(false));
    };

    const alterarStatus = async (id: number, novoStatus: 'APROVADO' | 'CANCELADO') => {
        const token = localStorage.getItem('token');
        try {
            await api.patch(`/apostas/${id}/status`, { status: novoStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Aposta ${novoStatus.toLowerCase()} com sucesso!`);
            // Remove o item da tela sem precisar recarregar
            setPendentes(pendentes.filter(aposta => aposta.id !== id));
        } catch (error) {
            toast.error('Erro ao processar aposta.');
        }
    };

    const formatarDinheiro = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    // 🎨 NOVO LOADING PADRONIZADO
    if (carregando) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ color: '#4b5563', marginTop: '20px' }}>Buscando aprovações pendentes...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '10px', color: '#0f172a', textAlign: 'center' }}>Fila de Aprovações</h1>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>
                Valide os pagamentos antes de liberar as apostas para o sorteio.
            </p>

            {pendentes.length === 0 ? (
                <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✅</div>
                    <h3 style={{ color: '#1e293b' }}>Tudo limpo!</h3>
                    <p style={{ color: '#64748b' }}>Não há nenhuma aposta pendente de validação financeira.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {pendentes.map(aposta => (
                        <div key={aposta.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', borderLeft: '6px solid #f59e0b' }}>
                            
                            <div style={{ flex: '1 1 300px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
                                    {aposta.campanha_opcao?.campanha?.nome}
                                </div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>{aposta.usuario?.nome}</h3>
                                <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#475569' }}>
                                    <span><strong>Palpite:</strong> {aposta.campanha_opcao?.descricao}</span>
                                    <span><strong>Valor:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>{formatarDinheiro(aposta.campanha_opcao?.campanha?.valor_bolao || 0)}</span></span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '5px' }}>
                                    <strong>Pagamento:</strong> {aposta.meio_pagamento?.descricao}
                                </div>
                            </div>

                            <div style={{ flex: '1 1 200px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Comprovante Anexado:</div>
                                {aposta.comprovante ? (
                                    <a href={aposta.comprovante} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none', wordBreak: 'break-all' }}>
                                        🔗 Visualizar Comprovante
                                    </a>
                                ) : (
                                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Nenhum link enviado</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => alterarStatus(aposta.id, 'CANCELADO')}
                                    style={{ padding: '10px 20px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                >
                                    Rejeitar
                                </button>
                                <button 
                                    onClick={() => alterarStatus(aposta.id, 'APROVADO')}
                                    style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 6px -1px rgba(16,185,129,0.3)' }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                                >
                                    Aprovar Pagamento
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}