'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { useTasks } from '../hooks/useTasks';
import { soundEffects } from '../utils/soundEffects';

interface FocusModeProps {
  onToggleMode: () => void;
}

export default function FocusMode({ onToggleMode }: FocusModeProps) {
  const { tasks, loading, markComplete } = useTasks(0);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    return task.completed;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 bg-[#2C3E50]">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <motion.h1
          className="text-4xl md:text-6xl font-black text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          FOCUS
        </motion.h1>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-white/70 text-sm font-bold mb-2">
            <span>{completedCount} / {totalCount} klara</span>
            <span>{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
          </div>
          <div className="h-4 bg-white/10 border-2 border-white/30 overflow-hidden">
            <motion.div
              className="h-full bg-[#87CEEB]"
              initial={{ width: 0 }}
              animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 border-2 text-sm font-black transition ${
                filter === f
                  ? 'bg-white text-[#2C3E50] border-white'
                  : 'bg-transparent text-white border-white/30 hover:border-white/60'
              }`}
            >
              {f === 'all' && 'ALLA'}
              {f === 'active' && 'AKTIVA'}
              {f === 'completed' && 'KLARA'}
            </button>
          ))}
        </div>
      </div>

      {/* Task List - Grouped by category */}
      <div className="max-w-2xl mx-auto space-y-6">
        {['jobb', 'familj', 'hälsa'].map(category => {
          const categoryTasks = filteredTasks.filter(t => t.category === category);
          if (categoryTasks.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="text-white font-black text-lg mb-3 uppercase">
                {category === 'jobb' && 'Jobb'}
                {category === 'familj' && 'Familj'}
                {category === 'hälsa' && 'Hälsa'}
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {categoryTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TaskCard
                        task={task}
                        simple
                        onComplete={markComplete}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filteredTasks.length === 0 && (
          <div className="text-center text-white/50 py-20">
            <p className="text-3xl font-black mb-2">
              {filter === 'active' && 'INGA AKTIVA UPPGIFTER'}
              {filter === 'completed' && 'INGA KLARA UPPGIFTER ÄN'}
              {filter === 'all' && 'INGA UPPGIFTER IDAG'}
            </p>
            <p className="text-sm font-bold">
              {filter === 'active' && 'BRA JOBBAT'}
              {filter === 'completed' && 'BÖRJA CHECKA AV SAKER'}
              {filter === 'all' && 'CHILL DAG'}
            </p>
          </div>
        )}
      </div>

      {/* Add task button */}
      <motion.button
        className="fixed bottom-20 right-8 w-14 h-14 bg-[#87CEEB] border-4 border-white shadow-lg flex items-center justify-center text-[#2C3E50] text-3xl font-black"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        +
      </motion.button>
    </div>
  );
}
