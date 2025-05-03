import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sólo se permite POST' });
  }
  const { user, category, question, options, selected, correct } = req.body;
  if (!user || !category || !question || !selected || !correct) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const isCorrect = selected === correct;
  const score = isCorrect ? 1 : 0;

  try {
    const client = await clientPromise;
    const db = client.db();
    await db.collection('scores').insertOne({
      user,
      category,
      question,
      options,
      selected,
      correct,
      score,
      isCorrect,
      timestamp: new Date()
    });
    res.status(200).json({ score, isCorrect });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
