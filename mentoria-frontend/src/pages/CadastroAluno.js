import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


export default function CadastroAluno() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', data_nascimento: '', celular: '', consentimento: false
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/cadastro/aluno', form);
      console.log('✅ Resposta do backend:', res);
      toast.success(res.data.message || 'Cadastro realizado com sucesso!');
      navigate('/questionario', { state: { alunoId: res.data.alunoId } });
    } catch (err) {
      console.error('❌ Erro na requisição:', err);
      toast.error(err.response?.data?.error || 'Erro ao cadastrar. Verifique os dados ou o servidor.');
    }
  };
  

  return (
    <form className="container" onSubmit={handleSubmit}>
      <h2>Cadastro de Aluno</h2>
      <input name="nome" placeholder="Nome" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="senha" type="password" placeholder="Senha" onChange={handleChange} />
      <input name="data_nascimento" type="date" onChange={handleChange} />
      <input name="celular" placeholder="Celular" onChange={handleChange} />
      <label className="checkbox-container">
        <input type="checkbox" 
        name="consentimento" 
        onChange={handleChange} 
        />
        Aceito os termos
      </label>
      <button type="submit">Cadastrar</button>
    </form>
  );
}
