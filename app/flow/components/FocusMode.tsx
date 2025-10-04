'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { useTasks } from '../hooks/useTasks';

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
    <div className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎯 FOCUS
        </motion.h1>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-white/60 text-sm mb-2">
            <span>{completedCount} / {totalCount} klara</span>
            <span>{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {f === 'all' && 'Alla'}
              {f === 'active' && 'Aktiva'}
              {f === 'completed' && 'Klara'}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="max-w-2xl mx-auto space-y-3">
        <AnimatePresence>
          {filteredTasks.map((task, index) => (
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

        {/* Empty state */}
        {filteredTasks.length === 0 && (
          <div className="text-center text-white/40 py-20">
            <p className="text-2xl mb-2">
              {filter === 'active' && '🎉 Inga aktiva uppgifter!'}
              {filter === 'completed' && '📝 Inga klara uppgifter än'}
              {filter === 'all' && '✨ Inga uppgifter idag'}
            </p>
            <p className="text-sm">
              {filter === 'active' && 'Bra jobbat!'}
              {filter === 'completed' && 'Börja checka av saker'}
              {filter === 'all' && 'Chill dag?'}
            </p>
          </div>
        )}
      </div>

      {/* Add task button */}
      <motion.button
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white text-3xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        +
      </motion.button>
    </div>
  );
}
