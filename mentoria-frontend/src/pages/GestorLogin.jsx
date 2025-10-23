import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/home.css'; // usa o mesmo CSS do aluno
import { toast } from 'react-toastify';
import { showToast } from '../utils/toast';

export default function GestorLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-body');
    window.scrollTo(0, 0);
    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);

  const logar = async (e) => {
    e.preventDefault();

    if (!email || !senha) {
      toast.warn('Preencha todos os campos.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3001/api/gestor/login', {
        email,
        senha
      });

      localStorage.setItem('gestorId', res.data.gestorId);
      toast.success(`Bem-vindo, ${res.data.nome}!`);
      setTimeout(() => navigate('/painel-gestor'), 1500);
    } catch (err) {
      toast.error('Email ou senha inválidos.');
      console.error(err);
    }
  };

  return (
    <div className="cadastro-section">
      <h2>🔐 Login do Gestor</h2>
      <form onSubmit={logar} className="cadastro-form">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seuemail@exemplo.com"
        />

        <label>Senha:</label>
        <div className="senha-wrapper">
          <input
            type={senhaVisivel ? 'text' : 'password'}
            name="senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="Digite sua senha"
          />
          <span
            className="senha-toggle"
            onClick={() => setSenhaVisivel(!senhaVisivel)}
          >
            {senhaVisivel ? '🙈' : '👁️'}
          </span>
        </div>

        <button type="submit">Entrar</button>
      </form>

      <div className="sub-opcao" onClick={() => navigate('/gestor/cadastro')}>
        <p>
          Ainda não sou gestor. <span className="link-text">Cadastrar</span>
        </p>
      </div>
    </div>
  );
}
