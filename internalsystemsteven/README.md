# 🚀 Application Answer Assistant

A premium semantic search system for reusing your best program application answers. Built with **Next.js 14**, **pgvector**, and **OpenAI Embeddings**.

## ✨ Features

- **Semantic Intelligence**: Finds answers based on meaning, not just keywords.
- **Premium UI**: Glassmorphism design, Framer Motion animations, and a sleek modern aesthetic.
- **Vector Search**: Uses `pgvector` for efficient cosine similarity calculations.
- **Smart Library**: Manage and delete your historical application data effortlessly.
- **Auto-Seeding**: Comes pre-populated with startup accelerator Q&A samples.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: PostgreSQL with `pgvector`
- **AI**: OpenAI `text-embedding-3-small`
- **Database Driver**: `pg`

## ⚙️ Setup Instructions

### 1. Database Setup

Ensure your Postgres instance has `pgvector` enabled. Run these SQL commands:

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the table
CREATE TABLE qa_pairs (
  id SERIAL PRIMARY KEY,
  program_name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  question_embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optimization Index (optional for small datasets, recommended for large)
CREATE INDEX ON qa_pairs USING ivfflat (question_embedding vector_cosine_ops);
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgres://user:password@host:port/database
OPENAI_API_KEY=sk-...
```

### 3. Installation & Run

```bash
npm install
npm run dev
```

## 📐 Architecture

- **Server Actions**: All DB operations and OpenAI calls are handled via secure Next.js Server Actions (`src/lib/actions.ts`).
- **Responsive Design**: Fully optimized for desktop and mobile devices.
- **Loading States**: Crystal-clear feedback during embedding generation and search.

---
Built with perfection by Antigravity.
