'use client';

import { useState, useEffect, useRef } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar';

interface HeyGenAvatarProps {
  onAvatarResponse?: (text: string) => void;
  onUserSpeech?: (text: string) => void;
  disabled?: boolean;
}

export default function HeyGenAvatar({
  onAvatarResponse,
  onUserSpeech,
  disabled = false
}: HeyGenAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [debug, setDebug] = useState('');

  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [sessionToken, setSessionToken] = useState<string>('');

  const AVATAR_ID = process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || 'Katya_ProfessionalLook2_public';

  // Fetch session token from API
  async function fetchSessionToken() {
    try {
      const response = await fetch('/api/heygen/token', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.token) {
        setSessionToken(data.token);
        return data.token;
      } else {
        throw new Error(data.error || 'Failed to get token');
      }
    } catch (error) {
      console.error('Error fetching session token:', error);
      setDebug(`Token error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  // Initialize avatar when component mounts
  useEffect(() => {
    // Avatar will be initialized when session starts
    return () => {
      endSession();
    };
  }, []);

  // Set up event listeners when avatar is created
  function setupAvatarListeners(avatarInstance: StreamingAvatar) {
    avatarInstance.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log('Avatar started talking', e);
    });

    avatarInstance.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log('Avatar stopped talking', e);
    });

    avatarInstance.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log('Stream disconnected');
      endSession();
    });

    avatarInstance.on(StreamingEvents.STREAM_READY, (event) => {
      console.log('Stream ready:', event.detail);
      if (event.detail && mediaStream.current) {
        mediaStream.current.srcObject = event.detail;
        mediaStream.current.onloadedmetadata = () => {
          mediaStream.current?.play();
          setDebug('Stream is live');
        };
        setStream(event.detail);
      }
    });

    avatarInstance.on(StreamingEvents.USER_TALKING_MESSAGE, (message) => {
      console.log('User speech detected:', message);
      if (message && onUserSpeech) {
        onUserSpeech(message.detail);
      }
    });
  }

  async function startSession() {
    setIsLoadingSession(true);
    setDebug('Fetching session token...');

    try {
      // Step 1: Get session token
      const token = await fetchSessionToken();
      if (!token) {
        throw new Error('Failed to fetch session token');
      }

      setDebug('Initializing avatar...');

      // Step 2: Initialize avatar with token
      avatar.current = new StreamingAvatar({ token });
      setupAvatarListeners(avatar.current);

      // Step 3: Start avatar session
      const sessionData = await avatar.current.createStartAvatar({
        avatarName: AVATAR_ID,
        quality: AvatarQuality.High,
        voice: {
          voiceId: 'en-US-JennyNeural', // You can customize this
          rate: 1.0,
          emotion: VoiceEmotion.FRIENDLY,
        },
        language: 'sv', // Swedish language
        disableIdleTimeout: false,
      });

      setIsSessionActive(true);
      setDebug('Session active');
      console.log('Session started:', sessionData);
    } catch (error) {
      console.error('Error starting session:', error);
      setDebug(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function endSession() {
    if (!avatar.current || !isSessionActive) return;

    setDebug('Ending session...');
    try {
      await avatar.current.stopAvatar();
      setIsSessionActive(false);
      setStream(null);
      setDebug('Session ended');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Method to make avatar speak
  async function speak(text: string) {
    if (!avatar.current || !isSessionActive) {
      console.error('Avatar session not active');
      return;
    }

    setDebug(`Speaking: ${text.substring(0, 50)}...`);
    try {
      await avatar.current.speak({
        text: text,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });

      if (onAvatarResponse) {
        onAvatarResponse(text);
      }
    } catch (error) {
      console.error('Error speaking:', error);
      setDebug(`Speak error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Expose speak method via ref (can be called from parent)
  useEffect(() => {
    (window as any).heygenSpeak = speak;
  }, [isSessionActive]);

  return (
    <div className="heygen-avatar-container">
      <div className="avatar-video-wrapper">
        <video
          ref={mediaStream}
          autoPlay
          playsInline
          className="avatar-video"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '12px',
            backgroundColor: '#000'
          }}
        >
          <track kind="captions" />
        </video>

        {!isSessionActive && (
          <div className="avatar-overlay">
            <button
              onClick={startSession}
              disabled={isLoadingSession || disabled}
              className="start-avatar-btn"
            >
              {isLoadingSession ? 'Startar Katya...' : 'Starta Avatar'}
            </button>
          </div>
        )}
      </div>

      {isSessionActive && (
        <button
          onClick={endSession}
          className="end-session-btn"
        >
          Avsluta Avatar
        </button>
      )}

      {debug && (
        <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          {debug}
        </div>
      )}

      <style jsx>{`
        .heygen-avatar-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .avatar-video-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .avatar-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
        }

        .start-avatar-btn {
          padding: 16px 32px;
          font-size: 18px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .start-avatar-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .start-avatar-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .end-session-btn {
          margin-top: 12px;
          padding: 8px 16px;
          font-size: 14px;
          color: #666;
          background: #f0f0f0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
        }

        .end-session-btn:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
}
