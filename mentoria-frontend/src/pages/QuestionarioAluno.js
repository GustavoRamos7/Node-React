import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { callGenAI } from '../utils/genai';
import React, { useEffect, useState } from 'react';
import '../styles/questionario.css';
import Select from 'react-select';
import StarLoader from '../components/StarLoader';

export default function QuestionarioAluno() {
  const navigate = useNavigate();
  const location = useLocation();
  const alunoId = location.state?.alunoId;

  const [preferencias, setPreferencias] = useState([]);
  const [interesses, setInteresses] = useState([]);
  const [metas, setMetas] = useState('');
  const [nivel, setNivel] = useState('');
  const [trilhasSugeridas, setTrilhasSugeridas] = useState([]);
  const [perfilIA, setPerfilIA] = useState('');
  const [gerandoPerfil, setGerandoPerfil] = useState(false);
  const [perfilGerado, setPerfilGerado] = useState(false);


  useEffect(() => {
    document.body.classList.add('login-body');
    document.body.style.overflow = gerandoPerfil ? 'hidden' : 'auto';
  
    return () => {
      document.body.classList.remove('login-body');
      document.body.style.overflow = 'auto';
    };
  }, [gerandoPerfil]);
  

  const sair = () => navigate('/');

  const opcoesEstilo = [
    { value: 'Visual', label: 'Visual' },
    { value: 'Auditivo', label: 'Auditivo' },
    { value: 'Cinestésico', label: 'Cinestésico' },
    { value: 'Leitura/Escrita', label: 'Leitura/Escrita' },
    { value: 'Lógico/Matemático', label: 'Lógico/Matemático' },
    { value: 'Interpessoal', label: 'Interpessoal (aprende em grupo)' },
    { value: 'Intrapessoal', label: 'Intrapessoal (aprende sozinho)' },
    { value: 'Musical', label: 'Musical' },
    { value: 'Naturalista', label: 'Naturalista' }
  ];
  

  const opcoesInteresse = [
    // Exatas e Tecnológicas
    { value: 'Tecnologia', label: 'Tecnologia' },
    { value: 'Matemática', label: 'Matemática' },
    { value: 'Engenharia', label: 'Engenharia' },
    { value: 'Ciência de Dados', label: 'Ciência de Dados' },
  
    // Humanas e Sociais
    { value: 'Comunicação', label: 'Comunicação' },
    { value: 'Psicologia', label: 'Psicologia' },
    { value: 'Educação', label: 'Educação' },
    { value: 'Direito', label: 'Direito' },
  
    // Criativas e Visuais
    { value: 'Artes', label: 'Artes' },
    { value: 'Design', label: 'Design' },
    { value: 'Moda', label: 'Moda' },
    { value: 'Gastronomia', label: 'Gastronomia' },
  
    // Negócios e Gestão
    { value: 'Gestão', label: 'Gestão' },
    { value: 'Negócios', label: 'Negócios' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Empreendedorismo', label: 'Empreendedorismo' },
  
    // Saúde e Bem-estar
    { value: 'Saúde', label: 'Saúde' },
    { value: 'Esportes', label: 'Esportes' },
    { value: 'Nutrição', label: 'Nutrição' },
  
    // Sustentabilidade e Ciências Naturais
    { value: 'Meio Ambiente', label: 'Meio Ambiente' },
    { value: 'Ciências Biológicas', label: 'Ciências Biológicas' },
  
  ];

  const formatarPerfilIA = (texto) => {
    return texto
      .replace(/^---$/gm, '')
      .replace(/^## (.+)$/gm, '<h4>$1</h4>') // trata ## como título
      .replace(/^### (.+)$/gm, '<h4>$1</h4>') // títulos markdown
      .replace(/^#### (.+)$/gm, '<h5>$1</h5>') // subtítulos markdown
      .replace(/^(\d+\.\s.+)$/gm, '<h4>$1</h4>') // títulos numerados
      .replace(/(<h4>.*<\/h4>\n)([^\n*]+)/g, '$1<h5>$2</h5>') // subtítulo abaixo do h4
      .replace(/^\s*\*{1,2}\s(.+)/gm, '<li>$1</li>') // transforma * em <li>
      .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>') // envolve todos os <li> em <ul>
      .replace(/<\/ul>\s*<ul>/g, '') // junta listas seguidas
      .replace(/^\s*\*\s*/gm, '') // remove * soltos
      .replace(/\n{2,}/g, '\n') // remove quebras excessivas
      .replace(/Perfil Vocacional:/g, 'Perfil Vocacional Detalhado: <br/> <br/> '); // quebra de linha após título
  };
  
  
  

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#111',
      border: 'none',
      boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)',
      color: '#fff',
      fontFamily: 'Orbitron, sans-serif'
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#111',
      color: '#fff'
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#00ffe7',
      color: '#000'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#000',
      fontWeight: 'bold'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#00ffe7' : '#111',
      color: state.isFocused ? '#000' : '#fff',
      cursor: 'pointer'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#888'
    })
  };

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

  const salvarPerfil = async (perfilIA) => {
    try {
      await axios.post('http://localhost:3001/api/perfil', {
        alunoId,
        preferencias,
        interesses,
        metas,
        nivel,
        perfilIA
      });
      toast.success('Perfil salvo no banco!');
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      toast.error('Erro ao salvar perfil no banco');
    }
  };
  

  const gerarPerfilIA = async () => {
    if (!metas.trim()) {
      toast.warn('Por favor, preencha suas metas profissionais antes de gerar o perfil.');
      return;
    }
    if (perfilGerado) {
      toast.warn('O perfil já foi gerado. Recarregue a página para gerar novamente.');
      return;
    }
  
    setGerandoPerfil(true);
  
    const prompt = `
  Sou um aluno com o seguinte perfil:
  - Estilo de aprendizagem: ${preferencias.join(', ')}
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
  
    const resposta = await callGenAI(prompt);
  
    if (resposta?.output) {
      const perfilGeradoTexto = resposta.output.replace(/\*\*/g, '');
      setPerfilIA(perfilGeradoTexto);
      setPerfilGerado(true);
  
      await salvarPerfil(perfilGeradoTexto);
  
      toast.success('Perfil salvo com sucesso!');
    } else {
      toast.error('Erro ao gerar perfil.');
    }
  
    setGerandoPerfil(false);
  };
  

  return (
    <div className="cadastro-section">
      <button type="button" onClick={sair} className="botao-sair">
        ⬅ Sair para Home
      </button>
      <h2>🧠 Questionário Vocacional</h2>

      <form className="cadastro-form">
        <label>Estilos de Aprendizagem:</label>
        <Select
          isMulti
          options={opcoesEstilo}
          value={opcoesEstilo.filter(opt => preferencias.includes(opt.value))}
          onChange={selected => setPreferencias(selected.map(opt => opt.value))}
          placeholder="Selecione os estilos de aprendizagem"
          styles={customStyles}
          className="select-estilo"
        />
        <small className="campo-dica">Você pode selecionar mais de um estilo</small>

        <label>Interesses:</label>
        <Select
          isMulti
          options={opcoesInteresse}
          value={opcoesInteresse.filter(opt => interesses.includes(opt.value))}
          onChange={selected => setInteresses(selected.map(opt => opt.value))}
          placeholder="Selecione seus interesses profissionais"
          styles={customStyles}
          className="select-estilo"
        />
        <small className="campo-dica">Você pode selecionar múltiplos interesses</small>

        <label>Metas Profissionais:</label>
        <textarea value={metas} onChange={e => setMetas(e.target.value)} />

        <label>Nível de Carreira:</label>
        <select value={nivel} onChange={e => setNivel(e.target.value)}>
          <option value="" disabled hidden>Selecione seu nível</option>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
        </select>

        <button type="button" onClick={gerarPerfilIA}>
          Gerar Perfil com IA
        </button>
        <button
          type="button"
          onClick={buscarTrilhas}
          disabled={!perfilGerado}
          style={!perfilGerado ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          Buscar Trilhas Sugeridas
        </button>
      </form>

      {gerandoPerfil && <StarLoader />}

    {perfilIA && !gerandoPerfil && (
      <div className="perfil-ia">
        <h3 className="perfil-ia-titulo">🔹 Perfil Vocacional Gerado</h3>
        <div
          className="perfil-ia-conteudo"
          dangerouslySetInnerHTML={{ __html: formatarPerfilIA(perfilIA.replace(/\*\*/g, '')) }}
        />
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
