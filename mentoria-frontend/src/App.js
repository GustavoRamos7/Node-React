// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CadastroAluno from './pages/CadastroAluno';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
import QuestionarioAluno from './pages/QuestionarioAluno';
import Login from './pages/Login';


function App() {

  async function callGenAI(prompt) {
    try {
      const res = await fetch('http://localhost:3001/api/genai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
  
      const data = await res.json();
      console.log('Resposta do GenAI:', data);
    } catch (error) {
      console.error('Erro ao chamar API GenAI:', error);
    }
  }


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<CadastroAluno />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/questionario" element={<QuestionarioAluno />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      {/* 🔹 ToastContainer com botão customizado */}
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={true}
        closeOnClick={false}
        pauseOnHover={false}
        draggable={true}
        theme="dark"
        closeButton={false}
        limit={1}
        toastClassName="custom-toast"
        bodyClassName="custom-body"
        
      />

    </Router>
  );
}

export default App;
