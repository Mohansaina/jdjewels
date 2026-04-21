'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Target, Hash, Quote } from 'lucide-react';
import { searchQA } from '@/lib/actions';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SearchSection() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await searchQA(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          What are they <span className="text-indigo-600">asking</span> you?
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Paste the new application question below. We'll find your most relevant past answers using semantic intelligence.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
        <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-10 group-focus-within:opacity-20 transition-opacity" />
        <div className="relative glass border border-slate-200 p-2 rounded-2xl flex items-center gap-2 group-focus-within:border-indigo-300 transition-colors">
          <div className="pl-4 text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Describe your target market and growth strategy..."
            className="flex-1 bg-transparent px-2 py-4 outline-none text-slate-700 placeholder:text-slate-400 font-medium"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 active:scale-95"
          >
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Target size={20} />}
            {isSearching ? 'Searching...' : 'Find Matches'}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider pl-1">
                <SparklesIcon className="w-4 h-4 text-indigo-500" />
                Best Semantic Matches
              </div>
              {results.map((result, index) => (
                <ResultCard key={index} result={result} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {results.length === 0 && !isSearching && query && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
            Click "Find Matches" to see results
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ result, index }: { result: any; index: number }) {
  const score = Math.round(result.similarity * 100);
  
  const badgeStyles = score >= 85 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
    : score >= 70 
    ? 'bg-amber-50 text-amber-700 border-amber-100'
    : 'bg-slate-50 text-slate-700 border-slate-100';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white border border-slate-200 p-8 rounded-3xl premium-shadow hover:border-indigo-200 transition-all hover:translate-y-[-4px]"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", badgeStyles)}>
              {score}% Match
            </span>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {result.program_name}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <Hash className="text-indigo-400 shrink-0 mt-1" size={16} />
              <h3 className="font-bold text-slate-800 text-lg leading-snug">
                {result.question}
              </h3>
            </div>
            <div className="flex gap-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 ring-1 ring-slate-200/50">
              <Quote className="text-slate-300 shrink-0 mt-1" size={16} />
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {result.answer}
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => {
            navigator.clipboard.writeText(result.answer);
            // toast handle would be good here but sonner is in MainLayout level
          }}
          className="md:w-32 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          Copy
        </button>
      </div>
    </motion.div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
