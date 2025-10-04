import { useState, useEffect } from 'react';
import axios from 'axios';
import { Task } from '../types';
import { getCategory } from '../utils/categoryStyles';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quant-show-api.onrender.com';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'JeeQuuFjong';

export function useTasks(dayOffset: number = 0) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [dayOffset]);

  const fetchTasks = async () => {
    setLoading(true);

    // For MVP: Use mock data (API integration coming soon!)
    console.log('🎨 FLOW MVP: Using mock data for day offset:', dayOffset);
    setTasks(getMockTasks(dayOffset));
    setLoading(false);

    // TODO: Uncomment when API is ready
    /*
    try {
      const [todosRes, calendarRes] = await Promise.all([
        axios.get(`${API_URL}/api/memory-search`, {
          params: { q: 'todo', smart: true, limit: 20 },
          headers: { 'x-api-key': API_KEY }
        }),
        axios.get(`${API_URL}/api/calendar/events`, {
          params: { days: 7 },
          headers: { 'x-api-key': API_KEY }
        })
      ]);

      const todoTasks: Task[] = (todosRes.data.results || []).map((item: any) => ({
        id: item.id || Math.random().toString(),
        title: item.title || item.content?.substring(0, 50) || 'Untitled',
        description: item.content,
        category: getCategory(item),
        completed: false,
        urgent: item.importance >= 4,
        progress: 0
      }));

      const calendarTasks: Task[] = (calendarRes.data || [])
        .filter((event: any) => {
          const eventDate = new Date(event.start?.dateTime || event.start?.date);
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + dayOffset);
          return eventDate.toDateString() === targetDate.toDateString();
        })
        .map((event: any) => ({
          id: event.id || Math.random().toString(),
          title: event.summary || 'Event',
          description: event.description,
          time: new Date(event.start?.dateTime || event.start?.date).toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          category: getCategory(event),
          completed: false,
          urgent: false
        }));

      const allTasks = [...todoTasks, ...calendarTasks].sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        return 0;
      });

      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks(getMockTasks(dayOffset));
    } finally {
      setLoading(false);
    }
    */
  };

  const markComplete = async (id: string) => {
    // Optimistic update
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));

    // TODO: Persist to API
    // await axios.post(`${API_URL}/api/memory-store`, ...);
  };

  return { tasks, loading, fetchTasks, markComplete };
}

// Mock data for development - LOTS of tasks for testing!
function getMockTasks(dayOffset: number): Task[] {
  if (dayOffset === 0) {
    // Today - FULL day
    return [
      {
        id: '1',
        title: 'Liseberg Deadline',
        description: 'Animation projektion sista touch',
        time: '09:00',
        category: 'jobb',
        urgent: true,
        progress: 85
      },
      {
        id: '2',
        title: 'Sonja till skolan',
        description: 'Packa matsäck',
        time: '07:30',
        category: 'familj',
        urgent: false
      },
      {
        id: '3',
        title: 'Client meeting',
        description: 'Rune @ Liseberg',
        time: '10:30',
        category: 'jobb',
        urgent: false
      },
      {
        id: '4',
        title: 'Lunch med Karin',
        time: '12:00',
        category: 'familj',
        urgent: false
      },
      {
        id: '5',
        title: 'Ring Gun',
        description: 'Fredagsprat',
        time: '14:00',
        category: 'familj',
        urgent: false
      },
      {
        id: '6',
        title: 'Code review',
        description: 'Philip\'s animation code',
        time: '15:00',
        category: 'jobb',
        urgent: false,
        progress: 30
      },
      {
        id: '7',
        title: 'Discgolf',
        description: 'Med Henrik, Slottsskogen',
        time: '17:00',
        category: 'hälsa',
        urgent: false
      },
      {
        id: '8',
        title: 'Kvällsmat familjen',
        time: '19:00',
        category: 'familj',
        urgent: false
      },
      {
        id: '9',
        title: 'Yoga stretch',
        description: '15 min',
        time: '21:00',
        category: 'hälsa',
        urgent: false
      }
    ];
  } else if (dayOffset === -1) {
    // Yesterday
    return [
      {
        id: '10',
        title: 'Möte med Philip',
        time: '10:00',
        category: 'jobb',
        completed: true
      },
      {
        id: '11',
        title: 'Sigge förskola',
        time: '08:00',
        category: 'familj',
        completed: true
      },
      {
        id: '12',
        title: 'Gympass',
        time: '17:00',
        category: 'hälsa',
        completed: true
      },
      {
        id: '13',
        title: 'Netflix payment',
        category: 'jobb',
        completed: true
      },
      {
        id: '14',
        title: 'Stella doctors appt',
        time: '14:00',
        category: 'familj',
        completed: false,
        urgent: true
      }
    ];
  } else if (dayOffset === 1) {
    // Tomorrow
    return [
      {
        id: '15',
        title: 'Sonja veckoschema',
        time: '08:00',
        category: 'familj'
      },
      {
        id: '16',
        title: 'Liseberg final review',
        time: '11:00',
        category: 'jobb',
        urgent: true
      },
      {
        id: '17',
        title: 'Karin möte',
        time: '15:00',
        category: 'familj'
      },
      {
        id: '18',
        title: 'Löpning 5km',
        time: '18:00',
        category: 'hälsa'
      },
      {
        id: '19',
        title: 'Podcast recording',
        description: 'Quant Music episode',
        time: '20:00',
        category: 'jobb',
        progress: 0
      }
    ];
  } else {
    // Other days - random
    return [
      {
        id: `${dayOffset}-1`,
        title: 'General task',
        category: 'jobb'
      }
    ];
  }
}
