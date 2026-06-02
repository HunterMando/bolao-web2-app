import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Select from 'react-select';
import api from '../services/api';

export default function ResultadoCampanha() {
    const { campanhaId } = useParams();
    const navigate = useNavigate();
    const [opcoes, setOpcoes] = useState<any[]>([]);
    const [vencedorId, setVencedorId] = useState('');

    useEffect(() => {
        // Busca os palpites possíveis para esta campanha
        api.get(`/campanhas-opcoes/campanha/${campanhaId}`)
           .then(res => setOpcoes(res.data))
           .catch(() => toast.error('Erro ao carregar opções.'));
    }, [campanhaId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vencedorId) return toast.error('Selecione uma opção vencedora!');

        try {
            await api.post(`/campanhas/${campanhaId}/resultado`, { opcao_vencedora_id: Number(vencedorId) });
            toast.success('🏆 Resultados processados com sucesso!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.erro || 'Erro ao definir vencedor.');
        }
    };

    const opcoesSelect = opcoes.map(op => ({ value: op.id, label: op.descricao }));

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 20px' }}>
            <div className="card">
                <h2 className="titulo">Definir Vencedor 🏆</h2>
                <p style={{ textAlign: 'center', color: '#4b5563', marginBottom: '20px' }}>
                    Qual foi o resultado oficial deste evento? Ao confirmar, todos os bilhetes serão calculados automaticamente.
                </p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Palpite Vencedor</label>
                        <Select 
                            options={opcoesSelect}
                            placeholder="Selecione quem ganhou..."
                            onChange={(opcaoSelecionada: any) => setVencedorId(opcaoSelecionada.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, backgroundColor: '#10b981' }}>
                            Confirmar Vencedor
                        </button>
                        <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151' }} onClick={() => navigate('/')}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}