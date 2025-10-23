'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { DailyBriefing } from './flow/components/DailyBriefing';
import axios from 'axios';

const API_URL = 'https://quant-show-api.onrender.com';
const API_KEY = 'JeeQuuFjong';

export default function HomePage() {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationScript, setMeditationScript] = useState<string>('');
  const meditationAudioRef = useRef<HTMLAudioElement | null>(null);

  const unlockAudio = () => {
    // Play a silent sound to unlock audio context on mobile
    const silentAudio = new Audio('data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
    silentAudio.play().then(() => {
      setAudioUnlocked(true);
    }).catch(() => {
      // Fallback: just mark as unlocked
      setAudioUnlocked(true);
    });
  };

  const playMorningMeditation = async () => {
    if (!audioUnlocked) {
      alert('Tryck först på "Aktivera ljud" för att låsa upp audio');
      return;
    }

    setIsMeditating(true);

    try {
      const response = await axios.get(`${API_URL}/api/morning-meditation`, {
        headers: { 'x-api-key': API_KEY }
      });

      if (response.data.success) {
        setMeditationScript(response.data.script);

        const audioBlob = new Blob(
          [Uint8Array.from(atob(response.data.audio), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);

        meditationAudioRef.current = new Audio();
        meditationAudioRef.current.preload = 'auto';
        meditationAudioRef.current.src = audioUrl;
        meditationAudioRef.current.volume = 1.0;

        meditationAudioRef.current.onended = () => {
          setIsMeditating(false);
          URL.revokeObjectURL(audioUrl);
        };

        meditationAudioRef.current.onerror = () => {
          console.error('Meditation audio playback error');
          setIsMeditating(false);
          URL.revokeObjectURL(audioUrl);
        };

        await meditationAudioRef.current.load();

        try {
          await meditationAudioRef.current.play();
        } catch (playError: any) {
          console.error('Meditation play error:', playError);
          setIsMeditating(false);
          URL.revokeObjectURL(audioUrl);

          if (playError.name === 'NotAllowedError' || playError.name === 'NotSupportedError') {
            alert('Mobilen blockerade uppspelning. Tryck på knappen igen.');
          } else {
            throw playError;
          }
        }
      }
    } catch (error: any) {
      console.error('Meditation error:', error);
      alert(`Kunde inte ladda meditation: ${error.message || 'Försök igen.'}`);
      setIsMeditating(false);
    }
  };

  const stopMeditation = () => {
    if (meditationAudioRef.current) {
      meditationAudioRef.current.pause();
      meditationAudioRef.current = null;
    }
    setIsMeditating(false);
  };

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="container mx-auto px-6 py-12 max-w-2xl">

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-light text-[#2C2420] mb-3 tracking-tight">
            Hej Jonas
          </h1>
          <p className="text-[#6B5D52] text-lg font-light">
            {new Date().toLocaleDateString('sv-SE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Audio Unlock */}
        {!audioUnlocked && (
          <button
            onClick={unlockAudio}
            className="w-full mb-8 p-6 bg-white border-2 border-[#D4CDC1] text-[#2C2420] font-light text-lg hover:border-[#C87D5E] transition-all"
          >
            🔊 Aktivera ljud
          </button>
        )}

        {audioUnlocked && (
          <div className="mb-4 p-4 bg-white border border-[#D4CDC1] text-[#6B5D52] text-sm font-light">
            ✓ Ljud aktiverat
          </div>
        )}

        {/* Morning Actions */}
        <div className="space-y-4 mb-16">
          <h2 className="text-2xl font-light text-[#2C2420] mb-6">Morgonrutiner</h2>

          {/* Morning Zen */}
          <button
            onClick={isMeditating ? stopMeditation : playMorningMeditation}
            disabled={!audioUnlocked}
            className={`w-full p-6 border-2 transition-all font-light text-lg ${
              !audioUnlocked
                ? 'bg-[#E8E2D5] border-[#D4CDC1] text-[#A89E92] cursor-not-allowed'
                : isMeditating
                ? 'bg-[#C87D5E] border-[#C87D5E] text-white'
                : 'bg-white border-[#C87D5E] text-[#C87D5E] hover:bg-[#C87D5E] hover:text-white'
            }`}
          >
            {isMeditating ? '⏸ Stoppa meditation' : '🧘 Morning Zen'}
          </button>

          {/* Daily Briefing */}
          <div className={!audioUnlocked ? 'opacity-50 pointer-events-none' : ''}>
            <DailyBriefing tasks={[]} />
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-4 mb-16">
          <h2 className="text-2xl font-light text-[#2C2420] mb-6">Gå till</h2>

          <Link
            href="/chat"
            className="block p-6 bg-white border-2 border-[#D4CDC1] text-[#2C2420] font-light text-lg hover:border-[#2C2420] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">💬</div>
                <div className="font-normal">Chat</div>
                <div className="text-sm text-[#6B5D52] mt-1">Din AI-assistent</div>
              </div>
              <div className="text-[#A89E92]">→</div>
            </div>
          </Link>

          <Link
            href="/flow"
            className="block p-6 bg-white border-2 border-[#D4CDC1] text-[#2C2420] font-light text-lg hover:border-[#2C2420] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">✨</div>
                <div className="font-normal">Flow</div>
                <div className="text-sm text-[#6B5D52] mt-1">ADHD-vänlig översikt</div>
              </div>
              <div className="text-[#A89E92]">→</div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-[#A89E92] text-sm font-light">
          Jonas AI • Powered by Claude
        </div>
      </div>

      {/* Meditation Overlay */}
      {isMeditating && meditationScript && (
        <div className="fixed inset-0 bg-[#2C2420]/90 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-[#F5F1E8] border-2 border-[#D4CDC1] p-8 max-w-2xl max-h-[80vh] overflow-y-auto">
            <button
              onClick={stopMeditation}
              className="float-right text-[#2C2420] hover:text-[#C87D5E] font-light text-sm mb-4"
            >
              ✕ Stäng
            </button>
            <h2 className="text-[#2C2420] text-2xl font-light mb-6">Morning Zen</h2>
            <p className="text-[#2C2420] text-lg leading-relaxed whitespace-pre-wrap font-light">
              {meditationScript}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
