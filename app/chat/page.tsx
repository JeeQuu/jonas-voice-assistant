'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2, Sparkles } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'JeeQuuFjong';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [healthToday, setHealthToday] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Brainolf 2.0 context on mount
  useEffect(() => {
    loadUserContext();
    loadHealthToday();
  }, []);

  const loadUserContext = async () => {
    try {
      // Call Next.js local API route (not external backend)
      const res = await fetch('/api/user-context/summary');
      const data = await res.json();
      if (data.success) {
        setContext(data);
        // Add system message with context
        setMessages([{
          role: 'system',
          content: `🧠 Brainolf aktiv. Känner dig nu, Jonas.`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  };

  const loadHealthToday = async () => {
    try {
      // Call Next.js local API route (not external backend)
      const res = await fetch('/api/user-health/today');
      const data = await res.json();
      if (data.exists) {
        setHealthToday(data.health);
      }
    } catch (error) {
      console.error('Failed to load health:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Next.js chat endpoint (not backend API)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          context: context?.summary,
          history: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();

      if (data.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Save insight if important
        if (data.shouldSaveInsight) {
          await saveInsight(text, data.response);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ursäkta, något gick fel. Försök igen.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveInsight = async (userMsg: string, aiResponse: string) => {
    try {
      // Call Next.js local API route (not external backend)
      await fetch('/api/user-context/insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          insight: `Konversation: ${userMsg} → ${aiResponse}`,
          category: 'general',
          importance: 3
        })
      });
    } catch (error) {
      console.error('Failed to save insight:', error);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Kunde inte få tillgång till mikrofon');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Use existing voice-simple endpoint for transcription
      const response = await fetch('/api/voice-simple', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.transcript) {
        await sendMessage(data.transcript);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-green-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-stone-800">Jonas AI</h1>
              <p className="text-xs text-stone-500">Powered by Brainolf 2.0</p>
            </div>
          </div>

          {/* Health indicator */}
          {healthToday && (
            <div className="hidden md:flex items-center gap-2 text-sm text-stone-600">
              <div className="flex items-center gap-1">
                <span>😊</span>
                <span>{healthToday.mood_score}/10</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⚡</span>
                <span>{healthToday.energy_level}/10</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Chat container */}
      <main className="max-w-4xl mx-auto px-6 py-8 pb-32">
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-2xl px-5 py-3 shadow-sm
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-green-600 to-green-700 text-white'
                    : msg.role === 'system'
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-white text-stone-800 border border-stone-200'
                  }
                `}
              >
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                <p className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-green-100' : 'text-stone-400'
                }`}>
                  {msg.timestamp.toLocaleTimeString('sv-SE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-stone-200">
                <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-end gap-3">
            {/* Voice button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`
                p-4 rounded-2xl transition-all transform active:scale-95
                ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gradient-to-br from-amber-500 to-green-600 hover:from-amber-600 hover:to-green-700'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                shadow-lg
              `}
            >
              {isRecording ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Skriv något..."
                disabled={isLoading || isRecording}
                className="
                  w-full px-6 py-4 rounded-2xl
                  bg-stone-50 border-2 border-stone-200
                  focus:border-green-500 focus:outline-none
                  text-stone-800 placeholder-stone-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              />
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading || isRecording}
              className="
                p-4 rounded-2xl
                bg-gradient-to-br from-green-600 to-green-700
                hover:from-green-700 hover:to-green-800
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all transform active:scale-95
                shadow-lg
              "
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="mt-3 flex items-center justify-center gap-2 text-red-600 text-sm">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span>Spelar in...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
