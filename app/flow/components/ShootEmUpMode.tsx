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
  isBoss?: boolean;
  health?: number;
  rotation?: number;
  scale?: number;
  hue?: number;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
  size?: number;
}

interface Explosion {
  id: string;
  x: number;
  y: number;
  color: string;
  title?: string;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

const CATEGORY_COLORS = {
  jobb: '#D97757',
  familj: '#5B9AAA',
  hälsa: '#7BA05B',
};

const ENCOURAGEMENTS = [
  'NICE!', 'CRUSHING IT!', 'UNSTOPPABLE!', 'ON FIRE!', 'BEAST MODE!',
  'LEGENDARY!', 'KILLING IT!', 'AMAZING!', 'PERFECT!', 'GODLIKE!'
];

export default function ShootEmUpMode({ tasks, onToggleMode, onCompleteTask }: ShootEmUpModeProps) {
  const [playerX, setPlayerX] = useState(100);
  const [playerY, setPlayerY] = useState(300);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [rapidFire, setRapidFire] = useState(false);
  const [shake, setShake] = useState(false);
  const [killCount, setKillCount] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const gameLoopRef = useRef<number>();
  const comboTimerRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext>();

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 700;

  // Sound effects using Web Audio API
  const playSound = (type: 'shoot' | 'hit' | 'boss' | 'powerup') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'shoot':
        oscillator.frequency.value = 440;
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;
      case 'hit':
        oscillator.frequency.value = 150;
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'boss':
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 80;
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;
      case 'powerup':
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCombo(0);
    setKillCount(0);
    setEnemies([]);
    setBullets([]);
    setExplosions([]);
    setFloatingTexts([]);
  };

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    const id = `text-${Date.now()}-${Math.random()}`;
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  };

  // Spawn enemies
  useEffect(() => {
    if (!gameStarted) return;

    const incompleteTasks = tasks.filter(t => !t.completed);
    if (incompleteTasks.length === 0) return;

    spawnTimerRef.current = setInterval(() => {
      const randomTask = incompleteTasks[Math.floor(Math.random() * incompleteTasks.length)];

      // Boss every 10 kills
      const isBoss = killCount > 0 && killCount % 10 === 0 && enemies.length === 0;

      const newEnemy: Enemy = {
        id: `${randomTask.id}-${Date.now()}`,
        task: randomTask,
        x: CANVAS_WIDTH + 100,
        y: isBoss ? CANVAS_HEIGHT / 2 : Math.random() * (CANVAS_HEIGHT - 150) + 75,
        speed: isBoss ? 0.5 : randomTask.urgent ? 3.5 : 2.5,
        isBoss,
        health: isBoss ? 10 : 1,
        rotation: 0,
        scale: 1,
        hue: Math.random() * 360,
      };

      setEnemies(prev => [...prev, newEnemy]);

      if (isBoss) {
        playSound('boss');
        addFloatingText('🤖 TODILOOOO IT TODILOOOO! 🌈', CANVAS_WIDTH / 2, 100, '#FF00FF');
        setTimeout(() => addFloatingText('⚠️ PSYCHEDELIC BOSS ⚠️', CANVAS_WIDTH / 2, 150, '#00FFFF'), 500);
      }
    }, rapidFire ? 1500 : 2000);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [gameStarted, tasks, killCount, rapidFire, enemies.length]);

  // Game loop
  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = () => {
      // Update enemies with PSYCHEDELIC motion!
      setEnemies(prev =>
        prev
          .map(e => ({
            ...e,
            x: e.x - e.speed,
            rotation: (e.rotation || 0) + (e.isBoss ? 2 : 1),
            scale: e.isBoss ? 1 + Math.sin(Date.now() / 200) * 0.15 : 1,
            hue: ((e.hue || 0) + (e.isBoss ? 2 : 0.5)) % 360,
          }))
          .filter(e => e.x > -200)
      );

      setBullets(prev =>
        prev
          .map(b => ({ ...b, x: b.x + 10 }))
          .filter(b => b.x < CANVAS_WIDTH + 100)
      );

      // Collision
      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        const newExplosions: Explosion[] = [];

        setEnemies(prevEnemies => {
          const remainingEnemies = prevEnemies.map(enemy => {
            const hitBulletIndex = remainingBullets.findIndex(bullet => {
              const dx = bullet.x - enemy.x;
              const dy = bullet.y - enemy.y;
              const hitRadius = enemy.isBoss ? 80 : 50;
              return Math.sqrt(dx * dx + dy * dy) < hitRadius;
            });

            if (hitBulletIndex !== -1) {
              remainingBullets.splice(hitBulletIndex, 1);
              playSound('hit');
              setShake(true);
              setTimeout(() => setShake(false), 100);

              const newHealth = (enemy.health || 1) - 1;

              if (newHealth <= 0) {
                // KILLED!
                const isBoss = enemy.isBoss;
                const points = isBoss ? 100 : enemy.task.urgent ? 20 : 10;

                setScore(s => s + points + (combo * 5));
                setCombo(c => c + 1);
                setKillCount(k => k + 1);

                // Reset combo timer
                if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
                comboTimerRef.current = setTimeout(() => setCombo(0), 3000);

                // Epic explosion with todo title
                newExplosions.push({
                  id: `explosion-${Date.now()}-${Math.random()}`,
                  x: enemy.x,
                  y: enemy.y,
                  color: CATEGORY_COLORS[enemy.task.category],
                  title: enemy.task.title,
                });

                // Floating encouragement
                if (combo > 2) {
                  const encouragement = ENCOURAGEMENTS[Math.min(Math.floor(combo / 3), ENCOURAGEMENTS.length - 1)];
                  addFloatingText(encouragement, enemy.x, enemy.y - 50, '#FFD700');
                }

                // Combo text
                if (combo > 1) {
                  addFloatingText(`${combo}x COMBO!`, enemy.x, enemy.y - 80, '#FF6B6B');
                }

                // Boss kill
                if (isBoss) {
                  addFloatingText('💥 BOSS DESTROYED! 💥', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#FFD700');
                  playSound('powerup');
                  setRapidFire(true);
                  setTimeout(() => setRapidFire(false), 5000);
                }

                onCompleteTask(enemy.task.id);

                setTimeout(() => {
                  setExplosions(prev => prev.filter(e => !newExplosions.find(ne => ne.id === e.id)));
                }, isBoss ? 2000 : 1500);

                return null; // Remove enemy
              }

              // Damaged but alive
              return { ...enemy, health: newHealth };
            }
            return enemy;
          }).filter(Boolean) as Enemy[];

          return remainingEnemies;
        });

        if (newExplosions.length > 0) {
          setExplosions(prev => [...prev, ...newExplosions]);
        }

        return remainingBullets;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStarted, combo, onCompleteTask]);

  // Controls - Mouse (FREE MOVEMENT!), Touch, AND Keyboard!
  useEffect(() => {
    if (!gameStarted || !canvasRef.current) return;

    const canvas = canvasRef.current;

    const shootBullet = () => {
      playSound('shoot');
      const newBullet: Bullet = {
        id: `bullet-${Date.now()}-${Math.random()}`,
        x: playerX + 40,
        y: playerY,
        size: rapidFire ? 12 : 8,
      };
      setBullets(prev => [...prev, newBullet]);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(30, Math.min(CANVAS_WIDTH - 30, e.clientX - rect.left));
      const y = Math.max(30, Math.min(CANVAS_HEIGHT - 30, e.clientY - rect.top));
      setPlayerX(x);
      setPlayerY(y);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(30, Math.min(CANVAS_WIDTH - 30, e.touches[0].clientX - rect.left));
        const y = Math.max(30, Math.min(CANVAS_HEIGHT - 30, e.touches[0].clientY - rect.top));
        setPlayerX(x);
        setPlayerY(y);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 15;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setPlayerY(y => Math.max(30, y - speed));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setPlayerY(y => Math.min(CANVAS_HEIGHT - 30, y + speed));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerX(x => Math.max(30, x - speed));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerX(x => Math.min(CANVAS_WIDTH - 30, x + speed));
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        shootBullet();
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      shootBullet();
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      shootBullet();
    };

    // Add listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    console.log('🎮 Controls initialized - mouse should work now!');

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, playerX, playerY, rapidFire]);

  return (
    <div className="relative w-full h-screen bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
      {!gameStarted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.h1
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 mb-6 tracking-tight"
          >
            TODO DESTROYER
          </motion.h1>
          <p className="text-2xl text-white/80 mb-12 font-bold">
            🚀 Blast your tasks into oblivion! 💥
          </p>
          <button
            onClick={startGame}
            className="px-12 py-5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-2xl rounded-xl hover:scale-110 transition-transform shadow-lg shadow-red-500/50"
          >
            START GAME
          </button>
          <p className="text-sm text-white/40 mt-12">
            🖱️ Move mouse anywhere • ⌨️ WASD/Arrows (all directions) • 🔫 Click/Space to shoot
          </p>
          <p className="text-xs text-white/30 mt-2">
            👆 Touch works too! • Destroy todos = Complete tasks
          </p>
        </motion.div>
      ) : (
        <motion.div
          ref={canvasRef}
          animate={shake ? { x: [0, -5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.1 }}
          className="relative bg-gradient-to-b from-[#0A0A0A] to-[#1A0A0A]"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            border: '3px solid #333',
            boxShadow: '0 0 50px rgba(255, 0, 0, 0.3)',
          }}
        >
          {/* HUD */}
          <div className="absolute top-6 left-6 z-50">
            <div className="text-yellow-400 font-black text-4xl mb-2 drop-shadow-lg" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.8)' }}>
              {score}
            </div>
            <div className="text-white/60 font-bold text-sm">SCORE</div>
          </div>

          {combo > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 drop-shadow-lg">
                {combo}x COMBO!
              </div>
            </motion.div>
          )}

          <div className="absolute top-6 right-6 z-50 text-right">
            <div className="text-white font-black text-2xl">{tasks.filter(t => !t.completed).length}</div>
            <div className="text-white/60 font-bold text-xs">TASKS LEFT</div>
          </div>

          {rapidFire && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-black text-white text-sm z-50"
            >
              ⚡ RAPID FIRE ⚡
            </motion.div>
          )}

          {/* Player - FREE MOVEMENT! */}
          <motion.div
            animate={{ x: playerX, y: playerY }}
            transition={{ type: 'spring', stiffness: 800, damping: 40 }}
            className="absolute z-40"
            style={{ width: 50, height: 50, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 relative" style={{
              clipPath: 'polygon(0% 50%, 100% 20%, 100% 80%)',
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)',
            }}>
              <div className="absolute inset-0 bg-white opacity-50 animate-pulse" style={{
                clipPath: 'polygon(0% 50%, 100% 20%, 100% 80%)',
              }} />
            </div>
          </motion.div>

          {/* Bullets */}
          <AnimatePresence>
            {bullets.map(bullet => (
              <motion.div
                key={bullet.id}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute rounded-full"
                style={{
                  left: bullet.x,
                  top: bullet.y,
                  width: bullet.size || 8,
                  height: bullet.size || 8,
                  background: rapidFire ? 'linear-gradient(to right, #A855F7, #EC4899)' : '#FBBF24',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: rapidFire ? '0 0 15px rgba(168, 85, 247, 0.9)' : '0 0 15px rgba(251, 191, 36, 0.9)',
                }}
              />
            ))}
          </AnimatePresence>

          {/* Enemies - PSYCHEDELIC TODO ROBOTS! */}
          <AnimatePresence>
            {enemies.map(enemy => (
              <motion.div
                key={enemy.id}
                initial={{ opacity: 0, scale: enemy.isBoss ? 0.3 : 0.5, rotate: -20 }}
                animate={{
                  opacity: 1,
                  scale: enemy.scale || 1,
                  rotate: enemy.rotation || 0,
                }}
                exit={{ opacity: 0, scale: 0, rotate: 360 }}
                transition={{ rotate: { duration: 0 } }}
                className="absolute"
                style={{
                  left: enemy.x,
                  top: enemy.y,
                  width: enemy.isBoss ? 200 : 140,
                  height: enemy.isBoss ? 100 : 50,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {enemy.isBoss ? (
                  // PSYCHEDELIC BOSS ROBOT!
                  <div className="relative w-full h-full">
                    {/* Robot body with rainbow gradient */}
                    <div
                      className="w-full h-full flex items-center justify-center font-black text-white px-3 relative"
                      style={{
                        background: `linear-gradient(${enemy.hue || 0}deg,
                          hsl(${enemy.hue || 0}, 100%, 50%),
                          hsl(${((enemy.hue || 0) + 120) % 360}, 100%, 50%),
                          hsl(${((enemy.hue || 0) + 240) % 360}, 100%, 50%))`,
                        borderRadius: '20px',
                        border: '4px solid #FFD700',
                        boxShadow: `0 0 40px hsl(${enemy.hue || 0}, 100%, 50%), 0 0 80px hsl(${((enemy.hue || 0) + 180) % 360}, 100%, 50%)`,
                        fontSize: '16px',
                        textShadow: '0 0 10px rgba(0,0,0,0.8)',
                      }}
                    >
                      {/* Robot eyes */}
                      <div className="absolute -top-3 left-1/4 w-8 h-8 bg-white rounded-full animate-pulse"
                        style={{ boxShadow: '0 0 20px #00FFFF' }} />
                      <div className="absolute -top-3 right-1/4 w-8 h-8 bg-white rounded-full animate-pulse"
                        style={{ boxShadow: '0 0 20px #FF00FF', animationDelay: '0.5s' }} />

                      {/* Robot antenna */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-2 h-10 bg-gradient-to-t from-yellow-400 to-pink-500" />
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 animate-spin" />

                      <span className="truncate z-10 relative">🤖 {enemy.task.title.substring(0, 20)} 🤖</span>
                    </div>

                    {/* Health bar */}
                    <div className="absolute -bottom-5 left-0 right-0 h-2 bg-gray-700 rounded-full border-2 border-white">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${((enemy.health || 1) / 10) * 100}%`,
                          background: `linear-gradient(90deg, #00FF00, #FFFF00, #FF0000)`,
                        }}
                      />
                    </div>

                    {/* Floating "TODILOOOO" text */}
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute -top-16 left-1/2 -translate-x-1/2 text-2xl font-black whitespace-nowrap"
                      style={{
                        color: `hsl(${enemy.hue || 0}, 100%, 50%)`,
                        textShadow: '0 0 10px #000, 0 0 20px #FFF',
                      }}
                    >
                      TODILOOOO!
                    </motion.div>
                  </div>
                ) : (
                  // Normal enemy - simple with slight rainbow
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-white px-3 relative"
                    style={{
                      background: `linear-gradient(135deg, ${CATEGORY_COLORS[enemy.task.category]}, hsl(${enemy.hue || 0}, 70%, 50%))`,
                      clipPath: 'polygon(100% 50%, 0% 10%, 0% 90%)',
                      border: enemy.task.urgent ? '2px solid #EF4444' : 'none',
                      fontSize: '11px',
                    }}
                  >
                    <span className="truncate ml-3">{enemy.task.title.substring(0, 18)}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Explosions */}
          <AnimatePresence>
            {explosions.map(explosion => (
              <motion.div
                key={explosion.id}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: 3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: explosion.title ? 2 : 1 }}
                className="absolute z-50"
                style={{
                  left: explosion.x,
                  top: explosion.y,
                  width: explosion.title ? 300 : 100,
                  height: explosion.title ? 300 : 100,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              >
                {/* Todo title explosion */}
                {explosion.title && (
                  <motion.div
                    initial={{ opacity: 1, scale: 0, rotate: -10 }}
                    animate={{
                      opacity: [1, 1, 0],
                      scale: [0, 1.5, 2],
                      rotate: [- 10, 5, 10],
                      y: [-50, -100, -150],
                    }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className="font-black text-4xl text-center drop-shadow-lg px-4"
                      style={{
                        color: explosion.color,
                        textShadow: `0 0 20px ${explosion.color}, 0 0 40px ${explosion.color}`,
                      }}
                    >
                      ✓ {explosion.title}
                    </div>
                  </motion.div>
                )}

                {/* MEGA PARTICLES - 80 för bossar, 40 för vanliga! */}
                {[...Array(explosion.title ? 80 : 40)].map((_, i) => {
                  const isBoss = explosion.title;
                  const particleCount = isBoss ? 80 : 40;
                  const angle = (i * Math.PI * 2) / particleCount;
                  const distance = isBoss ? 180 : 80;
                  const size = isBoss ? (Math.random() * 12 + 8) : (Math.random() * 8 + 6);

                  return (
                    <motion.div
                      key={i}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                      animate={{
                        x: Math.cos(angle) * distance * (0.7 + Math.random() * 0.6),
                        y: Math.sin(angle) * distance * (0.7 + Math.random() * 0.6),
                        opacity: 0,
                        scale: 0,
                        rotate: Math.random() * 360,
                      }}
                      transition={{
                        duration: isBoss ? (1.0 + Math.random() * 0.8) : (0.5 + Math.random() * 0.4),
                        ease: 'easeOut',
                        delay: Math.random() * 0.1,
                      }}
                      className="absolute rounded-full"
                      style={{
                        width: size,
                        height: size,
                        backgroundColor: explosion.color,
                        left: '50%',
                        top: '50%',
                        boxShadow: `0 0 30px ${explosion.color}`,
                      }}
                    />
                  );
                })}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Floating texts */}
          <AnimatePresence>
            {floatingTexts.map(text => (
              <motion.div
                key={text.id}
                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                animate={{ opacity: 0, y: -100, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute font-black text-3xl z-50"
                style={{
                  left: text.x,
                  top: text.y,
                  color: text.color,
                  textShadow: `0 0 20px ${text.color}, 0 0 40px ${text.color}`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              >
                {text.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Grid */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `
              linear-gradient(to right, #0FF 1px, transparent 1px),
              linear-gradient(to bottom, #0FF 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />
        </motion.div>
      )}

      <button
        onClick={onToggleMode}
        className="fixed bottom-6 right-6 bg-white/10 text-white px-6 py-3 font-bold text-sm backdrop-blur rounded-lg hover:bg-white/20 transition-colors z-50"
      >
        EXIT GAME
      </button>
    </div>
  );
}
