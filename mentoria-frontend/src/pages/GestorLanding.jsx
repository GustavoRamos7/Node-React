import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/gestorLanding.css';

export default function GestorLanding() {
  const navigate = useNavigate();

  return (
    <div className="gestor-landing">
      <h1>🎓 Portal do Gestor</h1>
      <p>Gerencie trilhas, acompanhe alunos e personalize experiências vocacionais.</p>

      <div className="gestor-acoes">
        <button onClick={() => navigate('/gestor/cadastro')}>Cadastrar Novo Gestor</button>
        <button onClick={() => navigate('/gestor/login')}>Entrar como Gestor</button>
      </div>
    </div>
  );
}
