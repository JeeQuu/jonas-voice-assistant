import { useState, useEffect, useRef } from 'react';
import { PanInfo } from 'framer-motion';
import { Task } from '../types';

interface CardPosition {
  id: string;
  x: number;
  y: number;
  vx: number; // velocity X
  vy: number; // velocity Y
}

interface UsePhysicsProps {
  tasks: Task[];
  viewportWidth: number;
  viewportHeight: number;
}

const FRICTION = 0.95; // How fast cards slow down
const REPULSION_FORCE = 30; // Magnetic repulsion strength
const REPULSION_DISTANCE = 180; // Distance at which cards repel
const MIN_VELOCITY = 0.1; // Stop animating below this velocity

export function usePhysics({ tasks, viewportWidth, viewportHeight }: UsePhysicsProps) {
  const [positions, setPositions] = useState<Map<string, CardPosition>>(new Map());
  const animationFrameRef = useRef<number>();

  // Initialize positions when tasks change
  useEffect(() => {
    const newPositions = new Map<string, CardPosition>();

    tasks.forEach((task, index) => {
      // Check if card already has position
      const existing = positions.get(task.id);

      if (existing) {
        newPositions.set(task.id, existing);
      } else {
        // Generate initial position in grid pattern
        const cols = Math.ceil(Math.sqrt(tasks.length));
        const row = Math.floor(index / cols);
        const col = index % cols;

        const spacing = 220; // Card width + margin
        const offsetX = (viewportWidth - cols * spacing) / 2;
        const offsetY = 100;

        newPositions.set(task.id, {
          id: task.id,
          x: offsetX + col * spacing,
          y: offsetY + row * spacing,
          vx: 0,
          vy: 0,
        });
      }
    });

    setPositions(newPositions);
  }, [tasks, viewportWidth, viewportHeight]);

  // Physics simulation loop
  useEffect(() => {
    let lastTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2); // Cap at 2x normal speed
      lastTime = currentTime;

      setPositions((prev) => {
        const updated = new Map(prev);
        const posArray = Array.from(updated.values());

        posArray.forEach((card, i) => {
          let { x, y, vx, vy } = card;

          // Apply magnetic repulsion from other cards
          posArray.forEach((other, j) => {
            if (i === j) return;

            const dx = x - other.x;
            const dy = y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < REPULSION_DISTANCE && distance > 0) {
              const force = REPULSION_FORCE * (1 - distance / REPULSION_DISTANCE);
              const angle = Math.atan2(dy, dx);

              vx += Math.cos(angle) * force * deltaTime;
              vy += Math.sin(angle) * force * deltaTime;
            }
          });

          // Apply friction
          vx *= Math.pow(FRICTION, deltaTime);
          vy *= Math.pow(FRICTION, deltaTime);

          // Stop if moving very slowly
          if (Math.abs(vx) < MIN_VELOCITY) vx = 0;
          if (Math.abs(vy) < MIN_VELOCITY) vy = 0;

          // Update position
          x += vx * deltaTime;
          y += vy * deltaTime;

          // Boundary collision with soft bounce
          const margin = 100;
          const cardWidth = 200;
          const cardHeight = 140;

          if (x < margin) {
            x = margin;
            vx = Math.abs(vx) * 0.3; // Soft bounce
          }
          if (x > viewportWidth - cardWidth - margin) {
            x = viewportWidth - cardWidth - margin;
            vx = -Math.abs(vx) * 0.3;
          }
          if (y < margin) {
            y = margin;
            vy = Math.abs(vy) * 0.3;
          }
          if (y > viewportHeight - cardHeight - margin) {
            y = viewportHeight - cardHeight - margin;
            vy = -Math.abs(vy) * 0.3;
          }

          updated.set(card.id, { ...card, x, y, vx, vy });
        });

        return updated;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [viewportWidth, viewportHeight]);

  // Handle drag end - add momentum
  const handleDragEnd = (id: string, info: PanInfo) => {
    setPositions((prev) => {
      const updated = new Map(prev);
      const card = updated.get(id);

      if (card) {
        updated.set(id, {
          ...card,
          vx: info.velocity.x * 0.5, // Scale down velocity
          vy: info.velocity.y * 0.5,
        });
      }

      return updated;
    });
  };

  // Apply external force (e.g., global swipe)
  const applyGlobalForce = (forceX: number, forceY: number) => {
    setPositions((prev) => {
      const updated = new Map(prev);

      updated.forEach((card, id) => {
        updated.set(id, {
          ...card,
          vx: card.vx + forceX,
          vy: card.vy + forceY,
        });
      });

      return updated;
    });
  };

  return {
    positions,
    handleDragEnd,
    applyGlobalForce,
  };
}
