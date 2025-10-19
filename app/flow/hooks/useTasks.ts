import { useState, useEffect } from 'react';
import axios from 'axios';
import { Task } from '../types';
import { getCategory } from '../utils/categoryStyles';

// Always use production API (deployed on Render)
const API_URL = 'https://quant-show-api.onrender.com';
const API_KEY = 'JeeQuuFjong';

export function useTasks(dayOffset: number = 0) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [dayOffset]);

  const fetchTasks = async () => {
    setLoading(true);

    try {
      const [todosRes, calendarRes] = await Promise.all([
        axios.get(`${API_URL}/api/todos`, {
          params: { status: 'pending' }, // Only get incomplete todos
          headers: { 'x-api-key': API_KEY }
        }),
        axios.get(`${API_URL}/api/calendar/events`, {
          params: { days: 7 },
          headers: { 'x-api-key': API_KEY }
        })
      ]);

      const todoTasks: Task[] = (todosRes.data.todos || []).map((item: any) => ({
        id: item.id || Math.random().toString(),
        title: item.summary || item.full_content?.substring(0, 50) || 'Untitled',
        description: item.full_content,
        category: getCategory(item),
        completed: !!item.completed_at,
        urgent: item.importance_level >= 4,
        progress: item.completed_at ? 100 : 0,
        dueDate: item.deadline,
        time: item.deadline ? new Date(item.deadline).toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit'
        }) : undefined
      }));

      const calendarTasks: Task[] = (calendarRes.data.events || [])
        .filter((event: any) => {
          const eventDate = new Date(event.start);
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + dayOffset);
          return eventDate.toDateString() === targetDate.toDateString();
        })
        .map((event: any) => ({
          id: event.id || Math.random().toString(),
          title: event.title || event.summary || 'Event',
          description: event.description,
          time: new Date(event.start).toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          category: getCategory(event),
          completed: false,
          urgent: false
        }));

      const allTasks = [...todoTasks, ...calendarTasks];

      // Sort tasks
      setTasks(allTasks.sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        return 0;
      }));

      console.log(`[useTasks] Loaded ${allTasks.length} tasks from API`);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Optimistic update
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed, progress: !t.completed ? 100 : 0 } : t
    ));

    try {
      // Persist to API
      await axios.patch(
        `${API_URL}/api/todos/${id}`,
        { completed: !task.completed },
        { headers: { 'x-api-key': API_KEY } }
      );
    } catch (error) {
      console.error('Failed to update todo:', error);
      // Revert on error
      setTasks(tasks.map(t =>
        t.id === id ? { ...t, completed: task.completed } : t
      ));
    }
  };

  return { tasks, loading, fetchTasks, markComplete };
}
