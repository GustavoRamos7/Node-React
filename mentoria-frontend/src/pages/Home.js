import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

export default function Home() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      
      setTimeout(() => {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start', 
        });
  
        section.classList.add('active');
        section.style.transition = 'box-shadow 0.6s ease';
        section.style.boxShadow = '0 0 20px #00ffe7';
  
        setTimeout(() => {
          section.style.boxShadow = 'none';
        }, 800);
      }, 100);
    }
  };
  

  return (
    <div className="home-container">
      {/* Navbar moderna */}
      <nav className="navbar-top">
        <div className="logo">🤖 MentorIA</div>
        <ul className="nav-links">
          <li onClick={() => scrollToSection('sobre-nos')}>Sobre Nós</li>
          <li onClick={() => scrollToSection('servicos')}>Serviços</li>
          <li onClick={() => scrollToSection('contato')}>Contato</li>
          <li className="nav-action" onClick={() => scrollToSection('cadastro')}>Central do Aluno</li>
          <li className="nav-action" onClick={() => scrollToSection('mentor')}>Área do Mentor</li>
        </ul>
      </nav>

      {/* Seção inicial */}
      <header className="hero-section">
        <h1>Bem-vindo à <span>MentorIA</span></h1>
        <p>Conectando mentes com inteligência artificial e mentoria humana.</p>
      </header>

            {/* Seção de Cadastro */}
      <section id="cadastro" className="section">
        <h2>🚀 Inscreva-se na Mentoria</h2>
        <p>
          Está pronto para começar sua jornada? Clique abaixo para preencher seus dados e garantir sua vaga.
        </p>
        <button onClick={() => navigate('/cadastro')} className="section-button">
          Ir para o formulário de cadastro
        </button>
        <div className="sub-opcao" onClick={() => navigate('/login')}>
        <p>
          Já sou aluno. <span className="link-text" onClick={(e) => {
            e.stopPropagation();
            navigate('/login');
          }}>Fazer login</span>
        </p>
      </div>
      </section>

      {/* Seção da Área do Mentor */}
      <section id="mentor" className="section">
        <h2>🧩 Área do Mentor</h2>
        <p>
          Se você é mentor ou administrador, acesse o painel de controle para acompanhar o desempenho dos alunos,
          gerenciar mentorias e visualizar dados em tempo real.
        </p>
        <button onClick={() => navigate('/gestor')} className="section-button">
          Acessar painel de controle
        </button>
      </section>

      {/* Sobre nós */}
      <section id="sobre-nos" className="section">
        <h2>Sobre Nós</h2>
        <p>
          A <strong>MentorIA</strong> nasceu com a missão de democratizar o acesso à orientação vocacional usando tecnologia de ponta e inteligência artificial. 
          Nosso objetivo é conectar alunos e mentores de forma inteligente, promovendo o aprendizado e o crescimento pessoal de cada indivíduo.
        </p>
      </section>

      {/* Serviços */}
      <section id="servicos" className="section">
        <h2>Nossos Serviços</h2>
        <p>
          Oferecemos mentoria personalizada, dashboards interativos para mentores e IA de recomendação para orientar alunos no caminho ideal de aprendizado.
        </p>
      </section>

      {/* 📞 Contato */}
      <section id="contato" className="section">
        <h2>Contato</h2>
        <p>Quer fazer parte dessa revolução? Envie um e-mail para <strong>contato@mentoria.com</strong> ou fale conosco nas redes sociais.</p>
      </section>

      <footer className="footer">
        <p>© 2025 MentorIA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
