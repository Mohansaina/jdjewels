'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Trash, Clipboard, ExternalLink, Filter, Search, MoreHorizontal } from 'lucide-react';
import { getAllQA, deleteQA } from '@/lib/actions';
import { toast } from 'sonner';

export default function LibrarySection() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await getAllQA();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteQA(id);
      setItems(items.filter((item) => item.id !== id));
      toast.success('Deleted successfully');
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.program_name.toLowerCase().includes(filter.toLowerCase()) ||
      item.question.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Your <span className="text-indigo-600">Library</span>
          </h2>
          <p className="text-slate-500 text-sm">
            You have {items.length} answers stored in your vault.
          </p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search your library..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium w-full md:w-80"
          />
        </div>
      </div>

      <div className="glass border border-slate-200 rounded-[32px] overflow-hidden premium-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/60">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Program</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Question</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      Loading your library...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-medium">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                          {item.program_name}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-md">
                          <p className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{item.question}</p>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.answer}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.answer);
                              toast.success('Answer copied!');
                            }}
                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Copy Answer"
                          >
                            <Clipboard size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
