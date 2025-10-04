'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import { useTasks } from '../hooks/useTasks';

interface FlowModeProps {
  onToggleMode: () => void;
}

export default function FlowMode({ onToggleMode }: FlowModeProps) {
  const [currentDay, setCurrentDay] = useState(0); // -1 = yesterday, 0 = today, 1 = tomorrow
  const { tasks, loading } = useTasks(currentDay);

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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-[#2C3E50] text-4xl font-black">LOADING...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-6 md:p-12 overflow-hidden bg-[#F5F5F5]"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100) handleSwipe('right');
        if (info.offset.x < -100) handleSwipe('left');
      }}
    >
      {/* Header - Clean geometric */}
      <div className="text-center mb-12">
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
          {currentDay > -1 && '← SWIPE IGÅR '}
          {currentDay < 1 && ' SWIPE IMORGON →'}
        </motion.p>
      </div>

      {/* Tetris Grid - All cards visible side by side */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <TaskCard task={task} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="text-center text-[#2C3E50]/40 mt-20">
          <p className="text-2xl font-black">✨ INGA UPPGIFTER {getDayLabel().toUpperCase()}</p>
          <p className="text-sm mt-2 font-bold">SWIPE FÖR ANDRA DAGAR</p>
        </div>
      )}
    </motion.div>
  );
}
