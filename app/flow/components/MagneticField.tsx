'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import MagneticCard from './MagneticCard';
import { Task } from '../types';
import { usePhysics } from '../hooks/usePhysics';

interface MagneticFieldProps {
  tasks: Task[];
  onToggleMode: () => void;
}

export default function MagneticField({ tasks, onToggleMode }: MagneticFieldProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { positions, handleDragEnd, applyGlobalForce } = usePhysics({
    tasks,
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
  });

  // Update viewport size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle global swipe (background drag)
  const handleBackgroundDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Apply force to all cards based on swipe velocity
    const force = 0.3;
    applyGlobalForce(info.velocity.x * force, info.velocity.y * force);
  };

  const handleCardTap = (id: string) => {
    setSelectedCardId(selectedCardId === id ? null : id);
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    urgent: tasks.filter(t => t.urgent && !t.completed).length,
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundColor: '#F8F6F3',
        perspective: '1200px',
      }}
    >
      {/* Background swipe area */}
      <motion.div
        drag
        dragMomentum
        dragElastic={0}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleBackgroundDrag}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          touchAction: 'none',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1A1A1A 1px, transparent 1px),
              linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </motion.div>

      {/* Header */}
      <div className="absolute top-8 left-8 right-8 z-10 pointer-events-none">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>
              MAGNETIC FLOW
            </h1>
            <p className="text-sm mt-1 opacity-50" style={{ color: '#1A1A1A' }}>
              Swipe background to move all cards • Drag individual cards • Tap to focus
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm font-bold" style={{ color: '#1A1A1A' }}>
            <div className="px-3 py-1 bg-white/80 backdrop-blur rounded shadow-sm">
              {stats.completed}/{stats.total} DONE
            </div>
            {stats.urgent > 0 && (
              <div className="px-3 py-1 bg-red-500/10 text-red-600 backdrop-blur rounded shadow-sm animate-pulse">
                {stats.urgent} URGENT
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Magnetic cards */}
      <div className="absolute inset-0 z-20" style={{ pointerEvents: 'none' }}>
        {tasks.map((task) => {
          const pos = positions.get(task.id);
          if (!pos) return null;

          return (
            <div key={task.id} style={{ pointerEvents: 'auto' }}>
              <MagneticCard
                task={task}
                position={{ x: pos.x, y: pos.y }}
                onDragEnd={handleDragEnd}
                onTap={handleCardTap}
                isSelected={selectedCardId === task.id}
              />
            </div>
          );
        })}
      </div>

      {/* Selected card details overlay */}
      {selectedCardId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-center justify-center"
          onClick={() => setSelectedCardId(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const task = tasks.find(t => t.id === selectedCardId);
              if (!task) return null;

              return (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="px-2 py-1 text-xs font-bold uppercase tracking-wide rounded"
                      style={{
                        backgroundColor: `${task.category === 'jobb' ? '#D97757' : task.category === 'familj' ? '#5B9AAA' : '#7BA05B'}20`,
                        color: task.category === 'jobb' ? '#D97757' : task.category === 'familj' ? '#5B9AAA' : '#7BA05B',
                      }}
                    >
                      {task.category}
                    </div>
                    <button
                      onClick={() => setSelectedCardId(null)}
                      className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>

                  <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                    {task.title}
                  </h2>

                  {task.description && (
                    <p className="text-sm opacity-70 mb-4" style={{ color: '#1A1A1A' }}>
                      {task.description}
                    </p>
                  )}

                  {(task.time || task.dueDate) && (
                    <div className="text-sm opacity-50 mb-4" style={{ color: '#1A1A1A' }}>
                      📅 {task.time || task.dueDate}
                    </div>
                  )}

                  {task.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1 opacity-50">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${task.progress}%`,
                            backgroundColor: task.category === 'jobb' ? '#D97757' : task.category === 'familj' ? '#5B9AAA' : '#7BA05B',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    className="w-full py-3 rounded-lg font-bold text-white transition-colors"
                    style={{
                      backgroundColor: task.category === 'jobb' ? '#D97757' : task.category === 'familj' ? '#5B9AAA' : '#7BA05B',
                    }}
                  >
                    {task.completed ? '✓ Completed' : 'Mark Complete'}
                  </button>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}

      {/* Mode toggle hint */}
      <div className="absolute bottom-8 right-8 bg-white/80 backdrop-blur text-xs font-bold px-3 py-2 rounded shadow-sm pointer-events-none">
        DOUBLE-TAP TO SWITCH MODE
      </div>
    </div>
  );
}
