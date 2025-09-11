// Jonas Voice Assistant SDK
// Use this in any JavaScript project!

class JonasVoiceAssistant {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || 'http://localhost:3000';
    this.apiKey = config.apiKey || 'JeeQuuFjong';
    this.memoryApiUrl = config.memoryApiUrl || 'https://quant-fast-cbliiw4pz-jonas-quants-projects.vercel.app';
    this.language = config.language || 'sv';
    this.autoPlay = config.autoPlay !== false;
    
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.onTranscript = config.onTranscript || (() => {});
    this.onResponse = config.onResponse || (() => {});
    this.onMemories = config.onMemories || (() => {});
    this.onError = config.onError || console.error;
  }

  // Initialize microphone
  async init() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        await this.processVoice(audioBlob);
      };
      
      return true;
    } catch (error) {
      this.onError('Microphone access denied');
      return false;
    }
  }

  // Start recording
  startRecording() {
    if (!this.mediaRecorder) {
      this.onError('Not initialized. Call init() first');
      return false;
    }
    
    if (this.mediaRecorder.state === 'inactive') {
      this.audioChunks = [];
      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    }
    return false;
  }

  // Stop recording and process
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      return true;
    }
    return false;
  }

  // Process voice with API
  async processVoice(audioBlob) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch(`${this.apiUrl}/api/voice-process`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      // Emit events
      if (data.transcript) {
        this.onTranscript(data.transcript);
      }
      
      if (data.response) {
        this.onResponse(data.response);
      }
      
      if (data.memories) {
        this.onMemories(data.memories);
      }
      
      // Auto-play audio response
      if (data.audioUrl && this.autoPlay) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
      }
      
      return data;
      
    } catch (error) {
      this.onError(error);
      throw error;
    }
  }

  // Direct text input (no voice)
  async askText(question) {
    try {
      // Search memories first
      const memories = await this.searchMemories(question);
      
      // Generate response
      const response = await fetch(`${this.apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: question,
          memories: memories.slice(0, 5)
        })
      });
      
      const data = await response.json();
      
      if (data.response) {
        this.onResponse(data.response);
      }
      
      // Generate and play voice
      if (this.autoPlay && data.response) {
        await this.speak(data.response);
      }
      
      return data;
      
    } catch (error) {
      this.onError(error);
      throw error;
    }
  }

  // Search smart memories
  async searchMemories(query) {
    try {
      const response = await fetch(`${this.memoryApiUrl}/api/memory-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({ 
          search_term: query,
          smart: true
        })
      });
      
      const data = await response.json();
      this.onMemories(data.results || []);
      return data.results || [];
      
    } catch (error) {
      console.error('Memory search failed:', error);
      return [];
    }
  }

  // Text to speech with ElevenLabs
  async speak(text, voice = 'swedish') {
    try {
      const response = await fetch(`${this.apiUrl}/api/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice })
      });
      
      const data = await response.json();
      
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
        return audio;
      }
      
    } catch (error) {
      this.onError('TTS failed: ' + error.message);
    }
  }

  // Save to memory
  async saveMemory(content, type = 'conversation', importance = 3) {
    try {
      const response = await fetch(`${this.memoryApiUrl}/api/memory-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({ content, type, importance })
      });
      
      return await response.json();
      
    } catch (error) {
      this.onError('Failed to save memory: ' + error.message);
    }
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JonasVoiceAssistant;
}

if (typeof window !== 'undefined') {
  window.JonasVoiceAssistant = JonasVoiceAssistant;
}

// Usage example:
/*
const assistant = new JonasVoiceAssistant({
  onTranscript: (text) => console.log('You said:', text),
  onResponse: (text) => console.log('Jonas says:', text),
  onMemories: (memories) => console.log('Found memories:', memories)
});

// Initialize and start
await assistant.init();

// Voice input
assistant.startRecording();
// ... user speaks ...
assistant.stopRecording();

// Or text input
await assistant.askText('Vad heter Henriks flickvän?');

// Search memories
const memories = await assistant.searchMemories('Liseberg');

// Speak any text
await assistant.speak('Hej Jonas, hur mår du?');
*/