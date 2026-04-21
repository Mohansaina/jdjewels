import { Pool } from 'pg';

const dbUrl = process.env.DATABASE_URL;
const pool = dbUrl ? new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
}) : null;

// Mock database for demo mode
let mockDb: any[] = [];

export async function query(text: string, params?: any[]) {
  if (!pool) {
    console.warn('DATABASE_URL not found. Using in-memory mock database for demo.');
    return handleMockQuery(text, params);
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Error executing query', { text, err });
    throw err;
  }
}

async function handleMockQuery(text: string, params?: any[]): Promise<any> {
  const t = text.toLowerCase();
  
  if (t.includes('insert into qa_pairs')) {
    const [pn, q, a, e] = params || [];
    const newRow = { 
      id: mockDb.length + 1, 
      program_name: pn, 
      question: q, 
      answer: a, 
      question_embedding: JSON.parse(e),
      created_at: new Date() 
    };
    mockDb.push(newRow);
    return { rowCount: 1, rows: [newRow] };
  }
  
  if (t.includes('select') && t.includes('similarity')) {
    // Basic mock similarity: dot product (since our mock embeddings are random-ish but deterministic)
    const targetEmbedding = JSON.parse(params?.[0] || '[]');
    const scored = mockDb.map(row => {
      const sim = calculateSimilarity(row.question_embedding, targetEmbedding);
      return { ...row, similarity: sim };
    }).sort((a, b) => b.similarity - a.similarity).slice(0, 3);
    
    return { rows: scored, rowCount: scored.length };
  }
  
  if (t.includes('select id, program_name')) {
    return { rows: [...mockDb].reverse(), rowCount: mockDb.length };
  }

  if (t.includes('select count(*)')) {
    return { rows: [{ count: mockDb.length.toString() }] };
  }

  if (t.includes('delete from qa_pairs')) {
    const id = params?.[0];
    mockDb = mockDb.filter(r => r.id !== id);
    return { rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

function calculateSimilarity(v1: number[], v2: number[]): number {
  if (!v1 || !v2) return 0;
  // Very simple cosine similarity mock
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    mag1 += v1[i] * v1[i];
    mag2 += v2[i] * v2[i];
  }
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2)) || 0;
}

export default pool;
