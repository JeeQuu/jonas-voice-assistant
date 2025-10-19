'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import axios from 'axios';

const API_URL = 'https://quant-show-api.onrender.com';
const API_KEY = 'JeeQuuFjong';

interface HyperspaceModeProps {
  tasks: Task[];
  onToggleMode: () => void;
}

interface FlyingItem {
  id: string;
  text: string;
  type: 'todo' | 'email' | 'project';
  importance: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
  color: string;
  trail: boolean;
}

const CATEGORY_COLORS = {
  todo: '#E8E8E8',      // Soft white
  email: '#C4B5A0',     // Warm beige
  project: '#A8B8C8',   // Cool blue-grey
  jobb: '#D4C4B0',      // Warm sand
  familj: '#B8C8D8',    // Soft blue
  hälsa: '#C8D4C0',     // Soft sage
};

export default function HyperspaceMode({ tasks, onToggleMode }: HyperspaceModeProps) {
  const [items, setItems] = useState<FlyingItem[]>([]);
  const [speed, setSpeed] = useState(0.05); // VERY slow, elegant
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    loadHyperspaceData();
  }, [tasks]);

  const loadHyperspaceData = async () => {
    const flyingItems: FlyingItem[] = [];

    // Add todos as flying stars - slower, more spread out
    tasks.forEach((task, i) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 800 + 200;

      flyingItems.push({
        id: `todo-${task.id}`,
        text: task.title,
        type: 'todo',
        importance: task.urgent ? 5 : 3,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: Math.random() * 5000 + 2000,
        speed: task.urgent ? 1.5 : 1.0, // Reduced from 3:2 to 1.5:1
        size: task.urgent ? 20 : 14,
        color: CATEGORY_COLORS[task.category] || CATEGORY_COLORS.todo,
        trail: false, // No trails, cleaner
      });
    });

    // Fetch recent emails
    try {
      const emailRes = await axios.get(`${API_URL}/api/gmail/search`, {
        params: { query: 'newer_than:7d', maxResults: 20 },
        headers: { 'x-api-key': API_KEY }
      });

      (emailRes.data.emails || []).slice(0, 15).forEach((email: any, i: number) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 800 + 200;

        flyingItems.push({
          id: `email-${email.id || i}`,
          text: email.subject || 'No subject',
          type: 'email',
          importance: 4,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: Math.random() * 5000 + 2000,
          speed: 1.2, // Reduced from 2.5
          size: 16,
          color: CATEGORY_COLORS.email,
          trail: false,
        });
      });
    } catch (error) {
      console.error('Failed to load emails:', error);
    }

    // Fetch projects/important memories
    try {
      const memoryRes = await axios.get(`${API_URL}/api/memory/search`, {
        params: { query: 'projekt OR important', limit: 10 },
        headers: { 'x-api-key': API_KEY }
      });

      (memoryRes.data.memories || []).slice(0, 8).forEach((memory: any, i: number) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 800 + 200;

        flyingItems.push({
          id: `project-${memory.id || i}`,
          text: memory.summary || memory.full_content?.substring(0, 50) || 'Project',
          type: 'project',
          importance: memory.importance_level || 5,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: Math.random() * 5000 + 2000,
          speed: 1.0, // Reduced from 2
          size: 18,
          color: CATEGORY_COLORS.project,
          trail: false,
        });
      });
    } catch (error) {
      console.error('Failed to load projects:', error);
    }

    setItems(flyingItems);
  };

  // Hyperspace animation loop - slow and elegant
  useEffect(() => {
    const animate = () => {
      setItems(prev => prev.map(item => {
        // Move towards center (decrease z)
        let newZ = item.z - item.speed * speed;

        // Reset to far distance when passing camera
        if (newZ <= 100) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 800 + 200;
          return {
            ...item,
            z: 5000 + Math.random() * 2000,
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
          };
        }

        return { ...item, z: newZ };
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0A0A12 0%, #000000 100%)',
      }}
    >
      {/* Stars in background */}
      <div className="absolute inset-0">
        {[...Array(200)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Flying items */}
      <AnimatePresence>
        {items.map(item => {
          const perspective = 1000;
          const scale = perspective / (perspective + item.z);
          const x = item.x * scale + window.innerWidth / 2;
          const y = item.y * scale + window.innerHeight / 2;
          const size = item.size * scale;
          const opacity = Math.max(0, Math.min(1, 1 - item.z / 4000));

          // Skip if behind camera or off screen
          if (item.z <= 0 || x < -200 || x > window.innerWidth + 200 || y < -200 || y > window.innerHeight + 200) {
            return null;
          }

          return (
            <motion.div
              key={item.id}
              className="absolute"
              style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity }}
              exit={{ opacity: 0 }}
            >
              {/* Elegant soft glow */}
              <div
                className="absolute rounded-full"
                style={{
                  width: size * 2,
                  height: size * 2,
                  left: -size / 2,
                  top: -size / 2,
                  background: `radial-gradient(circle, ${item.color}40, transparent 70%)`,
                  filter: 'blur(8px)',
                }}
              />

              {/* Item dot */}
              <div
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: item.color,
                  opacity: opacity * 0.9,
                  boxShadow: `0 0 ${size * 1.5}px ${item.color}40`,
                }}
              />

              {/* Text label (only for very close items, clean typography) */}
              {item.z < 2000 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: opacity * 0.7 }}
                  className="absolute whitespace-nowrap font-light"
                  style={{
                    left: size + 16,
                    top: -size / 4,
                    fontSize: Math.max(11, size * 0.8),
                    color: item.color,
                    letterSpacing: '0.05em',
                    fontWeight: 300,
                  }}
                >
                  {item.text}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Minimal HUD */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50">
        <motion.h1
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-5xl font-thin tracking-[0.3em] text-white/40"
        >
          HYPERSPACE
        </motion.h1>
        <p className="text-center text-white/20 text-xs mt-3 font-light tracking-wider">
          {items.length} items
        </p>
      </div>

      {/* Minimal speed control */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-6">
        <button
          onClick={() => setSpeed(Math.max(0.01, speed - 0.02))}
          className="bg-white/5 border border-white/10 text-white/40 px-5 py-2 text-sm font-light hover:bg-white/10 hover:text-white/60 transition-all tracking-wider"
        >
          slower
        </button>
        <div className="bg-white/5 border border-white/10 px-5 py-2 text-sm font-mono text-white/30 tracking-wider">
          {speed.toFixed(2)}x
        </div>
        <button
          onClick={() => setSpeed(Math.min(0.5, speed + 0.02))}
          className="bg-white/5 border border-white/10 text-white/40 px-5 py-2 text-sm font-light hover:bg-white/10 hover:text-white/60 transition-all tracking-wider"
        >
          faster
        </button>
      </div>

      {/* Minimal exit button */}
      <button
        onClick={onToggleMode}
        className="fixed top-8 right-8 bg-white/5 border border-white/10 text-white/40 px-4 py-2 text-xs font-light hover:bg-white/10 hover:text-white/60 transition-all z-50 tracking-wider"
      >
        exit
      </button>

      {/* CSS animation for stars */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
