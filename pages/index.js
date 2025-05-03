import { useState } from 'react';

const categories = [
  { key: 'moda', label: 'Moda' },
  { key: 'historia', label: 'Historia' },
  { key: 'ciencia', label: 'Ciencia' },
  { key: 'deporte', label: 'Deporte' },
  { key: 'arte', label: 'Arte' },
];

export default function Home() {
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [user, setUser] = useState('anonimo');
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [sessionSaved, setSessionSaved] = useState(false);

  const getQuestions = async (cat) => {
    setLoading(true);
    setResults([]);
    setSelected(null);
    setCategory(cat);
    setCurrentQuestionIndex(0);
    setFinalScore(null);
    
    const res = await fetch('/api/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat }),
    });
    const data = await res.json();
    
    if (data.questions && Array.isArray(data.questions)) {
      setQuestions(data.questions);
    } else if (data.question) {
      // Compatibilidad con formato anterior de una sola pregunta
      setQuestions([data]);
    } else {
      console.error('Formato de respuesta inesperado:', data);
    }
    
    setLoading(false);
  };

  const sendAnswer = async () => {
    if (!selected) return;
    
    setLoading(true);
    const currentQuestion = questions[currentQuestionIndex];
    
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user,
        category,
        question: currentQuestion.question,
        options: currentQuestion.options,
        selected,
        correct: currentQuestion.answer,
      }),
    });
    const data = await res.json();
    
    // Guardar resultado de esta pregunta
    const newResults = [...results, {
      question: currentQuestion.question,
      selected,
      correct: currentQuestion.answer,
      isCorrect: data.isCorrect,
      score: data.score
    }];
    setResults(newResults);
    
    // Avanzar a la siguiente pregunta o mostrar resultados finales
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelected(null);
    } else {
      // Calcular puntaje final
      const totalScore = newResults.reduce((sum, result) => sum + result.score, 0);
      setFinalScore(totalScore);
      
      // Guardar la sesión completa en MongoDB
      try {
        const sessionRes = await fetch('/api/save-quiz-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user,
            category,
            questions,
            results: newResults,
            totalScore
          }),
        });
        const sessionData = await sessionRes.json();
        setSessionSaved(true);
        console.log('Sesión guardada:', sessionData);
      } catch (error) {
        console.error('Error al guardar sesión:', error);
      }
    }
    
    setLoading(false);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Quiz de Categorías</h1>
      <div style={{ marginBottom: 16 }}>
        <label>Usuario: </label>
        <input value={user} onChange={e => setUser(e.target.value)} placeholder="Tu nombre" />
      </div>
      
      {!category && (
        <div>
          <h2>Elige una categoría:</h2>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => getQuestions(cat.key)}
              style={{ margin: 8, padding: '8px 16px', fontSize: 18 }}
              disabled={loading}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
      
      {loading && <p>Cargando...</p>}
      
      {currentQuestion && !finalScore && (
        <div>
          <h2>Pregunta {currentQuestionIndex + 1} de {questions.length}</h2>
          <h3>{currentQuestion.question}</h3>
          <div>
            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
              <div key={idx} style={{ margin: '10px 0', padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="option"
                    value={String.fromCharCode(65 + idx)}
                    checked={selected === String.fromCharCode(65 + idx)}
                    onChange={() => setSelected(String.fromCharCode(65 + idx))}
                    disabled={loading}
                    style={{ marginRight: '10px' }}
                  />
                  <span><strong>{String.fromCharCode(65 + idx)}.</strong> {opt}</span>
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={sendAnswer}
            disabled={!selected || loading}
            style={{ marginTop: 16, padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Siguiente pregunta' : 'Ver resultados'}
          </button>
        </div>
      )}
      
      {finalScore !== null && (
        <div style={{ marginTop: 24 }}>
          <h2>Resultados finales</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Puntaje total: {finalScore} de {questions.length}</p>
          
          {sessionSaved && (
            <p style={{ color: 'green', fontWeight: 'bold' }}>
              ✓ Sesión guardada en la base de datos
            </p>
          )}
          
          <h3>Detalle de respuestas:</h3>
          {results.map((result, idx) => (
            <div key={idx} style={{ 
              margin: '10px 0', 
              padding: '12px', 
              borderRadius: '4px',
              backgroundColor: result.isCorrect ? '#e8f5e9' : '#ffebee'
            }}>
              <p><strong>Pregunta {idx + 1}:</strong> {result.question}</p>
              <p>Tu respuesta: {result.selected} - {result.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}</p>
              {!result.isCorrect && <p>Respuesta correcta: {result.correct}</p>}
            </div>
          ))}
          
          <button
            onClick={() => {
              setCategory(null);
              setQuestions([]);
              setResults([]);
              setFinalScore(null);
              setSessionSaved(false);
            }}
            style={{ marginTop: 16, padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Volver a categorías
          </button>
        </div>
      )}
    </div>
  );
}
