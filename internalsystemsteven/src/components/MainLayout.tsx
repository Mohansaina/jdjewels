'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PlusCircle, Library, Sparkles } from 'lucide-react';
import SearchSection from './SearchSection';
import AddQASection from './AddQASection';
import LibrarySection from './LibrarySection';
import { Toaster, toast } from 'sonner';
import { seedDatabase } from '@/lib/actions';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState('search');
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    // Attempt to seed on first load if needed
    const doSeed = async () => {
      try {
        await seedDatabase();
      } catch (e) {
        console.error('Seed check failed', e);
      }
    };
    doSeed();
  }, []);

  const tabs = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'add', label: 'Add Q&A', icon: PlusCircle },
    { id: 'library', label: 'Library', icon: Library },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster position="top-center" richColors />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[100px] opacity-40" />
      </div>

      <header className="sticky top-0 z-50 w-full glass border-b premium-shadow">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              AnswerAssistant
            </h1>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-200">
              Demo Mode
            </span>
          </div>

          <nav className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <Icon size={18} className="relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {activeTab === 'search' && <SearchSection />}
            {activeTab === 'add' && <AddQASection onComplete={() => setActiveTab('library')} />}
            {activeTab === 'library' && <LibrarySection />}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <footer className="mt-auto py-8 text-center text-slate-400 text-sm">
        <p>&copy; 2024 Application Answer Assistant. Built for perfection.</p>
      </footer>
    </div>
  );
}
