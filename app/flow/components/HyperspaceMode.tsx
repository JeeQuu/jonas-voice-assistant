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
  todo: '#00D9FF',      // Cyan
  email: '#FF6B9D',     // Pink
  project: '#FFD700',   // Gold
  jobb: '#D97757',
  familj: '#5B9AAA',
  hälsa: '#7BA05B',
};

export default function HyperspaceMode({ tasks, onToggleMode }: HyperspaceModeProps) {
  const [items, setItems] = useState<FlyingItem[]>([]);
  const [speed, setSpeed] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    loadHyperspaceData();
  }, [tasks]);

  const loadHyperspaceData = async () => {
    const flyingItems: FlyingItem[] = [];

    // Add todos as flying stars
    tasks.forEach((task, i) => {
      flyingItems.push({
        id: `todo-${task.id}`,
        text: task.title,
        type: 'todo',
        importance: task.urgent ? 5 : 3,
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 1000,
        z: Math.random() * 3000 + 1000,
        speed: task.urgent ? 8 : 5,
        size: task.urgent ? 24 : 16,
        color: CATEGORY_COLORS[task.category] || CATEGORY_COLORS.todo,
        trail: task.urgent,
      });
    });

    // Fetch recent emails
    try {
      const emailRes = await axios.get(`${API_URL}/api/gmail/search`, {
        params: { query: 'newer_than:7d', maxResults: 20 },
        headers: { 'x-api-key': API_KEY }
      });

      (emailRes.data.emails || []).slice(0, 15).forEach((email: any, i: number) => {
        flyingItems.push({
          id: `email-${email.id || i}`,
          text: `📧 ${email.subject || 'No subject'}`,
          type: 'email',
          importance: 4,
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 1000,
          z: Math.random() * 3000 + 1000,
          speed: 6,
          size: 18,
          color: CATEGORY_COLORS.email,
          trail: email.unread,
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
        flyingItems.push({
          id: `project-${memory.id || i}`,
          text: `⭐ ${memory.summary || memory.full_content?.substring(0, 50) || 'Project'}`,
          type: 'project',
          importance: memory.importance_level || 5,
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 1000,
          z: Math.random() * 3000 + 1000,
          speed: 4,
          size: 20,
          color: CATEGORY_COLORS.project,
          trail: true,
        });
      });
    } catch (error) {
      console.error('Failed to load projects:', error);
    }

    setItems(flyingItems);
  };

  // Hyperspace animation loop
  useEffect(() => {
    const animate = () => {
      setItems(prev => prev.map(item => {
        let newZ = item.z - item.speed * speed;

        // Reset to far distance when passing camera
        if (newZ <= 0) {
          newZ = 3000 + Math.random() * 1000;
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
      className="relative w-full h-screen bg-black overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #000814 0%, #000000 100%)',
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
              {/* Trail effect */}
              {item.trail && (
                <motion.div
                  className="absolute"
                  style={{
                    width: size * 4,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                    left: -size * 2,
                    top: size / 2,
                    opacity: opacity * 0.5,
                    filter: 'blur(2px)',
                  }}
                />
              )}

              {/* Item glow */}
              <div
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  background: `radial-gradient(circle, ${item.color}FF, ${item.color}00)`,
                  boxShadow: `0 0 ${size}px ${item.color}`,
                  filter: `blur(${size / 4}px)`,
                }}
              />

              {/* Item core */}
              <div
                className="absolute rounded-full"
                style={{
                  width: size / 2,
                  height: size / 2,
                  left: size / 4,
                  top: size / 4,
                  backgroundColor: item.color,
                  boxShadow: `0 0 ${size / 2}px ${item.color}`,
                }}
              />

              {/* Text label (only for close items) */}
              {item.z < 1500 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: opacity * 0.8, scale: 1 }}
                  className="absolute whitespace-nowrap font-bold"
                  style={{
                    left: size + 10,
                    top: size / 4,
                    fontSize: Math.max(10, size / 1.5),
                    color: item.color,
                    textShadow: `0 0 10px ${item.color}, 0 0 20px ${item.color}`,
                  }}
                >
                  {item.text}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* HUD / Info overlay */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50">
        <motion.h1
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
          style={{ textShadow: '0 0 30px rgba(0, 217, 255, 0.5)' }}
        >
          HYPERSPACE
        </motion.h1>
        <p className="text-center text-cyan-400 text-sm mt-2 font-mono">
          {items.length} ITEMS IN FLIGHT
        </p>
      </div>

      {/* Speed control */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4">
        <button
          onClick={() => setSpeed(Math.max(0.5, speed - 0.5))}
          className="bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 px-6 py-3 font-black hover:bg-cyan-500/40 transition-all"
        >
          SLOWER
        </button>
        <div className="bg-black/50 border-2 border-cyan-400 px-6 py-3 font-mono text-cyan-400 font-black">
          SPEED: {speed.toFixed(1)}x
        </div>
        <button
          onClick={() => setSpeed(Math.min(3, speed + 0.5))}
          className="bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 px-6 py-3 font-black hover:bg-cyan-500/40 transition-all"
        >
          FASTER
        </button>
      </div>

      {/* Exit button */}
      <button
        onClick={onToggleMode}
        className="fixed top-6 right-6 bg-purple-600/20 border-2 border-purple-400 text-purple-400 px-6 py-3 font-black hover:bg-purple-600/40 transition-all z-50"
      >
        EXIT HYPERSPACE
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
