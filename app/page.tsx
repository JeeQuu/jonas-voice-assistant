'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [memories, setMemories] = useState<any[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize media recorder
  useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          
          mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };
          
          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            audioChunksRef.current = [];
            await processAudio(audioBlob);
          };
        })
        .catch(err => console.error('Microphone access denied:', err));
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscript('');
      setResponse('');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert to WAV format for Whisper
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // Send to our API endpoint for processing
      const result = await fetch('/api/voice-process', {
        method: 'POST',
        body: formData
      });
      
      const data = await result.json();
      
      if (data.transcript) {
        setTranscript(data.transcript);
        setMessages(prev => [...prev, { role: 'user', content: data.transcript }]);
      }
      
      if (data.response) {
        setResponse(data.response);
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
      
      if (data.memories) {
        setMemories(data.memories);
      }
      
      // Play audio response if available
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play();
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const searchMemory = async (query: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/memory-search`,
        {
          params: { q: query, smart: true },
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY }
        }
      );
      setMemories(res.data.results || []);
    } catch (error) {
      console.error('Memory search failed:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Jonas AI Assistant
          </h1>
          <p className="text-gray-400">Powered by your smart memory system</p>
        </div>

        {/* Voice Control */}
        <div className="flex justify-center mb-8">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`
              relative p-8 rounded-full transition-all duration-300 transform
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'}
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center justify-center">
              {isProcessing ? (
                <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d={isRecording 
                    ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" // Pause icon
                    : "M12 14c1.66 0 3-1.34 3-3l0-6c0-1.66-1.34-3-3-3S9 3.34 9 5l0 6C9 12.66 10.34 14 12 14zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92H17z"} // Mic icon
                  />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Status */}
        <div className="text-center mb-8">
          {isRecording && (
            <p className="text-red-400 animate-pulse">🔴 Recording...</p>
          )}
          {isProcessing && (
            <p className="text-blue-400">Processing your voice...</p>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400 mb-2">You said:</h3>
            <p className="text-lg">{transcript}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
            <h3 className="text-sm text-gray-400 mb-2">Jonas AI:</h3>
            <p className="text-lg">{response}</p>
          </div>
        )}

        {/* Relevant Memories */}
        {memories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 mb-3">Related memories:</h3>
            <div className="space-y-2">
              {memories.slice(0, 3).map((memory, idx) => (
                <div key={idx} className="p-3 bg-gray-800/50 rounded border border-gray-700/50">
                  <p className="text-sm text-gray-300">
                    {memory.title || memory.content?.substring(0, 100)}
                  </p>
                  <span className="text-xs text-gray-500">
                    {memory.type} • Importance: {memory.importance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat History */}
        {messages.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm text-gray-400 mb-3">Conversation:</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded ${
                    msg.role === 'user' 
                      ? 'bg-gray-800 ml-12' 
                      : 'bg-blue-900/20 mr-12'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => searchMemory('Liseberg')}
            className="p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
          >
            🎢 Liseberg
          </button>
          <button 
            onClick={() => searchMemory('Henrik')}
            className="p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
          >
            👥 Friends
          </button>
          <button 
            onClick={() => searchMemory('subscriptions')}
            className="p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
          >
            💰 Costs
          </button>
          <button 
            onClick={() => searchMemory('todo')}
            className="p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
          >
            ✅ Todos
          </button>
        </div>
      </div>
    </main>
  );
}