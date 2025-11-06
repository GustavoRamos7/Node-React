// /src/pages/BoasVindasAluno.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/boasvindas.css';
import '../styles/questionario.css';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';

export default function BoasVindasAluno() {
  const navigate = useNavigate();
  const alunoId = localStorage.getItem('alunoId');
  const [perfilIA, setPerfilIA] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
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
        console.error('❌ Erro ao verificar perfil:', err);
        navigate('/questionario');
      }
    };

    verificarPerfil();

    return () => {
      document.body.classList.remove('boasvindas-body');
    };
  }, [alunoId, navigate]);

  // Formata o texto do perfil IA (mesma lógica do questionário)
  const formatarPerfilIA = (texto) => {
    const textoSemRoadmap = texto.replace(/## Roadmap Vocacional[\s\S]*$/, '');
    return textoSemRoadmap
      .replace(/^---$/gm, '')
      .replace(/^## (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^#### (.+)$/gm, '<h5>$1</h5>')
      .replace(/^(\d+\.\s+Desafio: .+)$/gm, '<h5>$1</h5>')
      .replace(/^\s*Como superar:\s*(.+)$/gm, '<p><strong>Como superar:</strong> $1</p>')
      .replace(/^\s*\*\s*/gm, '')
      .replace(/\n{2,}/g, '\n')
      .replace(/^##?\s*Perfil Vocacional.*$/gm, '<h4>Perfil Vocacional Detalhado</h4>');
  };

  // Extrai roadmap vocacional do texto
  const extrairRoadmap = (texto) => {
    const roadmapRegex = /## Roadmap Vocacional([\s\S]*?)(?:\n##|\n###|$)/;
    const match = texto.match(roadmapRegex);
    if (!match) return [];
    return match[1]
      .split('\n')
      .filter(l => /^\d+\./.test(l))
      .map(l => l.replace(/^\d+\.\s*/, '').trim());
  };

  // Confirma antes de regerar o perfil
  const confirmarRegeracao = () => {
    Swal.fire({
      title: 'Regerar Perfil Vocacional?',
      text: 'Essa ação é irreversível e substituirá seu perfil atual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00ffe7',
      cancelButtonColor: '#333',
      confirmButtonText: 'Sim, quero regerar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/questionario');
      } else {
        toast.info('Ação cancelada. Seu perfil atual foi mantido.');
      }
    });
  };

  return (
    <div className="questionario-page">
    {/* Navbar fixa no topo */}
    <Navbar />
    <div className="boasvindas-page">
      <div className="boasvindas-container">
        <h1>👋 Bem-vindo!</h1>
        <p>Criamos um perfil vocacional para você. <br></br>O que deseja fazer?</p>

        {perfilIA ? (
          <>
            <div className="perfil-ia">
              <h3 className="perfil-ia-titulo">🔹 Seu Perfil Vocacional</h3>
              <div
                className="perfil-ia-conteudo"
                dangerouslySetInnerHTML={{
                  __html: formatarPerfilIA(perfilIA.replace(/\*\*/g, ''))
                }}
              />
            </div>

            {/* Roadmap Vocacional com mesmo estilo visual do questionário */}
            {extrairRoadmap(perfilIA).length > 0 && (
              <div className="roadmap-vocacional">
                <h3 className="perfil-ia-titulo">🗺️ Roadmap Vocacional (Passo a Passo)</h3>
                <div className="fluxograma-container">
                  {extrairRoadmap(perfilIA).map((etapa, index, array) => (
                    <React.Fragment key={index}>
                      <div className="fluxograma-etapa">
                        <div className="etapa-icone">{index + 1}</div>
                        <div className="etapa-conteudo">
                          <p className="etapa-texto">{etapa}</p>
                        </div>
                      </div>
                      {index < array.length - 1 && (
                        <div className="fluxograma-seta">→</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            <div className="acoes">
              <button className="section-button" onClick={confirmarRegeracao}>
                🔄 Regerar Perfil com IA
              </button>
              <button
                className="section-button"
                onClick={() => {
                    window.scrollTo(0, 0); // 👈 sobe para o topo
                    navigate('/trilhas');
                }}
                >
                🚀 Ver Trilhas Sugeridas
                </button>
            </div>
          </>
        ) : (
          <p>Carregando seu perfil...</p>
        )}
      </div>
    </div>
  </div>
  );
}
