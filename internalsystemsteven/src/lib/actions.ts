'use server';

import { query } from './db';
import { getEmbedding } from './openai';
import { revalidatePath } from 'next/cache';

export async function saveQA(formData: FormData) {
  const programName = formData.get('programName') as string;
  const question = formData.get('question') as string;
  const answer = formData.get('answer') as string;

  if (!programName || !question || !answer) {
    throw new Error('All fields are required');
  }

  const embedding = await getEmbedding(question);
  const embeddingString = `[${embedding.join(',')}]`;

  await query(
    'INSERT INTO qa_pairs (program_name, question, answer, question_embedding) VALUES ($1, $2, $3, $4)',
    [programName, question, answer, embeddingString]
  );

  revalidatePath('/');
  return { success: true };
}

export async function searchQA(question: string) {
  if (!question) return [];

  const embedding = await getEmbedding(question);
  const embeddingString = `[${embedding.join(',')}]`;

  // Cosine similarity search using pgvector
  // 1 - (embedding <=> question_embedding) is the cosine similarity
  const result = await query(
    `SELECT program_name, question, answer, 
     (1 - (question_embedding <=> $1::vector)) as similarity 
     FROM qa_pairs 
     ORDER BY similarity DESC 
     LIMIT 3`,
    [embeddingString]
  );

  return result.rows;
}

export async function deleteQA(id: number) {
  await query('DELETE FROM qa_pairs WHERE id = $1', [id]);
  revalidatePath('/');
  return { success: true };
}

export async function getAllQA() {
  const result = await query('SELECT id, program_name, question, answer, created_at FROM qa_pairs ORDER BY created_at DESC');
  return result.rows;
}

export async function seedDatabase() {
  // Check if already seeded
  const check = await query('SELECT count(*) FROM qa_pairs');
  if (parseInt(check.rows[0].count) > 0) return { skipped: true };

  const samples = [
    {
      program: 'Y Combinator',
      question: 'What does your company do?',
      answer: 'We build a semantic search tool for program applications, helping founders reuse their best answers across different grants and accelerators.'
    },
    {
      program: 'Techstars',
      question: 'Why you?',
      answer: 'Our team consists of second-time founders who have collectively raised $5M and been through 3 accelerator programs. we know the pain of repetitive applications.'
    },
    {
      program: 'Y Combinator',
      question: 'What is your unfair advantage?',
      Answer: 'We have proprietary access to historical application data and a custom fine-tuned model for founder-specific semantic matching.'
    },
    {
      program: 'A16Z CSS',
      question: 'How do you acquire customers?',
      answer: 'We target founders in pre-seed stages through community partnerships and a viral "share your application" feature.'
    },
    {
      program: 'Grants.gov',
      question: 'What is the impact of your project?',
      answer: 'By streamlining applications, we save founders 40+ hours per month, allowing them to focus more on product development and customer growth.'
    }
  ];

  for (const sample of samples) {
    const embedding = await getEmbedding(sample.question);
    const embeddingString = `[${embedding.join(',')}]`;
    await query(
      'INSERT INTO qa_pairs (program_name, question, answer, question_embedding) VALUES ($1, $2, $3, $4)',
      [sample.program, sample.question, sample.answer, embeddingString]
    );
  }

  revalidatePath('/');
  return { success: true };
}
