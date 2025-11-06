import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/trilhas.css';
import { toast } from 'react-toastify';

export default function TrilhasSugeridas() {
  const navigate = useNavigate();
  const alunoId = localStorage.getItem('alunoId');
  const nomeAluno = localStorage.getItem('nomeAluno') || 'Aluno';

  const [trilhasAtribuidas, setTrilhasAtribuidas] = useState([]);
  const [trilhasGerais, setTrilhasGerais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('atribuidas'); // 'atribuidas' ou 'gerais'

  useEffect(() => {
    const buscarTrilhas = async () => {
      if (!alunoId) {
        toast.error('ID do aluno não encontrado. Faça login novamente.');
        setCarregando(false);
        return;
      }

      try {
        const [resAtribuidas, resGerais] = await Promise.all([
          axios.get(`http://localhost:3001/api/aluno/trilhas/sugeridas/${alunoId}`),
          axios.get(`http://localhost:3001/api/aluno/trilhas/todas`)
        ]);

        setTrilhasAtribuidas(resAtribuidas.data.trilhas || []);
        setTrilhasGerais(resGerais.data.trilhas || []);
      } catch (err) {
        toast.error('Erro ao buscar trilhas.');
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
        // setTrilhasAtribuidas((prev) => prev.filter((t) => t.trilha_id !== trilhaId));
        const atualizadas = await axios.get(`http://localhost:3001/api/aluno/trilhas/sugeridas/${alunoId}`);
        setTrilhasAtribuidas(atualizadas.data.trilhas || []);

      } else {
        toast.error('Erro ao remover trilha.');
      }
    } catch (err) {
      toast.error('Erro ao remover trilha.');
      console.error('❌ Erro ao remover trilha:', err);
    }
  };

  const adicionarTrilha = async (trilhaId) => {
    try {
      const res = await axios.post('http://localhost:3001/api/aluno/trilhas/atribuir', {
        alunoId,
        trilhaId
      });

      if (res.data.success) {
        toast.success('Trilha adicionada ao seu perfil!');
        setTrilhasAtribuidas((prev) => [...prev, res.data.trilha]);
      } else {
        toast.info('Essa trilha já está atribuída.');
      }
    } catch (err) {
      toast.error('Erro ao adicionar trilha.');
      console.error('❌ Erro ao adicionar trilha:', err);
    }
  };

  const trilhasAtuais = abaAtiva === 'atribuidas' ? trilhasAtribuidas : trilhasGerais;

  return (
      <div className="trilhas-container">
        <h1>🚀 Trilhas de Aprendizagem</h1>
        <p className="motivacao">
          Olá, <strong>{nomeAluno}</strong>! Explore trilhas atribuídas ou descubra novas oportunidades abaixo. 🌟
        </p>

        <div className="abas-trilhas">
          <button
            className={abaAtiva === 'atribuidas' ? 'aba-ativa' : ''}
            onClick={() => setAbaAtiva('atribuidas')}
          >
            Minhas Trilhas
          </button>
          <button
            className={abaAtiva === 'gerais' ? 'aba-ativa' : ''}
            onClick={() => setAbaAtiva('gerais')}
          >
            Explorar Trilhas
          </button>
        </div>

        {carregando ? (
          <p>Carregando trilhas...</p>
        ) : trilhasAtuais.length > 0 ? (
          <div className="trilhas-lista">
            {trilhasAtuais.map((trilha) => (
              <div key={trilha.trilha_id} className="trilha-card">
                <h3>📘 {trilha.titulo}</h3>
                <p>{trilha.descricao || 'Sem descrição disponível.'}</p>

                {trilha.score_adequacao !== undefined && abaAtiva === 'atribuidas' && (
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

                {abaAtiva === 'atribuidas' ? (
                  <button
                    className="remover-button"
                    onClick={() => removerTrilha(trilha.trilha_id)}
                  >
                    🗑️ Remover trilha
                  </button>
                ) : (
                  <button
                    className="adicionar-button"
                    onClick={() => adicionarTrilha(trilha.trilha_id)}
                  >
                    ➕ Adicionar ao meu perfil
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : abaAtiva === 'atribuidas' ? (
          <p>Nenhuma trilha atribuída pelo gestor no momento.</p>
        ) : null}

        <button className="section-button" onClick={() => navigate('/inicio')}>
          ⬅ Voltar para o Perfil
        </button>
      </div>
  );
}
