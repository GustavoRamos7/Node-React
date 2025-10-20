// src/utils/genai.js
export async function callGenAI(prompt) {
    try {
      const res = await fetch('http://localhost:3001/api/genai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Erro ao chamar API GenAI:', error);
      return null;
    }
  }
  