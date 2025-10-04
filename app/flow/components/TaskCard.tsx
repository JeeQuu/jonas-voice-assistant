'use client';

import { motion } from 'framer-motion';
import { Task } from '../types';
import { getCategoryStyle } from '../utils/categoryStyles';

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  simple?: boolean;
}

export default function TaskCard({ task, onComplete, simple = false }: TaskCardProps) {
  const style = getCategoryStyle(task.category);

  const handleTap = () => {
    if (onComplete) {
      onComplete(task.id);
    }
  };

  if (simple) {
    // Simple version for FOCUS mode
    return (
      <motion.div
        className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10"
        whileTap={{ scale: 0.98 }}
        onClick={handleTap}
      >
        <div className={`w-6 h-6 rounded-full border-2 ${style.borderColor} ${task.completed ? style.bg : ''}`} />
        <div className="flex-1">
          <p className={`text-white ${task.completed ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </p>
          {task.time && (
            <p className="text-white/40 text-sm">{task.time}</p>
          )}
        </div>
        {task.urgent && !task.completed && (
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        )}
      </motion.div>
    );
  }

  // Full FLOW mode card - Flat puzzle piece style
  return (
    <motion.div
      className="relative max-w-md mx-auto cursor-grab active:cursor-grabbing"
      drag
      dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
      dragElastic={0.1}
      whileHover={{ scale: 1.05, rotate: 2 }}
      whileTap={{ scale: 0.95, rotate: -2 }}
      onClick={handleTap}
    >
      <div
        className={`relative p-6 ${style.bg} border-4 ${style.borderColor} overflow-hidden`}
        style={{
          boxShadow: '8px 8px 0px rgba(0,0,0,0.3)', // Flat shadow like in image
        }}
      >
        {/* BIG Geometric Pattern - covers whole card */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${style.pattern}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.8
          }}
        />

        {/* Content overlay */}
        <div className="relative z-10">
          {/* Category Badge - geometric block */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold px-4 py-2 ${style.badgeBg} ${style.textColor} border-2 border-white`}>
              {task.category.toUpperCase()}
            </span>
            {task.urgent && (
              <div className="w-4 h-4 bg-red-500 border-2 border-white" />
            )}
          </div>

          {/* Title - Bold and clear */}
          <h3 className="text-2xl font-black text-white mb-2 drop-shadow-lg">
            {task.title}
          </h3>

          {/* Time */}
          {task.time && (
            <p className="text-white font-bold text-lg mb-2 drop-shadow-md">
              {task.time}
            </p>
          )}

          {task.description && (
            <p className="text-white/90 text-sm font-medium drop-shadow-md">
              {task.description}
            </p>
          )}

          {/* Progress bar - geometric */}
          {task.progress !== undefined && (
            <div className="mt-4">
              <div className="h-3 bg-white/30 border-2 border-white overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-white font-bold text-xs mt-1">{task.progress}%</p>
            </div>
          )}

          {/* Drag hint */}
          <div className="mt-4 text-white/60 text-xs font-bold">
            DRAG TO MOVE
          </div>
        </div>
      </div>
    </motion.div>
  );
}
