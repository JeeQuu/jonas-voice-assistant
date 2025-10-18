'use client';

import { useState, useEffect, useRef } from 'react';
import FlowMode from './components/FlowMode';
import MagneticField from './components/MagneticField';
import FocusMode from './components/FocusMode';
import { useTasks } from './hooks/useTasks';
import axios from 'axios';

// Always use production API (deployed on Render)
const API_URL = 'https://quant-show-api.onrender.com';
const API_KEY = 'JeeQuuFjong';

export default function FlowDashboard() {
  const [mode, setMode] = useState<'magnetic' | 'flow' | 'focus'>('magnetic');
  const { tasks } = useTasks(0); // Load today's tasks
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const meditationAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationScript, setMeditationScript] = useState<string>('');

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

  const playMorningMeditation = async () => {
    setIsMeditating(true);

    try {
      // Dim background music
      if (audioRef.current) {
        audioRef.current.volume = 0.1;
      }

      const response = await axios.get(`${API_URL}/api/morning-meditation`, {
        headers: { 'x-api-key': API_KEY }
      });

      if (response.data.success) {
        setMeditationScript(response.data.script);

        // Convert base64 audio to blob and play
        const audioBlob = new Blob(
          [Uint8Array.from(atob(response.data.audio), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);

        meditationAudioRef.current = new Audio(audioUrl);
        meditationAudioRef.current.volume = 1.0;

        meditationAudioRef.current.onended = () => {
          setIsMeditating(false);
          if (audioRef.current) {
            audioRef.current.volume = 0.25; // Restore background music
          }
        };

        await meditationAudioRef.current.play();
      }
    } catch (error) {
      console.error('Meditation error:', error);
      alert('Kunde inte ladda meditation. Försök igen.');
      setIsMeditating(false);
      if (audioRef.current) {
        audioRef.current.volume = 0.25;
      }
    }
  };

  const stopMeditation = () => {
    if (meditationAudioRef.current) {
      meditationAudioRef.current.pause();
      meditationAudioRef.current = null;
    }
    setIsMeditating(false);
    if (audioRef.current) {
      audioRef.current.volume = 0.25;
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F5F5F5]"
      onDoubleClick={toggleMode}
    >
      {mode === 'magnetic' ? (
        <MagneticField tasks={tasks} onToggleMode={toggleMode} />
      ) : mode === 'flow' ? (
        <FlowMode onToggleMode={toggleMode} />
      ) : (
        <FocusMode onToggleMode={toggleMode} />
      )}

      {/* Mode indicator - geometric block */}
      <div className="fixed bottom-4 right-4 bg-[#2C3E50] text-white px-4 py-2 border-4 border-white font-black text-xs shadow-lg z-50">
        {mode.toUpperCase()} • DOUBLE-TAP
      </div>

      {/* Music toggle - geometric block */}
      <button
        onClick={toggleMute}
        className="fixed bottom-4 left-4 bg-[#87CEEB] text-[#2C3E50] px-4 py-2 border-4 border-white font-black text-xs shadow-lg hover:scale-105 transition-transform"
      >
        {isMuted ? 'MUTED' : 'ZEN MUSIC'}
      </button>

      {/* Morning Meditation button */}
      <button
        onClick={isMeditating ? stopMeditation : playMorningMeditation}
        disabled={isMeditating && !meditationAudioRef.current}
        className={`fixed bottom-16 left-4 px-4 py-2 border-4 border-white font-black text-xs shadow-lg hover:scale-105 transition-all ${
          isMeditating
            ? 'bg-[#FF6B4A] text-white animate-pulse'
            : 'bg-[#2C3E50] text-white'
        }`}
      >
        {isMeditating ? '🧘 MEDITATING...' : '🧘 MORNING ZEN'}
      </button>

      {/* Meditation script overlay */}
      {isMeditating && meditationScript && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-white/10 border-4 border-white p-8 max-w-2xl max-h-[80vh] overflow-y-auto">
            <button
              onClick={stopMeditation}
              className="float-right bg-white/20 px-3 py-1 text-white font-bold text-sm hover:bg-white/30"
            >
              ✕ CLOSE
            </button>
            <h2 className="text-white text-2xl font-black mb-4">ZEN MEDITATION</h2>
            <p className="text-white/90 text-lg leading-relaxed whitespace-pre-wrap font-medium">
              {meditationScript}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
