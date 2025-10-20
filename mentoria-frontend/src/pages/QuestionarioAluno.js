import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { callGenAI } from '../utils/genai';

export default function QuestionarioAluno() {
  const location = useLocation();
  const alunoId = location.state?.alunoId;

  const [preferencias, setPreferencias] = useState('');
  const [interesses, setInteresses] = useState([]);
  const [metas, setMetas] = useState('');
  const [nivel, setNivel] = useState('');
  const [trilhasSugeridas, setTrilhasSugeridas] = useState([]);
  const [perfilIA, setPerfilIA] = useState('');

  const buscarTrilhas = async () => {
    try {
      const res = await axios.post('http://localhost:3001/trilhas/sugeridas', {
        interesses
      });
      setTrilhasSugeridas(res.data.trilhas);
    } catch (err) {
      toast.error('Erro ao buscar trilhas');
    }
  };

  const atribuirTrilha = async (trilhaId) => {
    try {
      await axios.post('http://localhost:3001/trilhas/atribuir', {
        alunoId,
        trilhaId
      });
      toast.success('Trilha atribuída com sucesso!');
    } catch (err) {
      toast.error('Erro ao atribuir trilha');
    }
  };

  const salvarPerfil = async () => {
    try {
      await axios.post('http://localhost:3001/perfil', {
        alunoId,
        preferencias,
        interesses,
        metas,
        nivel
      });
      toast.success('Perfil salvo no banco!');
    } catch (err) {
      toast.error('Erro ao salvar perfil no banco');
    }
  };

  const gerarPerfilIA = async () => {
    const prompt = `
Sou um aluno com o seguinte perfil:
- Estilo de aprendizagem: ${preferencias}
- Interesses: ${interesses.join(', ')}
- Metas profissionais: ${metas}
- Nível de carreira: ${nivel}

Gere um perfil vocacional detalhado, incluindo:
1. Aptidões principais
2. Estilo de trabalho ideal
3. Áreas profissionais sugeridas
4. Recomendações de estudo e ferramentas
5. Possíveis desafios e como superá-los
`;

    toast.info('Gerando perfil com IA...');
    const resposta = await callGenAI(prompt);

    if (resposta?.output) {
      setPerfilIA(resposta.output);
      toast.success('Perfil gerado com sucesso!');
      await salvarPerfil();
      await buscarTrilhas();
    } else {
      toast.error('Erro ao gerar perfil.');
    }
  };

  return (
    <div className="container">
      <h2>Questionário Vocacional</h2>

      <label>Estilo de Aprendizagem:</label>
      <select value={preferencias} onChange={e => setPreferencias(e.target.value)}>
        <option value="">Selecione</option>
        <option value="Visual">Visual</option>
        <option value="Auditivo">Auditivo</option>
        <option value="Cinestésico">Cinestésico</option>
      </select>

      <label>Interesses:</label>
      <select multiple value={interesses} onChange={e => setInteresses(Array.from(e.target.selectedOptions, opt => opt.value))}>
        <option value="Tecnologia">Tecnologia</option>
        <option value="Matemática">Matemática</option>
        <option value="Artes">Artes</option>
        <option value="Comunicação">Comunicação</option>
        <option value="Gestão">Gestão</option>
        <option value="Saúde">Saúde</option>
      </select>

      <label>Metas Profissionais:</label>
      <textarea value={metas} onChange={e => setMetas(e.target.value)} />

      <label>Nível de Carreira:</label>
      <select value={nivel} onChange={e => setNivel(e.target.value)}>
        <option value="">Selecione</option>
        <option value="Iniciante">Iniciante</option>
        <option value="Intermediário">Intermediário</option>
        <option value="Avançado">Avançado</option>
      </select>

      <button onClick={buscarTrilhas}>Buscar Trilhas Sugeridas</button>
      <button onClick={gerarPerfilIA}>Gerar Perfil com IA</button>

      {perfilIA && (
        <div className="perfil-ia">
          <h3>🔹 Perfil Vocacional Gerado</h3>
          <pre>{perfilIA}</pre>
        </div>
      )}

      {trilhasSugeridas.map(trilha => (
        <div key={trilha.id} className="trilha-card">
          <h4>{trilha.titulo}</h4>
          <p>{trilha.descricao}</p>
          <button onClick={() => atribuirTrilha(trilha.id)}>Atribuir</button>
        </div>
      ))}
    </div>
  );
}
