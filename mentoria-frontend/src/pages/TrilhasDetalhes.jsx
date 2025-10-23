import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/trilhaDetalhes.css';
import { toast } from 'react-toastify';

export default function TrilhaDetalhes() {
  const { trilhaId } = useParams();
  const navigate = useNavigate();
  const [trilha, setTrilha] = useState(null);
  const [conteudoIA, setConteudoIA] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoConteudo, setGerandoConteudo] = useState(false);

  useEffect(() => {
    const buscarDetalhes = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/aluno/trilha/${trilhaId}`);
        setTrilha(res.data.trilha);
      } catch (err) {
        toast.error('Erro ao carregar detalhes da trilha.');
        console.error(err);
      } finally {
        setCarregando(false);
      }
    };

    buscarDetalhes();
  }, [trilhaId]);

  useEffect(() => {
    const buscarConteudoIA = async () => {
      setGerandoConteudo(true); // começa carregamento
  
      try {
        const res = await axios.get(`http://localhost:3001/api/aluno/trilha/${trilhaId}/conteudo-sugerido`);
        setConteudoIA(res.data.conteudo || []);
      } catch (err) {
        console.error('Erro ao buscar conteúdo sugerido da IA:', err);
      } finally {
        setGerandoConteudo(false); // termina carregamento
      }
    };
  
    if (trilhaId) buscarConteudoIA();
  }, [trilhaId]);
  

  return (
    <div className="trilha-detalhes-page">
      <div className="trilha-detalhes-container">
        <button className="voltar-button" onClick={() => navigate(-1)}>⬅ Voltar</button>

        {carregando ? (
          <p>Carregando detalhes...</p>
        ) : trilha ? (
          <>
            <h1>📘 {trilha.titulo}</h1>
            <p>{trilha.descricao || 'Sem descrição disponível.'}</p>

            <div className="trilha-info">
              <p><strong>Estilo de Aprendizagem:</strong> {trilha.estilo_aprendizagem}</p>
              <p><strong>Interesses:</strong> {trilha.interesses}</p>
              <p><strong>Nível de Carreira:</strong> {trilha.nivel_carreira}</p>
            </div>

            <div className="conteudo-sugerido">
  <h3>📚 Conteúdo Sugerido</h3>

  {gerandoConteudo ? (
    <p>🔄 Gerando conteúdo sugerido com IA...</p>
  ) : conteudoIA.length > 0 ? (
    conteudoIA.map((item, index) => (
      <div key={index} className="conteudo-item">
        <h4>
          {item.tipo === 'Aula' && '✅ Aula Introdutória'}
          {item.tipo === 'PDF' && '📄 Material em PDF'}
          {item.tipo === 'Desafio' && '📝 Mini Desafio'}
          {item.tipo === 'Curiosidade' && '💡 Curiosidade'}
          {item.tipo === 'Dica' && '🧠 Dica Prática'}
          {item.tipo === 'Ferramenta' && '🛠️ Ferramenta Recomendada'}
        </h4>
        <p>{item.texto}</p>
        </div>
    ))
  ) : (
    <p>Nenhum conteúdo sugerido disponível.</p>
  )}
</div>

          </>
        ) : (
          <p>Trilha não encontrada.</p>
        )}
      </div>
    </div>
  );
}
