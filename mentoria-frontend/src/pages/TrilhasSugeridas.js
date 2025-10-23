import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/trilhas.css';
import { toast } from 'react-toastify';

export default function TrilhasSugeridas() {
  const navigate = useNavigate();
  const alunoId = localStorage.getItem('alunoId');
  const nomeAluno = localStorage.getItem('nomeAluno') || 'Aluno';
  const [trilhas, setTrilhas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarTrilhas = async () => {
      if (!alunoId) {
        toast.error('ID do aluno não encontrado. Faça login novamente.');
        setCarregando(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:3001/api/aluno/trilhas/sugeridas/${alunoId}`);
        if (res.data.trilhas?.length) {
          setTrilhas(res.data.trilhas);
        } else {
          toast.info('Nenhuma trilha atribuída encontrada.');
        }
      } catch (err) {
        toast.error('Erro ao buscar trilhas atribuídas.');
        console.error('❌ Erro ao buscar trilhas:', err);
      } finally {
        setCarregando(false);
      }
    };

    buscarTrilhas();
  }, [alunoId]);

  const removerTrilha = async (trilhaId) => {
    try {
      const res = await axios.delete('http://localhost:3001/api/aluno/trilhas/remover', {
        data: { alunoId, trilhaId }
      });

      if (res.data.success) {
        toast.success('Trilha removida com sucesso!');
        setTrilhas((prev) => prev.filter((t) => t.trilha_id !== trilhaId));
      } else {
        toast.error('Erro ao remover trilha.');
      }
    } catch (err) {
      toast.error('Erro ao remover trilha.');
      console.error('❌ Erro ao remover trilha:', err);
    }
  };

  return (
    <div className="trilhas-page">
      <div className="trilhas-container">
        <h1>🚀 Trilhas Atribuídas</h1>
        <p className="motivacao">
          Olá, <strong>{nomeAluno}</strong>! Estas trilhas foram escolhidas especialmente para você. Explore seu potencial! 🌟
        </p>

        {carregando ? (
          <p>Carregando trilhas...</p>
        ) : trilhas.length > 0 ? (
          <div className="trilhas-lista">
            {trilhas.map((trilha) => (
              <div key={trilha.trilha_id} className="trilha-card">
                <h3>📘 {trilha.titulo}</h3>
                <p>{trilha.descricao || 'Sem descrição disponível.'}</p>

                {trilha.score_adequacao !== undefined && (
                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{ width: `${trilha.score_adequacao}%` }}
                    ></div>
                  </div>
                )}

                <button
                  className="detalhes-button"
                  onClick={() => navigate(`/trilha/${trilha.trilha_id}`)}
                >
                  📖 Ver detalhes
                </button>

                <button
                  className="remover-button"
                  onClick={() => removerTrilha(trilha.trilha_id)}
                >
                  🗑️ Remover trilha
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma trilha disponível no momento.</p>
        )}

        <button className="section-button" onClick={() => navigate('/inicio')}>
          ⬅ Voltar para o Perfil
        </button>
      </div>
    </div>
  );
}
