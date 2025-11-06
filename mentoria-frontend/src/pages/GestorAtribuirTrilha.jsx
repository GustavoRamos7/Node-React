import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import '../styles/gestorAtribuirTrilha.css';

export default function GestorTrilhaAluno() {
  const [alunos, setAlunos] = useState([]);
  const [trilhas, setTrilhas] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState('');
  const [trilhaSelecionada, setTrilhaSelecionada] = useState('');

  const [preferencias, setPreferencias] = useState([]);
  const [interesses, setInteresses] = useState([]);
  const [metas, setMetas] = useState('');
  const [nivel, setNivel] = useState('');
  const [trilhasSugeridas, setTrilhasSugeridas] = useState([]);
  const [perfilIA, setPerfilIA] = useState('');
  const [perfilIAOriginal, setPerfilIAOriginal] = useState('');

  const formatarPerfilIA = (texto) => {
    const textoSemRoadmap = texto.replace(/## Roadmap Vocacional[\s\S]*$/, '');

    return textoSemRoadmap
      .replace(/^---$/gm, '')
      .replace(/^\s*#{1,6}\s*$/gm, '')
      .replace(/^\s*######\s*(.+)$/gm, '<h6>$1</h6>')
      .replace(/^\s*#####\s*(.+)$/gm, '<h5>$1</h5>')
      .replace(/^\s*####\s*(.+)$/gm, '<h4>$1</h4>')
      .replace(/^\s*###\s*(.+)$/gm, '<h4>$1</h4>')
      .replace(/^\s*##\s*(.+)$/gm, '<h3>$1</h3>')
      .replace(/^\s*#\s*(.+)$/gm, '<h2>$1</h2>')
      .replace(/^(\d+\.\s+Desafio: .+)$/gm, '<h4>$1</h4>')
      .replace(/^\s*Como superar:\s*(.+)$/gm, '<p><strong>Como superar:</strong> $1</p>')
      .replace(/^\s*\*\s*/gm, '')
      .replace(/\n{2,}/g, '\n')
      .replace(/^##?\s*Perfil Vocacional.*$/gm, '<h3>Perfil Vocacional Detalhado</h3>');
  };

  const extrairRoadmap = (texto) => {
    const roadmapRegex = /## Roadmap Vocacional([\s\S]*?)(?:\n##|\n###|$)/;
    const match = texto.match(roadmapRegex);
    if (!match) return [];

    return match[1]
      .split('\n')
      .filter(l => /^\d+\./.test(l))
      .map(l => l.replace(/^\d+\.\s*/, '').trim());
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/gestor/alunos')
      .then(res => res.json())
      .then(data => setAlunos(data));

    fetch('http://localhost:3001/api/gestor/trilhas')
      .then(res => res.json())
      .then(data => setTrilhas(data));
  }, []);

  useEffect(() => {
    if (!alunoSelecionado) return;

    fetch(`http://localhost:3001/api/gestor/aluno/${alunoSelecionado}/perfil`)
      .then(res => res.json())
      .then(data => {
        setPreferencias(data.preferencias || []);
        setInteresses(data.interesses || []);
        setMetas(data.metas || '');
        setNivel(data.nivel || '');
        setTrilhasSugeridas(data.trilhasSugeridas || []);
        setPerfilIAOriginal(data.perfilIA || '');
        setPerfilIA(formatarPerfilIA(data.perfilIA || ''));
      })
      .catch(() => {
        toast.error('Erro ao carregar perfil do aluno.');
        setPreferencias([]);
        setInteresses([]);
        setMetas('');
        setNivel('');
        setTrilhasSugeridas([]);
        setPerfilIA('');
      });
  }, [alunoSelecionado]);

  const atribuirTrilha = async () => {
    if (!alunoSelecionado || !trilhaSelecionada) {
      toast.error('Selecione um aluno e uma trilha.');
      return;
    }

    const res = await fetch('http://localhost:3001/api/gestor/atribuir-trilha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aluno_id: alunoSelecionado, trilha_id: trilhaSelecionada })
    });

    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
    } else {
      toast.error(data.error || 'Erro ao atribuir trilha.');
    }
  };

  const removerTrilha = async (trilhaTitulo) => {
    const trilha = trilhas.find(t => t.titulo === trilhaTitulo);
    if (!trilha) return;

    try {
      const res = await fetch('http://localhost:3001/api/aluno/trilhas/remover', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alunoId: alunoSelecionado, trilhaId: trilha.trilha_id })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setTrilhasSugeridas(prev => prev.filter(t => t !== trilhaTitulo));
      } else {
        toast.error(data.error || 'Erro ao remover trilha.');
      }
    } catch (err) {
      toast.error('Erro ao remover trilha.');
      console.error('❌ Erro ao remover trilha:', err);
    }
  };

  return (
    <div className="gestor-atribuir">
      <h2>Alunos Cadastrados</h2>
      <table className="tabela-alunos">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Cadastro</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map((a) => (
            <tr key={a.aluno_id}>
              <td>{a.nome}</td>
              <td>{a.email}</td>
              <td>{new Date(a.data_cadastro).toLocaleDateString('pt-BR')}</td>
              <td>{a.status === 'ativo' ? '✅ Ativo' : '❌ Inativo'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>📚 Atribuir Trilha a Aluno</h2>

      <select onChange={e => setAlunoSelecionado(e.target.value)} value={alunoSelecionado}>
        <option value="">Selecione um aluno</option>
        {alunos.map(a => (
          <option key={a.aluno_id} value={a.aluno_id}>{a.nome}</option>
        ))}
      </select>

      <select onChange={e => setTrilhaSelecionada(e.target.value)} value={trilhaSelecionada}>
        <option value="">Selecione uma trilha</option>
        {trilhas.map(t => (
          <option key={t.trilha_id} value={t.trilha_id}>{t.titulo}</option>
        ))}
      </select>

      <button onClick={atribuirTrilha}>✅ Atribuir</button>

      {alunoSelecionado && (
        <>
          <div className="perfil-aluno">
            <h3>🧠 Perfil do Aluno</h3>
            <p><span className="rotulo">Nível:</span> {nivel || 'Não informado'}</p>
            <p><span className="rotulo">Metas:</span> {metas || 'Não informado'}</p>
            <p><span className="rotulo">Preferências:</span> {preferencias.join(', ') || 'Nenhuma'}</p>
            <p><span className="rotulo">Interesses:</span> {interesses.join(', ') || 'Nenhum'}</p>
            <p><span className="rotulo">Trilhas Sugeridas:</span></p>
            {trilhasSugeridas.length > 0 ? (
              <ul>
                {trilhasSugeridas.map((titulo, index) => (
                  <li key={index}>
                    {titulo}
                    <button className="botao-remover-trilha" onClick={() => removerTrilha(titulo)}>
                      🗑 Remover
                    </button>

                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhuma</p>
            )}
          </div>

          {perfilIA && (
  <div className="perfil-ia">
    <h3 className="perfil-ia-titulo">🧠 Perfil Gerado com IA</h3>
    <div className="perfil-ia-conteudo" dangerouslySetInnerHTML={{ __html: perfilIA }} />
  </div>
)}

{extrairRoadmap(perfilIAOriginal).length > 0 && (
  <div className="roadmap-vocacional">
    <h3 className="perfil-ia-titulo">🗺️ Roadmap Vocacional (Passo a Passo)</h3>
    <div className="fluxograma-container">
      {extrairRoadmap(perfilIAOriginal).map((etapa, index, array) => (
        <React.Fragment key={index}>
          <div className="fluxograma-etapa">
            <div className="etapa-icone">{index + 1}</div>
            <div className="etapa-conteudo">
              <p className="etapa-texto">{etapa}</p>
            </div>
          </div>
          {index < array.length - 1 && (
            <div className="fluxograma-seta">→</div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
)}
</>
)}
</div>
);
}
