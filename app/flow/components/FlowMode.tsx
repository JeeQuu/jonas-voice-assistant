'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import { useTasks } from '../hooks/useTasks';
import { Category } from '../types';
import { DailyBriefing } from './DailyBriefing';

interface FlowModeProps {
  onToggleMode: () => void;
}

export default function FlowMode({ onToggleMode }: FlowModeProps) {
  const [currentDay, setCurrentDay] = useState(0); // -1 = yesterday, 0 = today, 1 = tomorrow
  const { tasks, loading } = useTasks(currentDay);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentDay < 1) {
      setCurrentDay(currentDay + 1); // Tomorrow
    } else if (direction === 'right' && currentDay > -1) {
      setCurrentDay(currentDay - 1); // Yesterday
    }
  };

  const getDayLabel = () => {
    if (currentDay === -1) return 'Igår';
    if (currentDay === 0) return 'Idag';
    if (currentDay === 1) return 'Imorgon';
    return '';
  };

  const getDateLabel = () => {
    const date = new Date();
    date.setDate(date.getDate() + currentDay);
    return date.toLocaleDateString('sv-SE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getBackgroundColor = () => {
    if (activeCategory === 'jobb') return '#FFB89D'; // Lighter warm orange
    if (activeCategory === 'familj') return '#B4E4FF'; // Lighter sky blue
    if (activeCategory === 'hälsa') return '#7C98B3'; // Lighter steel blue
    return '#F5F5F5'; // Default off-white
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-[#2C3E50] text-4xl font-black">LOADING...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-6 md:p-12 overflow-hidden relative"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100) handleSwipe('right');
        if (info.offset.x < -100) handleSwipe('left');
      }}
      animate={{ backgroundColor: getBackgroundColor() }}
      transition={{ duration: 0.5 }}
    >
      {/* 3D Grid Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(90deg, rgba(44,62,80,0.1) 1px, transparent 1px),
              linear-gradient(0deg, rgba(44,62,80,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(800px) rotateX(60deg) scale(2)',
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Floating depth layers */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-30 animate-float-slow"
             style={{
               background: 'radial-gradient(circle, rgba(44,62,80,0.4) 0%, transparent 70%)',
               left: '10%',
               top: '20%',
               transform: 'translate3d(0,0,0)',
             }}
        />
        <div className="absolute w-80 h-80 opacity-20 animate-float-medium"
             style={{
               background: 'radial-gradient(circle, rgba(44,62,80,0.3) 0%, transparent 70%)',
               right: '15%',
               top: '40%',
               transform: 'translate3d(0,0,0)',
             }}
        />
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(60px, -40px, 0); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-40px, 60px, 0); }
        }
        .animate-float-slow {
          animation: float-slow 25s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 20s ease-in-out infinite;
        }
      `}</style>
      {/* Header - Clean geometric */}
      <div className="text-center mb-12 relative z-10">
        <motion.h1
          className="text-6xl md:text-8xl font-black text-[#2C3E50] mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {getDayLabel()}
        </motion.h1>
        <motion.p
          className="text-[#2C3E50]/60 text-xl md:text-2xl capitalize font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {getDateLabel()}
        </motion.p>
        <motion.p
          className="text-[#2C3E50]/40 text-sm mt-2 font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {currentDay > -1 && 'SWIPE IGÅR '}
          {currentDay < 1 && ' SWIPE IMORGON'}
        </motion.p>

        {/* Daily Briefing Button - Only show for today */}
        {currentDay === 0 && (
          <motion.div
            className="mt-6 flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DailyBriefing tasks={tasks} />
          </motion.div>
        )}
      </div>

      {/* 3D Grid with depth layers */}
      <div className="max-w-7xl mx-auto relative z-10 pb-32" style={{ perspective: '1200px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, idx) => {
            // Depth based on category: jobb (front), familj (mid), hälsa (back)
            const depth = task.category === 'jobb' ? 40 : task.category === 'familj' ? 20 : 0;

            // Subtle floating per card
            const floatOffset = idx * 2; // Offset animation per card

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20, z: -50 }}
                animate={{
                  opacity: 1,
                  y: [0, -8, 0], // Continuous gentle float
                  z: depth,
                }}
                transition={{
                  opacity: { delay: idx * 0.08, duration: 0.4 },
                  y: {
                    delay: floatOffset,
                    duration: 3 + (idx % 3), // Varied duration per card
                    repeat: Infinity,
                    ease: 'easeInOut'
                  },
                  z: { delay: idx * 0.08, duration: 0.4, type: 'spring', stiffness: 100 }
                }}
                onHoverStart={() => setActiveCategory(task.category)}
                onHoverEnd={() => setActiveCategory(null)}
                onTouchStart={() => setActiveCategory(task.category)}
                onTouchEnd={() => setActiveCategory(null)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <TaskCard task={task} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="text-center text-[#2C3E50]/40 mt-20 relative z-10">
          <p className="text-2xl font-black">INGA UPPGIFTER {getDayLabel().toUpperCase()}</p>
          <p className="text-sm mt-2 font-bold">SWIPE FÖR ANDRA DAGAR</p>
        </div>
      )}
    </motion.div>
  );
}
