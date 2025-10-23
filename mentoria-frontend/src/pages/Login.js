import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/home.css'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  useEffect(() => {
    document.body.classList.add('login-body');
    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email || !senha) {
      toast.warn('Preencha todos os campos!');
      return;
    }

    if (!emailValido) {
      toast.error('Formato de e-mail inválido!');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3001/cadastro/login', {
        email,
        senha
      });

      console.log('🔍 Resposta do login:', res.data);

      if (res.data.success) {
        const alunoId = res.data.aluno_id;
        localStorage.setItem('alunoId', alunoId);
        toast.success('Login realizado com sucesso!');

        try {
          const perfilRes = await axios.get(`http://localhost:3001/api/perfil/verificar/${alunoId}`);
          if (perfilRes.data.existe) {
            setTimeout(() => navigate('/inicio'), 1500); // vai para BoasVindasAluno.js
          } else {
            setTimeout(() => navigate('/questionario'), 1500); // vai para QuestionarioAluno.js
          }
        } catch (err) {
          console.error('Erro ao verificar perfil:', err);
          setTimeout(() => navigate('/questionario'), 1500); // fallback
        }
      } else {
        toast.error('Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      toast.error('Erro ao tentar login. Verifique sua conexão.');
    }
  };

  return (
    <div className="login-section animated-login">
      <h2>🔐 Acesso ao MentorIA</h2>
      <p>Insira suas credenciais para continuar sua jornada vocacional.</p>

      <form onSubmit={handleLogin} className="login-form">
        <label>Email:</label>
        <input
          type="text"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Senha:</label>
        <div className="senha-wrapper">
          <input
            type={senhaVisivel ? 'text' : 'password'}
            placeholder="********"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <span
            className="senha-toggle"
            onClick={() => setSenhaVisivel(!senhaVisivel)}
          >
            {senhaVisivel ? '🙈' : '👁️'}
          </span>
        </div>

        <button type="submit" className="section-button">Entrar</button>
      </form>

      <div className="sub-opcao" onClick={() => navigate('/cadastro')}>
        <p>
          Ainda não tem conta? <span className="link-text">Cadastre-se</span>
        </p>
      </div>
    </div>
  );
}
