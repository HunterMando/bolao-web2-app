import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

interface CampanhaOpcao {
    id: number;
    descricao: string;
    eh_resultado_final: boolean;
}

interface Campanha {
    id: number;
    nome: string;
    dt_inicio: string;
    dt_fim: string;
    valor_bolao: number;
    status: boolean;
    opcoes?: CampanhaOpcao[]; // 👈 Nova tipagem recebendo as opções do backend
}

export default function Campanhas() {
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [campanhaParaEncerrar, setCampanhaParaEncerrar] = useState<number | null>(null);
    
    // 👈 NOVO: Agora temos 3 ABAS!
    const [abaAtiva, setAbaAtiva] = useState<'ATIVAS' | 'ENCERRADAS' | 'APURADAS'>('ATIVAS');
    
    const navigate = useNavigate();

    const usuarioString = localStorage.getItem('usuario');
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;
    const isAdmin = usuario?.tipo_usuario?.toUpperCase() === 'ADMIN';

    useEffect(() => {
        carregarCampanhas();
    }, []);

    const carregarCampanhas = () => {
        let token = localStorage.getItem('token'); 
        if (!token && usuarioString) {
            try { token = JSON.parse(usuarioString).token || null; } catch (e) {}
        }

        api.get('/campanhas', {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
           .then(res => setCampanhas(res.data))
           .catch(() => toast.error('Falha ao carregar campanhas.'))
           .finally(() => setCarregando(false));
    };

    const handleEncerrar = (id: number) => {
        setCampanhaParaEncerrar(id);
    };

    const confirmarEncerramento = async () => {
        if (!campanhaParaEncerrar) return;

        try {
            await api.patch(`/campanhas/${campanhaParaEncerrar}/encerrar`);
            toast.success('Campanha encerrada com sucesso!');
            setCampanhaParaEncerrar(null);
            carregarCampanhas(); 
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao encerrar.');
            setCampanhaParaEncerrar(null);
        }
    };

    const formatarDinheiro = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    // 🧠 HELPER: Verifica se a campanha já tem um vencedor definido
    const verificarSeApurada = (campanha: Campanha) => {
        return campanha.opcoes?.some(opcao => opcao.eh_resultado_final === true) || false;
    };

    // 🧠 O NOVO FILTRO DE 3 ESTÁGIOS
    const campanhasFiltradas = campanhas.filter(campanha => {
        if (isAdmin) {
            if (abaAtiva === 'ATIVAS') return campanha.status === true;
            // Aba "Aguardando Apuração": Status falso, mas ainda não tem vencedor
            if (abaAtiva === 'ENCERRADAS') return campanha.status === false && !verificarSeApurada(campanha);
            // Aba "Finalizadas": Status falso e já tem vencedor
            if (abaAtiva === 'APURADAS') return campanha.status === false && verificarSeApurada(campanha);
        }
        return campanha.status === true; // Apostador comum só vê as abertas globais
    });

    if (carregando) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ color: '#4b5563', marginTop: '20px' }}>Buscando campanhas...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: isAdmin ? '20px' : '40px', color: '#111827', textAlign: 'center' }}>
                Campanhas Disponíveis
            </h1>

            {/* 👇 SISTEMA DE 3 ABAS (Exclusivo para o Admin) 👇 */}
            {isAdmin && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setAbaAtiva('ATIVAS')}
                        style={{
                            padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                            backgroundColor: abaAtiva === 'ATIVAS' ? '#3b82f6' : '#e5e7eb',
                            color: abaAtiva === 'ATIVAS' ? 'white' : '#4b5563',
                            transition: 'all 0.3s ease',
                            boxShadow: abaAtiva === 'ATIVAS' ? '0 4px 6px -1px rgba(59, 130, 246, 0.4)' : 'none'
                        }}
                    >
                        🟢 Ativas
                    </button>
                    <button
                        onClick={() => setAbaAtiva('ENCERRADAS')}
                        style={{
                            padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                            backgroundColor: abaAtiva === 'ENCERRADAS' ? '#ef4444' : '#e5e7eb',
                            color: abaAtiva === 'ENCERRADAS' ? 'white' : '#4b5563',
                            transition: 'all 0.3s ease',
                            boxShadow: abaAtiva === 'ENCERRADAS' ? '0 4px 6px -1px rgba(239, 68, 68, 0.4)' : 'none'
                        }}
                    >
                        🔴 Aguardando Apuração
                    </button>
                    <button
                        onClick={() => setAbaAtiva('APURADAS')}
                        style={{
                            padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                            backgroundColor: abaAtiva === 'APURADAS' ? '#f59e0b' : '#e5e7eb',
                            color: abaAtiva === 'APURADAS' ? 'white' : '#4b5563',
                            transition: 'all 0.3s ease',
                            boxShadow: abaAtiva === 'APURADAS' ? '0 4px 6px -1px rgba(245, 158, 11, 0.4)' : 'none'
                        }}
                    >
                        🏆 Finalizadas (Apuradas)
                    </button>
                </div>
            )}
            
            {/* ESTADO VAZIO DINÂMICO DE 3 ESTÁGIOS */}
            {campanhasFiltradas.length === 0 ? (
                <div style={{ 
                    backgroundColor: 'white', padding: '60px 20px', borderRadius: '16px', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '600px', margin: '0 auto' 
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                        {abaAtiva === 'ATIVAS' ? '🏟️' : abaAtiva === 'ENCERRADAS' ? '⏳' : '🗄️'}
                    </div>
                    <h3 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '1.5rem' }}>
                        {abaAtiva === 'ATIVAS' ? 'Nenhuma campanha ativa no momento' : 
                         abaAtiva === 'ENCERRADAS' ? 'Nenhuma campanha aguardando apuração' : 
                         'Nenhuma campanha finalizada'}
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '1.1rem' }}>
                        {!isAdmin 
                            ? 'Aguarde até que um administrador crie uma nova campanha para você dar o seu palpite!' 
                            : (abaAtiva === 'ATIVAS' 
                                ? 'Você não tem nenhuma campanha a decorrer. Que tal criar uma agora?' 
                                : abaAtiva === 'ENCERRADAS'
                                ? 'Ótimo! Você não tem pendências de pagamento com os apostadores.'
                                : 'Você ainda não apurou o resultado de nenhuma campanha.')}
                    </p>
                    
                    {isAdmin && abaAtiva === 'ATIVAS' && (
                        <button 
                            onClick={() => navigate('/nova-campanha')}
                            style={{ 
                                backgroundColor: '#10b981', color: 'white', padding: '12px 24px', 
                                borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem',
                                cursor: 'pointer', transition: 'background-color 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)'
                            }}
                        >
                            + Criar Nova Campanha
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                    {campanhasFiltradas.map((campanha) => {
                        const isApurada = verificarSeApurada(campanha);
                        const opcaoVencedora = campanha.opcoes?.find(o => o.eh_resultado_final);

                        // 🎨 DESIGN DINÂMICO DAS ETIQUETAS
                        let corTexto = '#166534';
                        let corFundo = '#dcfce7';
                        let textoEtiqueta = '🟢 ABERTA';

                        if (!campanha.status) {
                            if (isApurada) {
                                corTexto = '#b45309'; corFundo = '#fef3c7'; textoEtiqueta = '🏆 APURADA';
                            } else {
                                corTexto = '#991b1b'; corFundo = '#fee2e2'; textoEtiqueta = '🔴 ENCERRADA';
                            }
                        }

                        return (
                            <div key={campanha.id} className="card card-hover" style={{ 
                                width: '100%', margin: 0, padding: '0', overflow: 'hidden', 
                                borderRadius: '16px', border: '1px solid #f3f4f6', backgroundColor: 'white' 
                            }}>
                                <div style={{ backgroundColor: '#f8fafc', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
                                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {campanha.nome}
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px',
                                            backgroundColor: corFundo, color: corTexto
                                        }}>
                                            {textoEtiqueta}
                                        </span>
                                    </h3>
                                </div>
                                
                                <div style={{ padding: '24px' }}>
                                    <div style={{ marginBottom: '24px', color: '#475569', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '1.2rem' }}>💰</span> 
                                            <span><strong>Aposta:</strong> <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatarDinheiro(campanha.valor_bolao)}</span></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '1.2rem' }}>📅</span> 
                                            <span><strong>Fim:</strong> {new Date(campanha.dt_fim).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                                        {/* Botões do Apostador */}
                                        {!isAdmin && (
                                            <button 
                                                className="btn"
                                                disabled={!campanha.status}
                                                onClick={() => navigate(`/apostar/${campanha.id}`)}
                                                style={{ 
                                                    padding: '12px', fontWeight: 'bold', borderRadius: '8px',
                                                    backgroundColor: campanha.status ? '#3b82f6' : '#d1d5db',
                                                    color: campanha.status ? 'white' : '#6b7280',
                                                    cursor: campanha.status ? 'pointer' : 'not-allowed', border: 'none'
                                                }}
                                            >
                                                Fazer Aposta
                                            </button>
                                        )}

                                        {/* Botão Admin 1: Encerrar Antecipadamente */}
                                        {isAdmin && campanha.status && (
                                            <button 
                                                className="btn"
                                                onClick={() => handleEncerrar(campanha.id)}
                                                style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                            >
                                                🔒 Encerrar Manualmente
                                            </button>
                                        )}

                                        {/* Botão Admin 2: Definir Vencedor (Apenas na aba Aguardando Apuração) */}
                                        {isAdmin && !campanha.status && !isApurada && (
                                            <button 
                                                className="btn"
                                                onClick={() => navigate(`/resultado/${campanha.id}`)}
                                                style={{ backgroundColor: '#f59e0b', color: 'white', padding: '12px', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', animation: 'pulse 2s infinite' }}
                                            >
                                                🏆 Definir Vencedor
                                            </button>
                                        )}

                                        {/* Visualização Admin 3: Resultado já definido (Aba Finalizadas) */}
                                        {isAdmin && isApurada && (
                                            <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', textAlign: 'center', color: '#b45309', fontWeight: 'bold', border: '1px solid #fde68a' }}>
                                                Vencedor: {opcaoVencedora?.descricao || 'Desconhecido'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO (Inalterado) */}
            {campanhaParaEncerrar && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div className="card" style={{ padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'fadeIn 0.2s ease-out', borderRadius: '16px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
                        <h2 style={{ color: '#0f172a', marginBottom: '15px' }}>Encerrar Campanha?</h2>
                        <p style={{ color: '#475569', marginBottom: '25px', lineHeight: '1.5' }}>
                            Tem certeza de que deseja encerrar esta campanha antecipadamente? Ninguém mais poderá apostar.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                onClick={() => setCampanhaParaEncerrar(null)}
                                className="btn" 
                                style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', padding: '12px', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmarEncerramento}
                                className="btn" 
                                style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', padding: '12px', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                            >
                                Sim, Encerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}