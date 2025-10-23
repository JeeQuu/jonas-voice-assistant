'use client';

import { useState, useEffect, useRef } from 'react';
import FlowMode from './components/FlowMode';
import MagneticField from './components/MagneticField';
import FocusMode from './components/FocusMode';
import { useTasks } from './hooks/useTasks';

export default function FlowDashboard() {
  const [mode, setMode] = useState<'magnetic' | 'flow' | 'focus'>('magnetic');
  const { tasks, markComplete } = useTasks(0); // Load today's tasks
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Create and play zen meditation music
    audioRef.current = new Audio('/sounds/zen-meditation.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.25; // Soft, soothing volume

    // Auto-play (with user interaction fallback)
    const playAudio = () => {
      audioRef.current?.play().catch(() => {
        // Browser blocked autoplay, will play on first user interaction
        document.addEventListener('click', () => {
          audioRef.current?.play();
        }, { once: true });
      });
    };

    playAudio();

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleMode = () => {
    if (mode === 'magnetic') setMode('flow');
    else if (mode === 'flow') setMode('focus');
    else setMode('magnetic');
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };


  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Home button - top left */}
      <a
        href="/"
        className="fixed top-4 left-4 z-50 text-3xl text-[#2C2420] hover:text-[#C87D5E] transition-colors bg-white border-2 border-[#D4CDC1] p-3 hover:border-[#C87D5E]"
        title="Tillbaka till start"
      >
        🏠
      </a>

      {mode === 'magnetic' ? (
        <MagneticField tasks={tasks} onToggleMode={toggleMode} onCompleteTask={markComplete} />
      ) : mode === 'flow' ? (
        <FlowMode onToggleMode={toggleMode} />
      ) : (
        <FocusMode onToggleMode={toggleMode} />
      )}

      {/* Mode indicator */}
      <div
        onDoubleClick={toggleMode}
        className="fixed bottom-4 right-4 bg-[#2C2420] text-white px-4 py-2 border-2 border-[#D4CDC1] font-light text-xs z-50 cursor-pointer hover:bg-[#C87D5E] transition-colors"
      >
        {mode.toUpperCase()} • DOUBLE-TAP
      </div>

      {/* Music toggle */}
      <button
        onClick={toggleMute}
        className="fixed bottom-4 left-4 bg-white border-2 border-[#6B8E7F] text-[#6B8E7F] px-4 py-2 font-light text-xs hover:bg-[#6B8E7F] hover:text-white transition-all"
      >
        {isMuted ? 'TYST' : 'ZEN MUSIK'}
      </button>

    </div>
  );
}
