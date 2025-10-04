'use client';

import { useState, useEffect, useRef } from 'react';
import FlowMode from './components/FlowMode';
import FocusMode from './components/FocusMode';

export default function FlowDashboard() {
  const [mode, setMode] = useState<'flow' | 'focus'>('flow');
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
    setMode(mode === 'flow' ? 'focus' : 'flow');
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F5F5F5]"
      onDoubleClick={toggleMode}
    >
      {mode === 'flow' ? (
        <FlowMode onToggleMode={toggleMode} />
      ) : (
        <FocusMode onToggleMode={toggleMode} />
      )}

      {/* Mode indicator - geometric block */}
      <div className="fixed bottom-4 right-4 bg-[#2C3E50] text-white px-4 py-2 border-4 border-white font-black text-xs shadow-lg">
        {mode === 'flow' ? '✨ FLOW' : '🎯 FOCUS'} • DOUBLE-TAP
      </div>

      {/* Music toggle - geometric block */}
      <button
        onClick={toggleMute}
        className="fixed bottom-4 left-4 bg-[#87CEEB] text-[#2C3E50] px-4 py-2 border-4 border-white font-black text-xs shadow-lg hover:scale-105 transition-transform"
      >
        {isMuted ? '🔇 MUTED' : '🎵 ZEN MUSIC'}
      </button>
    </div>
  );
}
