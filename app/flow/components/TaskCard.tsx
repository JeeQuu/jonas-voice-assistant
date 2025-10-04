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
        className="flex items-center gap-4 p-4 bg-white/10 border-2 border-white/20 cursor-pointer hover:bg-white/15 transition-colors"
        whileTap={{ scale: 0.98 }}
        onClick={handleTap}
      >
        <div className={`w-8 h-8 border-4 flex items-center justify-center flex-shrink-0 ${
          task.completed
            ? `${style.bg} ${style.borderColor}`
            : `bg-transparent border-white/40`
        }`}>
          {task.completed && (
            <div className="w-4 h-2 border-l-4 border-b-4 border-white transform rotate-[-45deg] translate-y-[-2px]"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-white font-bold ${task.completed ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-white/50 text-sm font-medium truncate">{task.description}</p>
          )}
          {task.time && (
            <p className="text-white/60 text-sm font-bold mt-1">{task.time}</p>
          )}
        </div>
        {task.urgent && !task.completed && (
          <div className="w-4 h-4 bg-red-500 border-2 border-white flex-shrink-0 animate-pulse" />
        )}
      </motion.div>
    );
  }

  // Full FLOW mode card - Flat tetris block style
  return (
    <motion.div
      className="relative cursor-pointer h-full"
      whileTap={{ scale: 0.98 }}
      onClick={handleTap}
    >
      <div
        className={`relative p-5 ${style.bg} border-4 ${style.borderColor} overflow-hidden h-full flex flex-col`}
        style={{
          boxShadow: '6px 6px 0px rgba(0,0,0,0.3)',
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
            <div className="mt-auto pt-3">
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
        </div>
      </div>
    </motion.div>
  );
}
