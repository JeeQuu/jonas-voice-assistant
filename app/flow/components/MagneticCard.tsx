'use client';

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
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
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  // Isometric 3D effect based on elevation
  const elevation = task.urgent ? 12 : task.completed ? 2 : 6;
  const rotateX = useTransform(y, [0, 400], [2, -2]);
  const rotateY = useTransform(x, [0, 400], [-2, 2]);

  const accentColor = CATEGORY_COLORS[task.category];

  return (
    <motion.div
      drag
      dragMomentum
      dragElastic={0.1}
      dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
      onDragEnd={(e, info) => onDragEnd(task.id, info)}
      onTap={() => onTap(task.id)}
      initial={{ x: position.x, y: position.y, scale: 0.8, opacity: 0 }}
      animate={{
        x: position.x,
        y: position.y,
        scale: isSelected ? 1.1 : 1,
        opacity: task.completed ? 0.5 : 1,
        z: isSelected ? 50 : elevation,
        rotateX: isSelected ? 0 : rotateX,
        rotateY: isSelected ? 0 : rotateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 1,
      }}
      whileHover={{
        scale: 1.02,
        z: elevation + 4,
        transition: { duration: 0.2 }
      }}
      style={{
        position: 'absolute',
        width: '200px',
        minHeight: '140px',
        cursor: 'grab',
        transformStyle: 'preserve-3d',
        perspective: 1000,
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
          transform: `translateZ(${elevation}px)`,
          borderLeft: `4px solid ${accentColor}`,
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

      {/* Isometric shadow plane */}
      <div
        className="absolute inset-0 rounded-lg -z-10 blur-md opacity-20"
        style={{
          backgroundColor: accentColor,
          transform: `translateZ(-${elevation}px) scale(0.95)`,
        }}
      />
    </motion.div>
  );
}
