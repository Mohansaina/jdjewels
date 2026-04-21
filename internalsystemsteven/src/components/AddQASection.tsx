'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, CheckCircle2, ChevronRight, BookOpen, HelpCircle, MessageSquare } from 'lucide-react';
import { saveQA } from '@/lib/actions';
import { toast } from 'sonner';

export default function AddQASection({ onComplete }: { onComplete: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      await saveQA(formData);
      toast.success('Stored successfully!', {
        description: 'Question embedding generated and saved.',
      });
      onComplete();
    } catch (error) {
      toast.error('Failed to save', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Add to your <span className="text-indigo-600">Knowledge Base</span>
        </h2>
        <p className="text-slate-500 max-w-sm mx-auto">
          Capture your best application answers. We'll index them automatically.
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="glass border border-slate-200 p-10 rounded-[32px] premium-shadow space-y-8"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
              <BookOpen size={16} className="text-indigo-500" />
              Program Name
            </label>
            <input
              name="programName"
              required
              placeholder="e.g. Y Combinator Summer 2024"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
              <HelpCircle size={16} className="text-indigo-500" />
              The Question
            </label>
            <textarea
              name="question"
              required
              rows={3}
              placeholder="What question were you asked?"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
              <MessageSquare size={16} className="text-indigo-500" />
              Your Best Answer
            </label>
            <textarea
              name="answer"
              required
              rows={6}
              placeholder="Tell them something great..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium leading-relaxed"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-slate-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Generating Embeddings...
            </>
          ) : (
            <>
              <Plus size={20} />
              Save to Library
              <ChevronRight size={18} className="ml-auto opacity-40" />
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}
