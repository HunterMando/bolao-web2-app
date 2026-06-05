import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function MeusBoloes() {
    const navigate = useNavigate();
    const [carregando, setCarregando] = useState(true);
    const [apostas, setApostas] = useState<any[]>([]);

    useEffect(() => {
        api.get('/apostas/minhas')
            .then(res => setApostas(res.data))
            .catch(error => {
                console.error("🔥 Erro ao buscar apostas:", error);
                toast.error('Não foi possível carregar o seu histórico.');
            })
            .finally(() => setCarregando(false));
    }, []);

    const formatarDinheiro = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDENTE': return { bg: '#fef3c7', text: '#d97706' };
            case 'APROVADO': return { bg: '#d1fae5', text: '#059669' };
            case 'VENCEDOR': return { bg: '#dcfce7', text: '#15803d' };
            case 'PERDEDOR': return { bg: '#fee2e2', text: '#dc2626' };
            default: return { bg: '#e5e7eb', text: '#374151' };
        }
    };

    if (carregando) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ color: '#4b5563', marginTop: '20px' }}>Carregando seus bilhetes...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px', color: '#111827', textAlign: 'center' }}>Meus Bolões</h1>
            
            {/* VALIDAÇÃO DE ESTADO VAZIO BLINDADA */}
            {!apostas || apostas.length === 0 ? (
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '50px 20px', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
                    textAlign: 'center' 
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎟️</div>
                    <h3 style={{ color: '#374151', marginBottom: '10px', fontSize: '1.2rem' }}>
                        Nenhum bolão encontrado
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                        Você ainda não participou de nenhuma campanha. Que tal dar o seu primeiro palpite?
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        style={{ 
                            backgroundColor: '#3b82f6', color: 'white', padding: '10px 20px', 
                            borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                        Ver Campanhas Disponíveis
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {apostas.map((aposta) => {
                        const statusVisual = getStatusStyle(aposta.status);
                        return (
                            <div key={aposta.id} className="card card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', color: '#1f2937', marginBottom: '8px' }}>
                                        {aposta.campanha_opcao?.campanha?.nome || 'Campanha Desconhecida'}
                                    </h3>
                                    <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                                        <strong>Seu Palpite:</strong> {aposta.campanha_opcao?.descricao || 'N/A'}
                                    </p>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ 
                                        backgroundColor: statusVisual.bg, 
                                        color: statusVisual.text, 
                                        padding: '4px 12px', 
                                        borderRadius: '16px', 
                                        fontWeight: 'bold',
                                        fontSize: '0.80rem',
                                        display: 'inline-block'
                                    }}>
                                        {aposta.status}
                                    </div>
                                    
                                    {aposta.status === 'VENCEDOR' && aposta.valor_premio > 0 && (
                                        <div style={{ color: '#059669', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '6px' }}>
                                            Ganhou: {formatarDinheiro(aposta.valor_premio)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}