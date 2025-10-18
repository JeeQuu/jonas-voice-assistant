'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';

interface ShootEmUpModeProps {
  tasks: Task[];
  onToggleMode: () => void;
  onCompleteTask: (id: string) => void;
}

interface Enemy {
  id: string;
  task: Task;
  x: number;
  y: number;
  speed: number;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
}

interface Explosion {
  id: string;
  x: number;
  y: number;
  color: string;
}

const CATEGORY_COLORS = {
  jobb: '#D97757',
  familj: '#5B9AAA',
  hälsa: '#7BA05B',
};

export default function ShootEmUpMode({ tasks, onToggleMode, onCompleteTask }: ShootEmUpModeProps) {
  const [playerY, setPlayerY] = useState(300);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const gameLoopRef = useRef<number>();

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLAYER_X = 50;

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setEnemies([]);
    setBullets([]);
    setExplosions([]);
  };

  // Spawn enemies from tasks
  useEffect(() => {
    if (!gameStarted) return;

    const incompleteTasks = tasks.filter(t => !t.completed);
    if (incompleteTasks.length === 0) return;

    spawnTimerRef.current = setInterval(() => {
      const randomTask = incompleteTasks[Math.floor(Math.random() * incompleteTasks.length)];
      const newEnemy: Enemy = {
        id: `${randomTask.id}-${Date.now()}`,
        task: randomTask,
        x: CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
        speed: randomTask.urgent ? 3 : 2,
      };
      setEnemies(prev => [...prev, newEnemy]);
    }, 2000);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [gameStarted, tasks]);

  // Game loop
  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = () => {
      // Move enemies
      setEnemies(prev =>
        prev
          .map(e => ({ ...e, x: e.x - e.speed }))
          .filter(e => e.x > -100) // Remove off-screen
      );

      // Move bullets
      setBullets(prev =>
        prev
          .map(b => ({ ...b, x: b.x + 8 }))
          .filter(b => b.x < CANVAS_WIDTH + 50)
      );

      // Collision detection
      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        const newExplosions: Explosion[] = [];

        setEnemies(prevEnemies => {
          const remainingEnemies = prevEnemies.filter(enemy => {
            // Check collision with bullets
            const hitBulletIndex = remainingBullets.findIndex(bullet => {
              const dx = bullet.x - enemy.x;
              const dy = bullet.y - enemy.y;
              return Math.sqrt(dx * dx + dy * dy) < 40;
            });

            if (hitBulletIndex !== -1) {
              // Hit!
              remainingBullets.splice(hitBulletIndex, 1);

              // Create explosion
              newExplosions.push({
                id: `explosion-${Date.now()}-${Math.random()}`,
                x: enemy.x,
                y: enemy.y,
                color: CATEGORY_COLORS[enemy.task.category],
              });

              // Mark task complete
              onCompleteTask(enemy.task.id);
              setScore(s => s + (enemy.task.urgent ? 20 : 10));

              return false; // Remove enemy
            }
            return true; // Keep enemy
          });

          return remainingEnemies;
        });

        if (newExplosions.length > 0) {
          setExplosions(prev => [...prev, ...newExplosions]);
          setTimeout(() => {
            setExplosions(prev => prev.filter(e => !newExplosions.find(ne => ne.id === e.id)));
          }, 500);
        }

        return remainingBullets;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStarted, onCompleteTask]);

  // Player controls
  useEffect(() => {
    if (!gameStarted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, e.clientY - rect.top));
        setPlayerY(y);
      }
    };

    const handleClick = () => {
      if (!gameStarted) return;
      // Shoot bullet
      const newBullet: Bullet = {
        id: `bullet-${Date.now()}`,
        x: PLAYER_X + 30,
        y: playerY,
      };
      setBullets(prev => [...prev, newBullet]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [gameStarted, playerY]);

  return (
    <div className="relative w-full h-screen bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
      {!gameStarted ? (
        // Start screen
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-6xl font-black text-white mb-4 tracking-tight">
            TODO DESTROYER
          </h1>
          <p className="text-xl text-white/60 mb-8">
            Shoot down your tasks to complete them
          </p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-white text-black font-black text-xl rounded-lg hover:scale-105 transition-transform"
          >
            START GAME
          </button>
          <p className="text-sm text-white/40 mt-8">
            Move mouse to control ship • Click to shoot
          </p>
        </motion.div>
      ) : (
        // Game canvas
        <div
          ref={canvasRef}
          className="relative bg-[#0A0A0A]"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            border: '2px solid #333',
          }}
        >
          {/* Score */}
          <div className="absolute top-4 left-4 text-white font-black text-2xl z-50">
            SCORE: {score}
          </div>

          {/* Remaining tasks */}
          <div className="absolute top-4 right-4 text-white/60 font-bold text-sm z-50">
            {tasks.filter(t => !t.completed).length} TASKS LEFT
          </div>

          {/* Player ship */}
          <motion.div
            animate={{ y: playerY }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute"
            style={{
              left: PLAYER_X,
              width: 40,
              height: 40,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-full h-full bg-white" style={{
              clipPath: 'polygon(0% 50%, 100% 20%, 100% 80%)',
            }} />
          </motion.div>

          {/* Bullets */}
          <AnimatePresence>
            {bullets.map(bullet => (
              <motion.div
                key={bullet.id}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bg-yellow-400 rounded-full"
                style={{
                  left: bullet.x,
                  top: bullet.y,
                  width: 8,
                  height: 8,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
                }}
              />
            ))}
          </AnimatePresence>

          {/* Enemies */}
          <AnimatePresence>
            {enemies.map(enemy => (
              <motion.div
                key={enemy.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute"
                style={{
                  left: enemy.x,
                  top: enemy.y,
                  width: 120,
                  height: 40,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Enemy ship */}
                <div
                  className="w-full h-full flex items-center justify-center font-bold text-xs text-white px-2 relative"
                  style={{
                    backgroundColor: CATEGORY_COLORS[enemy.task.category],
                    clipPath: 'polygon(100% 50%, 0% 20%, 0% 80%)',
                    border: enemy.task.urgent ? '2px solid #EF4444' : 'none',
                    animation: enemy.task.urgent ? 'pulse 0.5s infinite' : 'none',
                  }}
                >
                  <span className="text-[10px] truncate ml-2">
                    {enemy.task.title.substring(0, 15)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Explosions */}
          <AnimatePresence>
            {explosions.map(explosion => (
              <motion.div
                key={explosion.id}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: 2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute"
                style={{
                  left: explosion.x,
                  top: explosion.y,
                  width: 60,
                  height: 60,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Explosion particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos((i * Math.PI * 2) / 8) * 30,
                      y: Math.sin((i * Math.PI * 2) / 8) * 30,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: explosion.color,
                      left: '50%',
                      top: '50%',
                    }}
                  />
                ))}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Grid background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `
              linear-gradient(to right, #FFF 1px, transparent 1px),
              linear-gradient(to bottom, #FFF 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />
        </div>
      )}

      {/* Exit button */}
      <button
        onClick={onToggleMode}
        className="fixed bottom-4 right-4 bg-white/10 text-white px-4 py-2 font-bold text-xs backdrop-blur rounded hover:bg-white/20 transition-colors z-50"
      >
        EXIT GAME
      </button>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
