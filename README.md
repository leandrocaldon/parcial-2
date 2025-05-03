# Quiz App: Categorías con ChatGPT y MongoDB Atlas

## Descripción
Aplicación de preguntas y respuestas por categorías (moda, historia, ciencia, deporte, arte), usando la API de OpenAI para generar preguntas dinámicas y MongoDB Atlas para almacenar puntajes.

## Variables de entorno
Copia `.env.local.example` a `.env.local` y completa:

```
OPENAI_API_KEY=tu_clave_openai_aqui
MONGODB_URI=tu_uri_mongodb_atlas_aqui
```

## Instalación y uso local

```
yarn install # o npm install
# luego
yarn dev # o npm run dev
```

## Despliegue en Vercel
Solo haz push a tu repositorio y conecta con Vercel. Configura las mismas variables de entorno en el dashboard de Vercel.

---

## Estructura básica
- `/pages/index.js`: Interfaz principal
- `/pages/api/question.js`: Endpoint para generar preguntas
- `/pages/api/score.js`: Endpoint para guardar puntaje
- `/lib/mongodb.js`: Utilidad para conectar a MongoDB Atlas

## Notas
- Necesitas una clave de OpenAI y una URI de MongoDB Atlas.
- El sistema usa Next.js, ideal para Vercel.
