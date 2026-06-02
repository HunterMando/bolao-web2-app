import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Campanha {
    id: number;
    nome: string;
    dt_inicio: string;
    dt_fim: string;
    valor_bolao: number;
    status: boolean;
}

export default function Campanhas() {
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const navigate = useNavigate();

    // 1. Lemos quem é o utilizador para saber se ele é ADMIN
    const usuarioString = localStorage.getItem('usuario');
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;
    const isAdmin = usuario?.tipo_usuario === 'ADMIN';

    useEffect(() => {
        carregarCampanhas();
    }, []);

    const carregarCampanhas = () => {
        api.get('/campanhas')
           .then(res => setCampanhas(res.data))
           .catch(() => toast.error('Falha ao carregar campanhas.'))
           .finally(() => setCarregando(false));
    };

    // 2. Função que dispara a nossa nova rota do Back-end
    const handleEncerrar = async (id: number) => {
        if (!window.confirm('Tem a certeza que deseja encerrar esta campanha? Ninguém mais poderá apostar.')) return;

        try {
            await api.patch(`/campanhas/${id}/encerrar`);
            toast.success('Campanha encerrada com sucesso!');
            carregarCampanhas(); // Recarrega a lista para atualizar a cor da etiqueta
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao encerrar.');
        }
    };

    if (carregando) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ color: '#4b5563', marginTop: '20px' }}>Buscando campanhas disponíveis...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '0 40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px', color: '#111827' }}>Campanhas Disponíveis</h1>
            
            {campanhas.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Nenhuma campanha ativa no momento.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {campanhas.map((campanha) => (
                        <div key={campanha.id} className="card card-hover" style={{ width: '100%', margin: 0, padding: '24px' }}>
                            <h3 style={{ marginBottom: '12px', color: '#1f2937' }}>{campanha.nome}</h3>
                            
                            <div style={{ marginBottom: '20px', color: '#4b5563', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <p>💰 <strong>Valor da Aposta:</strong> R$ {campanha.valor_bolao.toFixed(2)}</p>
                                <p>📅 <strong>Fim:</strong> {new Date(campanha.dt_fim).toLocaleDateString('pt-BR')}</p>
                                <p>
                                    <span style={{ 
                                        display: 'inline-block', padding: '4px 8px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold',
                                        backgroundColor: campanha.status ? '#dcfce3' : '#fee2e2',
                                        color: campanha.status ? '#166534' : '#991b1b'
                                    }}>
                                        {campanha.status ? '🟢 ABERTA' : '🔴 ENCERRADA'}
                                    </span>
                                </p>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    className="btn btn-primary"
                                    disabled={!campanha.status}
                                    onClick={() => navigate(`/apostar/${campanha.id}`)}
                                    style={{ flex: 1, opacity: campanha.status ? 1 : 0.5, cursor: campanha.status ? 'pointer' : 'not-allowed' }}
                                >
                                    Fazer Aposta
                                </button>

                                {/* 3. BOTÃO DE ADMIN: Só aparece se for ADMIN e a campanha estiver aberta */}
                                {isAdmin && campanha.status && (
                                    <button 
                                        className="btn"
                                        onClick={() => handleEncerrar(campanha.id)}
                                        style={{ backgroundColor: '#dc3545', color: 'white', padding: '12px 15px' }}
                                        title="Encerrar Campanha"
                                    >
                                        🔒 Encerrar
                                    </button>
                                )}

                                {/* Só aparece se for ADMIN e se a campanha estiver ENCERRADA */}
                                {isAdmin && !campanha.status && (
                                    <button 
                                        className="btn"
                                        onClick={() => navigate(`/resultado/${campanha.id}`)}
                                        style={{ backgroundColor: '#f59e0b', color: 'white', padding: '12px 15px' }}
                                        title="Definir Vencedor"
                                    >
                                        🏆 Vencedor
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}