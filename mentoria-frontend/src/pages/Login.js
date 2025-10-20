import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

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
      // Simulação de login (substitua por chamada real ao backend)
      if (email === 'teste@mentor.com' && senha === '123456') {
        toast.success('Login realizado com sucesso!');
        setTimeout(() => navigate('/questionario'), 1500);
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
        <input
          type="password"
          placeholder="********"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

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
