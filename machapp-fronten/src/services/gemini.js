const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-flash-lite-latest'
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

export const isGeminiConfigured = () => Boolean(API_KEY)

export const generateText = async (prompt) => {
  if (!API_KEY) {
    throw new Error('Falta configurar VITE_GEMINI_API_KEY en .env.local.')
  }

  const response = await fetch(
    `${ENDPOINT}/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    },
  )

  if (!response.ok) {
    throw new Error('No pudimos obtener una respuesta de Gemini.')
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('')

  if (!text) {
    throw new Error('Gemini no devolvió una respuesta válida.')
  }

  return text
}
