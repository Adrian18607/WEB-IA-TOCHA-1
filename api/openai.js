export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'No se recibió la pregunta' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Eres un profesor experto que ayuda a estudiantes a resolver tareas explicando paso a paso de forma clara y breve.'
          },
          {
            role: 'user',
            content: question
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.status(200).json({ answer: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error interno' });
  }
}
