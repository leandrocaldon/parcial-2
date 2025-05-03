import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sólo se permite POST' });
  }
  const { category } = req.body;
  if (!category) {
    return res.status(400).json({ error: 'Falta la categoría' });
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Prompt para generar 5 preguntas y opciones
  const prompt = `Genera 5 preguntas de opción múltiple sobre ${category}. Para cada pregunta, dame la pregunta y 4 opciones (A, B, C, D), y dime cuál es la correcta. Responde en JSON así: 
  { 
    "questions": [
      { 
        "question": "Pregunta 1", 
        "options": ["Opción A", "Opción B", "Opción C", "Opción D"], 
        "answer": "A" 
      },
      { 
        "question": "Pregunta 2", 
        "options": ["Opción A", "Opción B", "Opción C", "Opción D"], 
        "answer": "B" 
      },
      ...y así hasta completar 5 preguntas
    ]
  }`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Eres un generador de preguntas de opción múltiple.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });
    // Intentar parsear el JSON devuelto
    const text = completion.choices[0].message.content;
    let data;
    // Extraer el primer bloque JSON del texto con regex
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({ error: 'No se encontró JSON en la respuesta de OpenAI', raw: text });
    }
    try {
      data = JSON.parse(match[0]);
    } catch {
      return res.status(500).json({ error: 'Error al interpretar respuesta de OpenAI', raw: text });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
