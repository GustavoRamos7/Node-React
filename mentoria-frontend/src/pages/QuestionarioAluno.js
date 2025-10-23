import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { callGenAI } from '../utils/genai';
import React, { useEffect, useState } from 'react';
import '../styles/questionario.css';
import Select from 'react-select';
import StarLoader from '../components/StarLoader';
import Swal from 'sweetalert2';


export default function QuestionarioAluno() {
  const navigate = useNavigate();
  const alunoId = localStorage.getItem('alunoId'); // ✅ Correto agora

  const [preferencias, setPreferencias] = useState([]);
  const [interesses, setInteresses] = useState([]);
  const [metas, setMetas] = useState('');
  const [nivel, setNivel] = useState('');
  const [trilhasSugeridas, setTrilhasSugeridas] = useState([]);
  const [perfilIA, setPerfilIA] = useState('');
  const [gerandoPerfil, setGerandoPerfil] = useState(false);
  const [perfilGerado, setPerfilGerado] = useState(false);
  
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.body.classList.add('login-body');
    document.body.style.overflow = gerandoPerfil ? 'hidden' : 'auto';
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
    { value: 'Tecnologia', label: 'Tecnologia' },
    { value: 'Matemática', label: 'Matemática' },
    { value: 'Engenharia', label: 'Engenharia' },
    { value: 'Ciência de Dados', label: 'Ciência de Dados' },
    { value: 'Comunicação', label: 'Comunicação' },
    { value: 'Psicologia', label: 'Psicologia' },
    { value: 'Educação', label: 'Educação' },
    { value: 'Direito', label: 'Direito' },
    { value: 'Artes', label: 'Artes' },
    { value: 'Design', label: 'Design' },
    { value: 'Moda', label: 'Moda' },
    { value: 'Gastronomia', label: 'Gastronomia' },
    { value: 'Gestão', label: 'Gestão' },
    { value: 'Negócios', label: 'Negócios' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Empreendedorismo', label: 'Empreendedorismo' },
    { value: 'Saúde', label: 'Saúde' },
    { value: 'Esportes', label: 'Esportes' },
    { value: 'Nutrição', label: 'Nutrição' },
    { value: 'Meio Ambiente', label: 'Meio Ambiente' },
    { value: 'Ciências Biológicas', label: 'Ciências Biológicas' }
  ];

  const formatarPerfilIA = (texto) => {
    const textoSemRoadmap = texto.replace(/## Roadmap Vocacional[\s\S]*$/, '');
  
    return textoSemRoadmap
      .replace(/^---$/gm, '')
      .replace(/^\s*#{1,6}\s*$/gm, '') // remove linhas com apenas hashes (mesmo com espaços)
      .replace(/^\s*######\s*(.+)$/gm, '<h6>$1</h6>')
      .replace(/^\s*#####\s*(.+)$/gm, '<h5>$1</h5>')
      .replace(/^\s*####\s*(.+)$/gm, '<h4>$1</h4>')
      .replace(/^\s*###\s*(.+)$/gm, '<h4>$1</h4>')
      .replace(/^\s*##\s*(.+)$/gm, '<h3>$1</h3>')
      .replace(/^\s*#\s*(.+)$/gm, '<h2>$1</h2>')
      .replace(/^(\d+\.\s+Desafio: .+)$/gm, '<h4>$1</h4>')
      .replace(/^\s*Como superar:\s*(.+)$/gm, '<p><strong>Como superar:</strong> $1</p>')
      .replace(/^\s*\*\s*/gm, '') // remove asteriscos soltos
      .replace(/\n{2,}/g, '\n')
      .replace(/^##?\s*Perfil Vocacional.*$/gm, '<h3>Perfil Vocacional Detalhado</h3>');
  };
  

  const extrairRoadmap = (texto) => {
    const roadmapRegex = /## Roadmap Vocacional([\s\S]*?)(?:\n##|\n###|$)/; 
    const match = texto.match(roadmapRegex);
    if (!match) return [];
  
    const linhas = match[1]
      .split('\n')
      .filter(l => /^\d+\./.test(l))  // só pega linhas que começam com número
      .map(l => l.replace(/^\d+\.\s*/, '').trim());
  
    return linhas;
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
        alunoId
      });
  
      if (res.data.trilhas?.length) {
        setTrilhasSugeridas(res.data.trilhas);
        toast.success('Trilhas sugeridas encontradas!');
      } else {
        toast.info('Nenhuma trilha sugerida encontrada para seu perfil.');
      }
    } catch (err) {
      toast.error('Erro ao buscar trilhas');
      console.error('❌ Erro ao buscar trilhas:', err);
    }
  };
  
  // const atribuirTrilha = async (trilhaId) => {
  //   try {
  //     const res = await axios.post('http://localhost:3001/trilhas/atribuir', {
  //       alunoId,
  //       trilhaId
  //     });
  //     toast.success(`Trilha atribuída com sucesso! Score: ${res.data.score}`);
  //   } catch (err) {
  //     if (err.response?.status === 409) {
  //       toast.info('Essa trilha já foi atribuída a você.');
  //     } else {
  //       toast.error('Erro ao atribuir trilha');
  //     }
  //   }
  // };

  const salvarPerfil = async (perfilIA) => {
    console.log('📤 Enviando para backend:', {
      alunoId,
      preferencias,
      interesses,
      metas,
      nivel,
      perfilIA
    });

    try {
      const response = await axios.post('http://localhost:3001/api/perfil', {
        alunoId,
        preferencias,
        interesses,
        metas,
        nivel,
        perfilIA
      });

      console.log('📤 Resposta do backend:', response);

      if (response.status === 200) {
        toast.success('Perfil salvo com sucesso!');
        return true;
      } else {
        toast.error('Erro ao salvar perfil no banco');
        return false;
      }
    } catch (err) {
      console.error('❌ Erro ao salvar perfil:', err);
      toast.error('Erro ao salvar perfil no banco');
      return false;
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
    
    Gere um perfil vocacional detalhado e bem formatado, com as seguintes seções:
    
    1. Aptidões principais — em parágrafos curtos
    2. Estilo de trabalho ideal — em parágrafos curtos
    3. Áreas profissionais sugeridas — como uma lista com marcadores
    4. Recomendações de estudo e ferramentas — como uma lista com marcadores
    5. Possíveis desafios e como superá-los — cada desafio numerado, seguido de uma explicação e uma solução clara. Use o formato:
    
       1. Desafio: [nome do desafio]
          Como superar: [explicação da solução]
    
    Evite usar asteriscos (*) ou marcações soltas. Use estrutura clara com títulos, subtítulos e listas.

    6. Roadmap Vocacional — gere uma lista numerada com até 8 etapas, representando um passo a passo de desenvolvimento profissional para esse aluno. Use títulos curtos e objetivos para cada etapa, e organize em ordem lógica de progressão. Comece com o título "## Roadmap Vocacional".

    `;

    const resposta = await callGenAI(prompt);

    if (resposta?.output) {
      const perfilGeradoTexto = resposta.output.replace(/\*\*/g, '');
      const sucesso = await salvarPerfil(perfilGeradoTexto);

      if (sucesso) {
        setPerfilIA(perfilGeradoTexto);
        setPerfilGerado(true);
      } else {
        setGerandoPerfil(false);
        return;
      }
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
        <textarea
        value={metas}
        onChange={e => setMetas(e.target.value)}
        placeholder="Ex: Quero crescer na área de tecnologia e atuar com projetos inovadores."
      />

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
          onClick={() => navigate('/inicio')}
          disabled={!perfilGerado}
          style={!perfilGerado ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          Ver Meu Perfil e Recomendações
        </button>
      </form>

      <small className="campo-dica">Essa trilha será atribuída por seu mentor.</small>


      {/* {trilhasSugeridas.map(trilha => (
        <div key={trilha.trilha_id} className="trilha-card">
          <h4>{trilha.titulo}</h4>
          <p>{trilha.descricao}</p>
          <button onClick={() => atribuirTrilha(trilha.trilha_id)}>
            Atribuir trilha
          </button>
        </div>
      ))} */}


      {gerandoPerfil && <StarLoader />}

      {perfilIA && !gerandoPerfil && (
  <>
    <div className="perfil-ia">
      <h3 className="perfil-ia-titulo">🔹 Perfil Vocacional Gerado</h3>
      <div
        className="perfil-ia-conteudo"
        dangerouslySetInnerHTML={{ __html: formatarPerfilIA(perfilIA.replace(/\*\*/g, '')) }}
      />
    </div>

   {/* Roadmap Vocacional (Estrutura de Fluxograma) */}
    {extrairRoadmap(perfilIA).length > 0 && (
 <div className="roadmap-vocacional">
  <h3 className="perfil-ia-titulo">🗺️ Roadmap Vocacional (Passo a Passo)</h3>
  <div className="fluxograma-container">
  {extrairRoadmap(perfilIA).map((etapa, index, array) => (
   <React.Fragment key={index}>
   <div className="fluxograma-etapa">
    <div className="etapa-icone">{index + 1}</div>
    <div className="etapa-conteudo">
    <p className="etapa-texto">{etapa}</p>
    </div>
   </div>
   {/* Adiciona a seta de conexão entre as etapas (exceto na última) */}
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