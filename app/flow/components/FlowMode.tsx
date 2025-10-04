'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import TaskCard from './TaskCard';
import { Task, Category } from '../types';
import { useTasks } from '../hooks/useTasks';

interface FlowModeProps {
  onToggleMode: () => void;
}

export default function FlowMode({ onToggleMode }: FlowModeProps) {
  const [currentDay, setCurrentDay] = useState(0); // -1 = yesterday, 0 = today, 1 = tomorrow
  const { tasks, loading } = useTasks(currentDay);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

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

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<Category, Task[]>);

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

      {/* Parallax Cards Container */}
      <div className="relative max-w-5xl mx-auto">
        {/* Jobb - Depth 1 (front) */}
        {groupedTasks.jobb?.map((task, idx) => (
          <ParallaxCard
            key={task.id}
            task={task}
            mouseX={mouseX}
            mouseY={mouseY}
            depth={1}
            index={idx}
            total={groupedTasks.jobb.length}
          />
        ))}

        {/* Familj - Depth 2 (middle) */}
        {groupedTasks.familj?.map((task, idx) => (
          <ParallaxCard
            key={task.id}
            task={task}
            mouseX={mouseX}
            mouseY={mouseY}
            depth={2}
            index={idx}
            total={groupedTasks.familj.length}
          />
        ))}

        {/* Hälsa - Depth 3 (back) */}
        {groupedTasks.hälsa?.map((task, idx) => (
          <ParallaxCard
            key={task.id}
            task={task}
            mouseX={mouseX}
            mouseY={mouseY}
            depth={3}
            index={idx}
            total={groupedTasks.hälsa.length}
          />
        ))}
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

// Parallax Card Wrapper
function ParallaxCard({
  task,
  mouseX,
  mouseY,
  depth,
  index,
  total
}: {
  task: Task;
  mouseX: any;
  mouseY: any;
  depth: number;
  index: number;
  total: number;
}) {
  const multiplier = depth === 1 ? 0.03 : depth === 2 ? 0.015 : 0.008;

  const x = useTransform(mouseX, (value) => value * multiplier);
  const y = useTransform(mouseY, (value) => value * multiplier);

  const yOffset = index * 120; // Stack cards vertically

  return (
    <motion.div
      style={{
        x,
        y,
        top: yOffset,
        zIndex: 10 - depth,
      }}
      className="absolute left-0 right-0 mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <TaskCard task={task} />
    </motion.div>
  );
}
