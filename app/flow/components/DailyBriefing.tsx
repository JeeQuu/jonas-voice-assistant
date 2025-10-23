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

  const generateBriefingText = async () => {
    const now = new Date();
    const greeting = now.getHours() < 12 ? 'God morgon' : now.getHours() < 18 ? 'God dag' : 'God kväll';

    try {
      // Hämta AI-driven daglig kontext
      const response = await fetch('https://quant-show-api.onrender.com/api/daily-context', {
        headers: {
          'x-api-key': 'JeeQuuFjong'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch daily context');

      const { context } = await response.json();

      // Bygg intelligent briefing från AI insights
      let briefing = `${greeting} Jonas! `;

      if (context.insights?.summary) {
        // Använd AI-genererad sammanfattning
        briefing += context.insights.summary;
      } else {
        // Fallback till enkel briefing
        briefing += 'Här är din dagliga briefing. ';

        // Brådskande åtgärder
        if (context.insights?.urgentActions?.length > 0) {
          const urgent = context.insights.urgentActions;
          briefing += `Du har ${urgent.length} brådskande ${urgent.length === 1 ? 'sak' : 'saker'}. `;

          urgent.slice(0, 3).forEach((action: any) => {
            if (action.type === 'upcoming_event') {
              briefing += `${action.title} börjar om ${action.minutesRemaining} minuter. `;
            } else if (action.type === 'deadline') {
              briefing += `${action.title} har deadline om ${action.hoursRemaining} timmar. `;
            } else if (action.type === 'important_email') {
              briefing += `Viktigt mail från ${action.from}: ${action.subject}. `;
            }
          });
        }

        // Dagens kalenderevent
        if (context.calendarEvents?.length > 0) {
          briefing += `Idag har du ${context.calendarEvents.length} inplanerade ${context.calendarEvents.length === 1 ? 'aktivitet' : 'aktiviteter'}. `;

          context.calendarEvents.slice(0, 3).forEach((event: any) => {
            const time = new Date(event.start).toLocaleTimeString('sv-SE', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Stockholm'
            });
            briefing += `Klockan ${time}, ${event.title}. `;
          });
        }

        // Samband och insights
        if (context.insights?.connections?.length > 0) {
          const conn = context.insights.connections[0];
          if (conn.type === 'email_to_calendar') {
            briefing += `Jag ser att du har fått mail om ${conn.email} som kopplar till ${conn.event}. `;
          }
        }
      }

      briefing += ' Ha en fantastisk dag!';
      return briefing;

    } catch (error) {
      console.error('Failed to generate AI briefing:', error);

      // Fallback till grundläggande briefing
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

      briefing += 'Här är din dagliga briefing. ';

      if (urgentTasks.length > 0) {
        briefing += `Du har ${urgentTasks.length} brådskande ${urgentTasks.length === 1 ? 'uppgift' : 'uppgifter'}. `;
        urgentTasks.slice(0, 3).forEach(task => {
          briefing += `${task.title}${task.time ? ` klockan ${task.time}` : ''}. `;
        });
      }

      if (scheduledTasks.length > 0) {
        briefing += `Idag har du ${scheduledTasks.length} inplanerade ${scheduledTasks.length === 1 ? 'aktivitet' : 'aktiviteter'}. `;
        scheduledTasks.slice(0, 5).forEach(task => {
          briefing += `Klockan ${task.time}, ${task.title}. `;
        });
      }

      briefing += 'Ha en fantastisk dag!';
      return briefing;
    }
  };

  const playBriefing = async () => {
    setIsLoading(true);
    try {
      const briefingText = await generateBriefingText();

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

      // Play audio - mobile friendly approach
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = `data:audio/mpeg;base64,${audioBase64}`;

      audio.onended = () => setIsPlaying(false);
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        throw new Error('Audio playback failed');
      };

      // Load audio first (important for mobile)
      await audio.load();
      setIsPlaying(true);

      // Try to play with proper error handling for mobile
      try {
        await audio.play();
      } catch (playError: any) {
        setIsPlaying(false);
        console.error('Play error:', playError);

        // Mobile-specific error message
        if (playError.name === 'NotAllowedError' || playError.name === 'NotSupportedError') {
          alert('Mobilen blockerade uppspelning. Tryck på knappen igen för att spela.');
        } else {
          throw playError;
        }
      }
    } catch (error: any) {
      console.error('Failed to play briefing:', error);
      alert(`Kunde inte spela upp briefing: ${error.message || 'Okänt fel'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={playBriefing}
      disabled={isLoading || isPlaying}
      className={`w-full p-6 border-2 transition-all font-light text-lg ${
        isLoading || isPlaying
          ? 'bg-[#E8E2D5] border-[#D4CDC1] text-[#A89E92] cursor-not-allowed'
          : 'bg-white border-[#6B8E7F] text-[#6B8E7F] hover:bg-[#6B8E7F] hover:text-white'
      }`}
    >
      {isLoading ? (
        '⏳ Genererar briefing...'
      ) : isPlaying ? (
        '🔊 Spelar upp...'
      ) : (
        '💬 Dagens briefing'
      )}
    </button>
  );
}
