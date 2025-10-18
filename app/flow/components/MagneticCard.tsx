'use client';

import { motion, PanInfo } from 'framer-motion';
import { Task } from '../types';

interface MagneticCardProps {
  task: Task;
  position: { x: number; y: number };
  onDragEnd: (id: string, info: PanInfo) => void;
  onTap: (id: string) => void;
  isSelected: boolean;
}

const CATEGORY_COLORS = {
  jobb: '#D97757',      // Terracotta
  familj: '#5B9AAA',    // Dusty blue
  hälsa: '#7BA05B',     // Sage green
};

export default function MagneticCard({
  task,
  position,
  onDragEnd,
  onTap,
  isSelected
}: MagneticCardProps) {
  // Isometric 3D effect based on elevation
  const elevation = task.urgent ? 12 : task.completed ? 2 : 6;
  const accentColor = CATEGORY_COLORS[task.category];

  return (
    <motion.div
      drag
      dragMomentum
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDragEnd={(e, info) => onDragEnd(task.id, info)}
      onTap={() => onTap(task.id)}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '200px',
        minHeight: '140px',
        cursor: 'grab',
        x: position.x,
        y: position.y,
      }}
      animate={{
        x: position.x,
        y: position.y,
        scale: isSelected ? 1.05 : 1,
        rotateX: isSelected ? 0 : -2,
        rotateY: isSelected ? 0 : 2,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 25,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.15 }
      }}
      whileTap={{
        scale: 0.98,
      }}
      className="select-none"
    >
      {/* Card body - paper texture */}
      <div
        className="relative bg-white rounded-lg p-4 shadow-lg"
        style={{
          boxShadow: isSelected
            ? `0 ${elevation * 2}px ${elevation * 3}px rgba(0,0,0,0.15), 0 0 0 2px ${accentColor}`
            : `0 ${elevation}px ${elevation * 1.5}px rgba(0,0,0,0.08)`,
          borderLeft: `4px solid ${accentColor}`,
          transform: `translateZ(${elevation}px) rotateX(-2deg) rotateY(2deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Category badge */}
        <div
          className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide mb-2 rounded"
          style={{
            backgroundColor: `${accentColor}20`,
            color: accentColor,
          }}
        >
          {task.category}
        </div>

        {/* Task title */}
        <h3
          className={`text-sm font-semibold leading-tight mb-2 ${
            task.completed ? 'line-through opacity-60' : ''
          }`}
          style={{ color: '#1A1A1A' }}
        >
          {task.title}
        </h3>

        {/* Time or due date */}
        {(task.time || task.dueDate) && (
          <div className="text-xs opacity-50 mb-1" style={{ color: '#1A1A1A' }}>
            {task.time || task.dueDate}
          </div>
        )}

        {/* Urgent indicator */}
        {task.urgent && !task.completed && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}

        {/* Completion checkbox */}
        <div className="absolute bottom-3 right-3">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed ? 'bg-current' : 'bg-transparent'
            }`}
            style={{
              borderColor: accentColor,
              color: accentColor,
            }}
          >
            {task.completed && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Progress bar (if exists) */}
        {task.progress !== undefined && task.progress > 0 && (
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${task.progress}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
