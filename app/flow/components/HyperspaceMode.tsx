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
  type: 'todo' | 'email' | 'motivation';
  x: number; // Screen X position (-50 to 150)
  y: number; // Screen Y position (-50 to 150)
  z: number; // Distance (starts far, moves to 0)
  speed: number;
  color: string;
}

const MOTIVATIONAL_PHRASES = [
  "You've got this! 💪",
  "One step at a time",
  "Progress, not perfection",
  "Crushing it today!",
  "You're unstoppable!",
  "Keep the momentum!",
  "Amazing work!",
  "Focus & flow",
  "You're doing great!",
  "Believe in yourself",
  "Stay strong!",
  "You can do this!",
];

const CATEGORY_COLORS = {
  todo: '#60A5FA',      // Blue
  email: '#F472B6',     // Pink
  motivation: '#FCD34D', // Yellow
  jobb: '#8B5CF6',      // Purple
  familj: '#EC4899',    // Hot pink
  hälsa: '#10B981',     // Green
};

export default function HyperspaceMode({ tasks, onToggleMode }: HyperspaceModeProps) {
  const [items, setItems] = useState<FlyingItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    loadHyperspaceData();
  }, [tasks]);

  const loadHyperspaceData = async () => {
    const flyingItems: FlyingItem[] = [];

    // Add todos
    tasks.forEach((task) => {
      flyingItems.push({
        id: `todo-${task.id}-${Math.random()}`,
        text: task.title,
        type: 'todo',
        x: Math.random() * 200 - 50, // -50 to 150 (can be off-screen)
        y: Math.random() * 200 - 50,
        z: Math.random() * 3000 + 1000, // Far away
        speed: 2,
        color: CATEGORY_COLORS[task.category] || CATEGORY_COLORS.todo,
      });
    });

    // Fetch emails
    try {
      const emailRes = await axios.get(`${API_URL}/api/gmail/search`, {
        params: { query: 'newer_than:3d', maxResults: 10 },
        headers: { 'x-api-key': API_KEY }
      });

      (emailRes.data.emails || []).slice(0, 10).forEach((email: any) => {
        flyingItems.push({
          id: `email-${email.id || Math.random()}`,
          text: `📧 ${email.subject || 'No subject'}`,
          type: 'email',
          x: Math.random() * 200 - 50,
          y: Math.random() * 200 - 50,
          z: Math.random() * 3000 + 1000,
          speed: 2.5,
          color: CATEGORY_COLORS.email,
        });
      });
    } catch (error) {
      console.error('Failed to load emails:', error);
    }

    // Add motivational phrases
    MOTIVATIONAL_PHRASES.forEach((phrase, i) => {
      flyingItems.push({
        id: `motivation-${i}-${Math.random()}`,
        text: phrase,
        type: 'motivation',
        x: Math.random() * 200 - 50,
        y: Math.random() * 200 - 50,
        z: Math.random() * 3000 + 1000 + i * 300, // Spread them out
        speed: 1.5,
        color: CATEGORY_COLORS.motivation,
      });
    });

    setItems(flyingItems);
  };

  // Animation loop - items fly TOWARDS you
  useEffect(() => {
    const animate = () => {
      setItems(prev => prev.map(item => {
        // Move towards you (decrease z)
        let newZ = item.z - item.speed;

        // Reset to far distance when passing you
        if (newZ <= 0) {
          return {
            ...item,
            z: 4000 + Math.random() * 1000,
            x: Math.random() * 200 - 50,
            y: Math.random() * 200 - 50,
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
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* Starfield background */}
      <div className="absolute inset-0">
        {[...Array(300)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${Math.random() * 4 + 2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Flying items coming at you! */}
      <AnimatePresence>
        {items.map(item => {
          // Calculate screen position based on 3D perspective
          const perspective = 800;
          const scale = perspective / (perspective + item.z);
          const screenX = item.x * scale + 50; // Center at 50%
          const screenY = item.y * scale + 50;
          const size = Math.max(12, 40 * scale);
          const opacity = Math.max(0.2, Math.min(1, (4000 - item.z) / 4000));

          // Skip if too far or off screen
          if (item.z > 4000 || screenX < -20 || screenX > 120 || screenY < -20 || screenY > 120) {
            return null;
          }

          // Determine if item is close (readable)
          const isClose = item.z < 1500;

          return (
            <motion.div
              key={item.id}
              className="absolute whitespace-nowrap font-bold"
              style={{
                left: `${screenX}%`,
                top: `${screenY}%`,
                fontSize: `${size}px`,
                color: item.color,
                opacity,
                textShadow: `0 0 ${size * 0.5}px ${item.color}, 0 0 ${size}px rgba(255,255,255,0.5)`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                fontWeight: item.type === 'motivation' ? 900 : 700,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity }}
              exit={{ opacity: 0 }}
            >
              {isClose && item.text}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Title */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50 text-center">
        <motion.h1
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl font-black tracking-widest text-white"
          style={{
            textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(96,165,250,0.3)',
          }}
        >
          FORWARD
        </motion.h1>
        <p className="text-white/40 text-sm mt-2 tracking-wider">
          {items.length} items approaching
        </p>
      </div>

      {/* Exit button */}
      <button
        onClick={onToggleMode}
        className="fixed top-8 right-8 bg-white/10 border-2 border-white/20 text-white px-6 py-3 text-sm font-bold hover:bg-white/20 transition-all z-50 tracking-wider"
      >
        EXIT
      </button>

      {/* CSS animation for stars */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
