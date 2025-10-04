'use client';

import { useState } from 'react';
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
      {/* Magical organic background pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
        {/* Floating organic shapes */}
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, transparent 70%)',
            left: '10%',
            top: '20%',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(0,0,0,0.15) 0%, transparent 70%)',
            right: '15%',
            top: '40%',
          }}
          animate={{
            x: [0, -60, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0,0,0,0.18) 0%, transparent 70%)',
            left: '50%',
            bottom: '20%',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        {/* Organic mesh pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="organic-mesh" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 0 50 Q 50 20, 100 50 T 200 50" stroke="currentColor" fill="none" strokeWidth="1" opacity="0.3"/>
              <path d="M 50 0 Q 80 50, 50 100 T 50 200" stroke="currentColor" fill="none" strokeWidth="1" opacity="0.3"/>
              <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.4"/>
              <circle cx="150" cy="100" r="2" fill="currentColor" opacity="0.5"/>
              <circle cx="100" cy="150" r="2.5" fill="currentColor" opacity="0.4"/>
            </pattern>
          </defs>
          <motion.rect
            width="100%"
            height="100%"
            fill="url(#organic-mesh)"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
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

      {/* Tetris Grid - All cards visible side by side */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: idx * 0.1 }}
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
