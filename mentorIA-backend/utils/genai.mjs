import fetch from 'node-fetch';

export async function callGenAI(prompt) {
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + process.env.GENAI_API_KEY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { output };
  } catch (error) {
    console.error(' Erro na chamada da IA:', error);
    return { output: '' };
  }
}
