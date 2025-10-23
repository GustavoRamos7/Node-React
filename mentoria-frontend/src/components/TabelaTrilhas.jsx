import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/tabelaTrilhas.css';

export default function TabelaTrilhas({ trilhas, setTrilhas, fetchTrilhas }) {
  const [busca, setBusca] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('titulo');
  const [ordemAsc, setOrdemAsc] = useState(true);

  const trilhasFiltradas = useMemo(() => {
    return trilhas.filter(t =>
      t.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      t.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      t.interesses.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca, trilhas]);

  const trilhasOrdenadas = useMemo(() => {
    const trilhasCopia = [...trilhasFiltradas];
    trilhasCopia.sort((a, b) => {
      const valorA = a[ordenarPor]?.toLowerCase?.() || '';
      const valorB = b[ordenarPor]?.toLowerCase?.() || '';
      if (valorA < valorB) return ordemAsc ? -1 : 1;
      if (valorA > valorB) return ordemAsc ? 1 : -1;
      return 0;
    });
    return trilhasCopia;
  }, [trilhasFiltradas, ordenarPor, ordemAsc]);

  const mudarOrdenacao = (campo) => {
    if (campo === ordenarPor) setOrdemAsc(!ordemAsc);
    else {
      setOrdenarPor(campo);
      setOrdemAsc(true);
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm('Deseja realmente excluir esta trilha?');
    if (!confirmar) return;
  
    try {
      const res = await fetch(`http://localhost:3001/api/trilhas/${id}`, {
        method: 'DELETE'
      });
  
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : null;
  
      if (!res.ok) {
        toast.error(data?.error || `❌ Erro ao excluir trilha. Código ${res.status}`);
        return;
      }
  
      toast.success(data?.message || '✅ Trilha excluída com sucesso!');
      await fetchTrilhas();
    } catch (err) {
      console.error('Erro inesperado ao excluir trilha:', err);
    
    }
  };
  
  

  const handleEdit = async (trilha) => {
    const novoTitulo = prompt('Novo título:', trilha.titulo);
    if (novoTitulo === null) return;
  
    const novaDescricao = prompt('Nova descrição:', trilha.descricao);
    if (novaDescricao === null) return;
  
    const novoEstilo = prompt('Novo estilo de aprendizagem:', trilha.estilo_aprendizagem);
    if (novoEstilo === null) return;
  
    const novosInteresses = prompt('Novos interesses:', trilha.interesses);
    if (novosInteresses === null) return;
  
    const novoNivel = prompt('Novo nível de carreira:', trilha.nivel_carreira);
    if (novoNivel === null) return;
  
    const novosDados = {
      titulo: novoTitulo,
      descricao: novaDescricao,
      estilo_aprendizagem: novoEstilo,
      interesses: novosInteresses,
      nivel_carreira: novoNivel,
    };
  
    try {
      const res = await fetch(`http://localhost:3001/api/trilhas/${trilha.trilha_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novosDados)
      });
  
      const isJson = res.headers.get('content-type')?.includes('application/json');
      let data = null;
  
      if (isJson) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.warn('Erro ao interpretar JSON:', jsonErr);
          // Se a resposta foi OK, mas o JSON falhou, ainda consideramos sucesso
          if (res.ok) {
            toast.success('✅ Trilha atualizada com sucesso!');
            await fetchTrilhas();
            return;
          }
          // Se não foi OK, tratamos como erro
          toast.error('❌ Erro ao atualizar trilha.');
          return;
        }
      }
  
      if (!res.ok) {
        toast.error(data?.error || `❌ Erro ao atualizar trilha. Código ${res.status}`);
        return;
      }
  
      toast.success(data?.message || '✅ Trilha atualizada com sucesso!');
      await fetchTrilhas();
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };
  
  
  
  

  return (
    <div className="tabela-container">
      <input
        type="text"
        className="tabela-busca"
        placeholder="🔍 Buscar trilha por nome, interesse ou descrição..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <table className="tabela-trilhas">
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => mudarOrdenacao('titulo')}>Título ⬍</th>
            <th onClick={() => mudarOrdenacao('descricao')}>Descrição ⬍</th>
            <th onClick={() => mudarOrdenacao('estilo_aprendizagem')}>Estilo ⬍</th>
            <th onClick={() => mudarOrdenacao('interesses')}>Interesses ⬍</th>
            <th onClick={() => mudarOrdenacao('nivel_carreira')}>Nível ⬍</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {trilhasOrdenadas.length > 0 ? (
            trilhasOrdenadas.map((trilha, index) => (
              <tr key={trilha.trilha_id}>
                <td>{index + 1}</td>
                <td>{trilha.titulo}</td>
                <td>{trilha.descricao}</td>
                <td>{trilha.estilo_aprendizagem}</td>
                <td>{trilha.interesses}</td>
                <td>{trilha.nivel_carreira}</td>
                <td className="acoes">
                  <button className="botao-tabela editar-tabela" onClick={() => handleEdit(trilha)}>
                    ✏️ Editar
                  </button>
                  <button className="botao-tabela excluir-tabela" onClick={() => handleDelete(trilha.trilha_id)}>
                    🗑️ Excluir
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', color: '#888' }}>
                Nenhuma trilha encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
