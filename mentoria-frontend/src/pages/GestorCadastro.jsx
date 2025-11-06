import React, { useState, useEffect } from 'react';
import '../styles/home.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showToast } from '../utils/toast';
import Navbar from '../components/Navbar';

export default function GestorCadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    papel: 'mentor',
    consentimento: false
  });

  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erroNome, setErroNome] = useState(false);

  useEffect(() => {
    document.body.classList.add('login-body');
    window.scrollTo(0, 0);
    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nomeCompletoValido = /^[A-Za-zÀ-ÿ]{2,}(?: [A-Za-zÀ-ÿ]{2,})+$/.test(form.nome.trim());
    if (!nomeCompletoValido) {
      setErroNome(true);
      showToast.error('Insira seu nome completo (nome e sobrenome).');
      return;
    } else {
      setErroNome(false);
    }

    if (!form.nome || !form.email || !form.senha || !form.consentimento) {
      toast.warn('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/gestor/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Cadastro realizado com sucesso!');
        setTimeout(() => navigate('/gestor/login'), 1500);
      } else if (res.status === 409) {
        showToast.error('E-mail já cadastrado. Tente outro.');
      } else {
        showToast.error(data.error || 'Erro ao cadastrar. Tente novamente.');
      }
    } catch (err) {
      console.error('❌ Erro no envio:', err);
      showToast.error('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="gestor-login-page">
      {/* Navbar fixa no topo */}
      <Navbar />
    <div className="cadastro-section">
      <h2>Cadastro de Gestor</h2>
      <form onSubmit={handleSubmit} className="cadastro-form">
        <label>Nome:</label>
        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Nome completo"
        />
        {erroNome && <p className="erro-nome">⚠️ Digite seu nome completo</p>}

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="seuemail@exemplo.com"
        />

        <label>Senha:</label>
        <div className="senha-wrapper">
          <input
            type={senhaVisivel ? 'text' : 'password'}
            name="senha"
            value={form.senha}
            onChange={handleChange}
            placeholder="Crie uma senha segura"
          />
          <span
            className="senha-toggle"
            onClick={() => setSenhaVisivel(!senhaVisivel)}
          >
            {senhaVisivel ? '🙈' : '👁️'}
          </span>
        </div>

        <label>Papel:</label>
        <select name="papel" value={form.papel} onChange={handleChange}>
          <option value="mentor">Mentor</option>
          <option value="admin">Administrador</option>
        </select>

        <div className="checkbox-group">
          <input
            type="checkbox"
            name="consentimento"
            checked={form.consentimento}
            onChange={handleChange}
          />
          <label htmlFor="consentimento">Aceito os termos da mentoria</label>
        </div>

        <button type="submit">Cadastrar</button>
      </form>

      <div className="sub-opcao" onClick={() => navigate('/gestor/login')}>
        <p>
          Já sou gestor. <span className="link-text">Fazer login</span>
        </p>
      </div>
    </div>
    </div>
  );
}
