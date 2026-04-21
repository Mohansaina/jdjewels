import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

/**
 * Generates a mock embedding for demo purposes.
 * Returns a 1536-dimensional vector based on the hash of the text.
 */
function getMockEmbedding(text: string): number[] {
  const embedding = new Array(1536).fill(0);
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  for (let i = 0; i < 1536; i++) {
    embedding[i] = Math.sin(hash + i) * 0.5;
  }
  return embedding;
}

export async function getEmbedding(text: string) {
  if (!openai) {
    console.warn('OPENAI_API_KEY not found. Using mock embedding for demo.');
    return getMockEmbedding(text);
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' '),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback to mock in case of API failure for demo stability
    return getMockEmbedding(text);
  }
}
