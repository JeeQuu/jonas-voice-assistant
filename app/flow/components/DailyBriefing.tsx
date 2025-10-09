'use client';

import { useState } from 'react';

interface DailyBriefingProps {
  tasks: Array<{
    title: string;
    time?: string;
    category: string;
    urgent?: boolean;
  }>;
}

export function DailyBriefing({ tasks }: DailyBriefingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateBriefingText = () => {
    const now = new Date();
    const greeting = now.getHours() < 12 ? 'God morgon' : now.getHours() < 18 ? 'God dag' : 'God kväll';

    const urgentTasks = tasks.filter(t => t.urgent);
    const scheduledTasks = tasks.filter(t => t.time).sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return a.time.localeCompare(b.time);
    });

    let briefing = `${greeting} Jonas! `;

    if (tasks.length === 0) {
      briefing += 'Du har inga planerade aktiviteter idag. En lugn dag att njuta av!';
      return briefing;
    }

    briefing += `Här är din dagliga briefing. `;

    // Urgent items first
    if (urgentTasks.length > 0) {
      briefing += `Du har ${urgentTasks.length} brådskande ${urgentTasks.length === 1 ? 'uppgift' : 'uppgifter'}. `;
      urgentTasks.slice(0, 3).forEach(task => {
        briefing += `${task.title}${task.time ? ` klockan ${task.time}` : ''}. `;
      });
    }

    // Scheduled events
    if (scheduledTasks.length > 0) {
      briefing += `Idag har du ${scheduledTasks.length} inplanerade ${scheduledTasks.length === 1 ? 'aktivitet' : 'aktiviteter'}. `;

      scheduledTasks.slice(0, 5).forEach(task => {
        briefing += `Klockan ${task.time}, ${task.title}. `;
      });
    }

    // Summary by category
    const categories = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryNames: Record<string, string> = {
      jobb: 'jobb',
      familj: 'familj',
      hälsa: 'hälsa',
      projekt: 'projekt'
    };

    const categorySummary = Object.entries(categories)
      .filter(([cat]) => categoryNames[cat])
      .map(([cat, count]) => `${count} ${categoryNames[cat]}`)
      .join(', ');

    if (categorySummary) {
      briefing += `Totalt handlar det om ${categorySummary}. `;
    }

    briefing += 'Ha en fantastisk dag!';

    return briefing;
  };

  const playBriefing = async () => {
    setIsLoading(true);
    try {
      const briefingText = generateBriefingText();

      // Call API to generate audio
      const response = await fetch('https://quant-show-api.onrender.com/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'JeeQuuFjong'
        },
        body: JSON.stringify({
          text: briefingText,
          voice_id: '4xkUqaR9MYOJHoaC1Nak' // Anthony voice
        })
      });

      if (!response.ok) throw new Error('Failed to generate audio');

      const { audioBase64 } = await response.json();

      // Play audio
      const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
      setIsPlaying(true);

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);

      await audio.play();
    } catch (error) {
      console.error('Failed to play briefing:', error);
      alert('Kunde inte spela upp briefing. Kontrollera att ElevenLabs API är konfigurerat.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={playBriefing}
      disabled={isLoading || isPlaying}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
    >
      {isLoading ? (
        <>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Genererar briefing...
        </>
      ) : isPlaying ? (
        <>
          <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          Spelar upp...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          Spela dagens briefing
        </>
      )}
    </button>
  );
}
