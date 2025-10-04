'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import { useTasks } from '../hooks/useTasks';
import { Category } from '../types';

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
      {/* Simplified background pattern - mobile optimized */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0,0,0,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 70%, rgba(0,0,0,0.08) 0%, transparent 50%)`,
          }}
        />
      </div>
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
      </div>

      {/* Tetris Grid - Simple and fast */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.2 }}
              onHoverStart={() => setActiveCategory(task.category)}
              onHoverEnd={() => setActiveCategory(null)}
              onTouchStart={() => setActiveCategory(task.category)}
              onTouchEnd={() => setActiveCategory(null)}
            >
              <TaskCard task={task} />
            </motion.div>
          ))}
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
