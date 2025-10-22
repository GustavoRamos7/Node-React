// src/pages/TrilhasSugeridas.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/trilhas.css';

export default function TrilhasSugeridas() {
  const alunoId = localStorage.getItem('alunoId');
  const [trilhas, setTrilhas] = useState([]);

  useEffect(() => {
    const buscarTrilhas = async () => {
      try {
        const res = await axios.post('http://localhost:3001/trilhas/sugeridas', {
          alunoId
        });

        if (res.data.trilhas?.length) {
          setTrilhas(res.data.trilhas);
        } else {
          toast.info('Nenhuma trilha sugerida encontrada.');
        }
      } catch (err) {
        toast.error('Erro ao buscar trilhas.');
        console.error(err);
      }
    };

    buscarTrilhas();
  }, [alunoId]);

  const atribuirTrilha = async (trilhaId) => {
    try {
      const res = await axios.post('http://localhost:3001/trilhas/atribuir', {
        alunoId,
        trilhaId
      });
      toast.success(`Trilha atribuída com sucesso! Score: ${res.data.score}`);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.info('Essa trilha já foi atribuída.');
      } else {
        toast.error('Erro ao atribuir trilha.');
      }
    }
  };

  return (
    <div className="trilhas-section">
      <h2>🚀 Trilhas Sugeridas para Você</h2>
      {trilhas.map(trilha => (
        <div key={trilha.trilha_id} className="trilha-card">
          <h4>{trilha.titulo}</h4>
          <p>{trilha.descricao}</p>
          <button onClick={() => atribuirTrilha(trilha.trilha_id)}>
            Atribuir Trilha
          </button>
        </div>
      ))}
    </div>
  );
}
