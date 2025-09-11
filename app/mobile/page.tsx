'use client';

import { useState, useRef, useEffect } from 'react';

export default function MobileAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
        .catch(err => console.error('Mic access denied:', err));
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setIsProcessing(true);
    } else {
      audioChunksRef.current = [];
      mediaRecorderRef.current?.start();
      setIsRecording(true);
      setTranscript('');
      setResponse('');
      setShowQuickActions(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const result = await fetch('/api/voice-process', {
        method: 'POST',
        body: formData
      });
      
      const data = await result.json();
      
      if (data.transcript) setTranscript(data.transcript);
      if (data.response) setResponse(data.response);
      
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAsk = async (question: string) => {
    setTranscript(question);
    setResponse('Tänker...');
    setShowQuickActions(false);
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question })
      });
      
      const data = await res.json();
      if (data.response) setResponse(data.response);
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white">
      <div className="flex flex-col h-screen p-4 max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold mb-2">Jonas AI</h1>
          <p className="text-sm opacity-70">Din personliga assistent</p>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center space-y-6">
          
          {/* Quick Actions */}
          {showQuickActions && !transcript && (
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <button 
                onClick={() => quickAsk('Vad har jag för möten idag?')}
                className="bg-white/10 backdrop-blur p-4 rounded-2xl text-sm"
              >
                📅 Dagens schema
              </button>
              <button 
                onClick={() => quickAsk('Vad kostar mina prenumerationer?')}
                className="bg-white/10 backdrop-blur p-4 rounded-2xl text-sm"
              >
                💰 Kostnader
              </button>
              <button 
                onClick={() => quickAsk('Status på Liseberg projektet?')}
                className="bg-white/10 backdrop-blur p-4 rounded-2xl text-sm"
              >
                🎢 Liseberg
              </button>
              <button 
                onClick={() => quickAsk('Vad har jag för todos?')}
                className="bg-white/10 backdrop-blur p-4 rounded-2xl text-sm"
              >
                ✅ Todos
              </button>
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <div className="w-full max-w-sm bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-xs opacity-60 mb-1">Du sa:</p>
              <p className="text-lg">{transcript}</p>
            </div>
          )}

          {/* Response */}
          {response && response !== 'Tänker...' && (
            <div className="w-full max-w-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur rounded-2xl p-4">
              <p className="text-xs opacity-60 mb-1">Jonas AI:</p>
              <p className="text-lg">{response}</p>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span className="text-sm opacity-70">Bearbetar...</span>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="pb-8 pt-4">
          {/* Mic Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`
                relative w-24 h-24 rounded-full transition-all duration-300
                ${isRecording 
                  ? 'bg-red-500 scale-110 animate-pulse shadow-lg shadow-red-500/50' 
                  : 'bg-white/20 backdrop-blur hover:bg-white/30 active:scale-95'}
                ${isProcessing ? 'opacity-50' : ''}
                flex items-center justify-center
              `}
            >
              {isProcessing ? (
                <div className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full" />
              ) : (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d={isRecording 
                    ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                    : "M12 14c1.66 0 3-1.34 3-3l0-6c0-1.66-1.34-3-3-3S9 3.34 9 5l0 6C9 12.66 10.34 14 12 14zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92H17z"}
                  />
                </svg>
              )}
            </button>
          </div>
          
          <p className="text-center mt-4 text-xs opacity-60">
            {isRecording ? 'Släpp för att skicka' : 'Håll för att prata'}
          </p>

          {/* Reset button */}
          {(transcript || response) && !isRecording && !isProcessing && (
            <button
              onClick={() => {
                setTranscript('');
                setResponse('');
                setShowQuickActions(true);
              }}
              className="w-full mt-4 py-3 bg-white/10 backdrop-blur rounded-full text-sm"
            >
              Ny fråga
            </button>
          )}
        </div>
      </div>
    </main>
  );
}