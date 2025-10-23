// /src/pages/TrilhasSugeridas.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/trilhas.css';
import { toast } from 'react-toastify';

export default function TrilhasSugeridas() {
  const navigate = useNavigate();
  const alunoId = localStorage.getItem('alunoId');
  const [trilhas, setTrilhas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarTrilhas = async () => {
      try {
        const res = await axios.post('http://localhost:3001/trilhas/sugeridas', {
          alunoId
        });

        if (res.data.trilhas?.length) {
          setTrilhas(res.data.trilhas);
        } else {
          toast.info('Nenhuma trilha sugerida encontrada para seu perfil.');
        }
      } catch (err) {
        toast.error('Erro ao buscar trilhas sugeridas.');
        console.error('❌ Erro ao buscar trilhas:', err);
      } finally {
        setCarregando(false);
      }
    };

    buscarTrilhas();
  }, [alunoId]);

  return (
    <div className="trilhas-page">
      <div className="trilhas-container">
        <h1>🚀 Trilhas Sugeridas</h1>
        <p>Com base no seu perfil vocacional, recomendamos as seguintes trilhas:</p>

        {carregando ? (
          <p>Carregando trilhas...</p>
        ) : trilhas.length > 0 ? (
          <div className="trilhas-lista">
            {trilhas.map((trilha) => (
              <div key={trilha.trilha_id} className="trilha-card">
                <h3>{trilha.titulo}</h3>
                <p>{trilha.descricao}</p>
                {/* <button onClick={() => atribuirTrilha(trilha.trilha_id)}>
                  Atribuir Trilha
                </button> */}
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
