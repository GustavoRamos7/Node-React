import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Select from 'react-select';
import TabelaTrilhas from '../components/TabelaTrilhas.jsx';
import '../styles/gestor.css';

export default function Gestor() {
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [estilo, setEstilo] = useState([]);
  const [interesses, setInteresses] = useState([]);
  const [nivel, setNivel] = useState('');
  const [trilhas, setTrilhas] = useState([]);

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
      color: '#fff',
      zIndex: 10
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
    multiValueRemove: (base) => ({
      ...base,
      color: '#000',
      ':hover': {
        backgroundColor: '#00d6c3',
        color: '#000'
      }
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
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff'
    }),
    input: (base) => ({
      ...base,
      color: '#fff'
    })
  };

  useEffect(() => {
    document.body.classList.add('login-body');
    window.scrollTo(0, 0);
    buscarTrilhas();
    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);

  const cadastrarTrilha = async () => {
    if (!titulo || !descricao || !estilo.length || !interesses.length || !nivel) {
      toast.warn('Preencha todos os campos antes de cadastrar.');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/trilhas/cadastrar', {
        titulo,
        descricao,
        estilo_aprendizagem: estilo.join(', '),
        interesses: interesses.join(', '),
        nivel_carreira: nivel
      });

      toast.success('Trilha cadastrada com sucesso!');
      setTitulo('');
      setDescricao('');
      setEstilo([]);
      setInteresses([]);
      setNivel('');
      buscarTrilhas();
    } catch (err) {
      toast.error('Erro ao cadastrar trilha.');
      console.error(err);
    }
  };

  const buscarTrilhas = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/trilhas');
      setTrilhas(res.data.trilhas || []);
    } catch (err) {
      toast.error('Erro ao buscar trilhas.');
      console.error(err);
    }
  };

  return (
    <div className="cadastro-section">
      <h2>🧠 Painel do Gestor</h2>

      <div style={{ marginBottom: '1rem' }}>
        <button
          className="section-button"
          onClick={() => navigate('/gestor/atribuir-trilha')}
        >
          📚 Atribuir Trilha a Aluno
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); cadastrarTrilha(); }} className="cadastro-form">
        <label>Título da trilha:</label>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Fundamentos da IA" />

        <label>Descrição:</label>
        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Breve descrição da trilha" />

        <label>Estilos de aprendizagem:</label>
        <Select
          isMulti
          options={opcoesEstilo}
          value={opcoesEstilo.filter(opt => estilo.includes(opt.value))}
          onChange={selected => setEstilo(selected.map(opt => opt.value))}
          placeholder="Selecione os estilos"
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
          placeholder="Selecione os interesses"
          styles={customStyles}
          className="select-estilo"
        />
        <small className="campo-dica">Você pode selecionar múltiplos interesses</small>

        <label>Nível de carreira:</label>
        <select value={nivel} onChange={e => setNivel(e.target.value)}>
          <option value="" disabled hidden>Selecione o nível</option>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
        </select>

        <button type="submit">Cadastrar Trilha</button>
      </form>

      {trilhas.length > 0 && (
        <div className="tabela-trilhas-wrapper">
          <h3 className="perfil-ia-titulo">📋 Visualização em Tabela</h3>
          <TabelaTrilhas trilhas={trilhas} />
        </div>
      )}
    </div>
  );
}
