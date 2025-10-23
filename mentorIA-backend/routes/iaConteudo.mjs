import { callGenAI } from '../utils/genai.mjs';

export default async function gerarConteudoSugerido({ titulo, estilo_aprendizagem, interesses, nivel_carreira }) {
    const prompt = `
    Sou um aluno que vai iniciar a trilha "${titulo}".
    Meu estilo de aprendizagem é: ${estilo_aprendizagem}.
    Meus interesses são: ${interesses}.
    Meu nível de carreira é: ${nivel_carreira}.
    
    Gere um conteúdo sugerido com até 6 blocos, cada um com:
    - Tipo (Aula, Desafio, Dica, Curiosidade, Ferramenta)
    - Título curto e envolvente
    - Texto explicativo com até 3 frases
    - Sugira ações práticas, interações digitais, ferramentas online ou atividades criativas
    - Evite sugerir PDFs ou materiais estáticos. Prefira experiências, desafios, ferramentas interativas ou sites com recursos dinâmicos.
    
    ⚠️ IMPORTANTE: Retorne a resposta como um array JSON **válido**, sem explicações, sem texto extra, sem Markdown. Apenas o array JSON puro.
    
    Exemplo:
    [
      {
        "tipo": "Desafio",
        "titulo": "Fotografe o invisível",
        "texto": "Saia para fotografar padrões escondidos no seu bairro. Use ângulos incomuns e compartilhe seu resultado em uma galeria online.",
        "link": "https://unsplash.com"
      },
      ...
    ]
    `;
    
    
    

  const resposta = await callGenAI(prompt);

  try {
    const json = JSON.parse(resposta.output);
    return Array.isArray(json) ? json : [];
  } catch (err) {
    console.error('Erro ao interpretar resposta da IA:', err);
    return [];
  }
}
