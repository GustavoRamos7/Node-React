import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CadastroAluno from './pages/CadastroAluno';
import Gestor from './pages/Gestor';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
import QuestionarioAluno from './pages/QuestionarioAluno';
import Login from './pages/Login';
import TrilhasSugeridas from './pages/TrilhasSugeridas';
import BoasVindasAluno from './pages/BoasVindasAluno';
import GestorLanding from './pages/GestorLanding';
import GestorCadastro from './pages/GestorCadastro';
import GestorLogin from './pages/GestorLogin';



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
  <Route path="/questionario" element={<QuestionarioAluno />} />
  <Route path="/login" element={<Login />} />
  <Route path="/trilhas" element={<TrilhasSugeridas />} />
  <Route path="/inicio" element={<BoasVindasAluno />} />

  {/* 🔹 Fluxo do gestor */}
  <Route path="/gestor" element={<GestorLanding />} />
  <Route path="/gestor/cadastro" element={<GestorCadastro />} />
  <Route path="/gestor/login" element={<GestorLogin />} />
  <Route path="/painel-gestor" element={<Gestor />} /> {/* painel principal */}
</Routes>

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
