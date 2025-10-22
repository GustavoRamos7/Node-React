import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/boasvindas.css';

export default function BoasVindasAluno() {
  const navigate = useNavigate();
  const alunoId = localStorage.getItem('alunoId');
  const [perfilIA, setPerfilIA] = useState('');

  useEffect(() => {
    // adiciona a classe no body quando entra
    document.body.classList.add('boasvindas-body');

    const verificarPerfil = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/perfil/verificar/${alunoId}`);
        if (res.data.existe) {
          setPerfilIA(res.data.perfilIA);
        } else {
          navigate('/questionario');
        }
      } catch (err) {
        console.error('Erro ao verificar perfil:', err);
        navigate('/questionario');
      }
    };

    verificarPerfil();

    // remove a classe quando sair da página
    return () => {
      document.body.classList.remove('boasvindas-body');
    };
  }, [alunoId, navigate]);

  return (
    <div className="boasvindas-page">
  <div className="boasvindas-container">
    <section className="hero-section">
      <h1>👋 Bem-vindo de volta!</h1>
      <p>Já temos um perfil vocacional gerado para você. O que deseja fazer?</p>

      <div className="perfil-ia">
        <h2 className="perfil-ia-titulo">🔹 Seu Perfil Vocacional</h2>
        <div
          className="perfil-ia-conteudo"
          dangerouslySetInnerHTML={{ __html: perfilIA }}
        />
      </div>

      <div className="acoes">
        <button className="section-button" onClick={() => navigate('/questionario')}>
          🔄 Regerar Perfil com IA
        </button>
        <button className="section-button" onClick={() => navigate('/trilhas')}>
          🚀 Ver Trilhas Sugeridas
        </button>
      </div>
    </section>
  </div>
</div>
  );  
}
