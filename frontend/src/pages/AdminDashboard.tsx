import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ 
        totalCampanhas: 0, 
        totalApostas: 0, 
        campanhasAtivas: 0,
        totalArrecadado: 0 
    });
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        // 🕵️ Busca o token para enviar na requisição (Para isolar os dados)
        let token = localStorage.getItem('token'); 
        if (!token) {
            const usuarioString = localStorage.getItem('usuario');
            if (usuarioString) {
                try { token = JSON.parse(usuarioString).token || null; } catch (e) {}
            }
        }

        // 👈 ENVIO DO TOKEN É OBRIGATÓRIO AQUI
        api.get('/dashboard/stats', {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(res => setStats(res.data))
            .catch(() => toast.error('Erro ao carregar estatísticas.'))
            .finally(() => setCarregando(false));
    }, []);

    const formatarDinheiro = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    if (carregando) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ color: '#4b5563', marginTop: '20px' }}>Carregando métricas...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const cardStyle = {
        padding: '30px', backgroundColor: 'white', borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center' as const
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px', color: '#111827' }}>Painel Administrativo</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={cardStyle}>
                    <h3 style={{ color: '#6b7280' }}>Total Arrecadado</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2563eb' }}>{formatarDinheiro(stats.totalArrecadado)}</p>
                </div>
                <div style={cardStyle}>
                    <h3 style={{ color: '#6b7280' }}>Minhas Campanhas</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.totalCampanhas}</p>
                </div>
                <div style={cardStyle}>
                    <h3 style={{ color: '#6b7280' }}>Apostas Recebidas</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.totalApostas}</p>
                </div>
            </div>
        </div>
    );
}