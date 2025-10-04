'use client';

import { useState } from 'react';
import FlowMode from './components/FlowMode';
import FocusMode from './components/FocusMode';

export default function FlowDashboard() {
  const [mode, setMode] = useState<'flow' | 'focus'>('flow');

  const toggleMode = () => {
    setMode(mode === 'flow' ? 'focus' : 'flow');
  };

  return (
    <div
      className="min-h-screen bg-[#F5F5F5]"
      onDoubleClick={toggleMode}
    >
      {mode === 'flow' ? (
        <FlowMode onToggleMode={toggleMode} />
      ) : (
        <FocusMode onToggleMode={toggleMode} />
      )}

      {/* Mode indicator - geometric block */}
      <div className="fixed bottom-4 right-4 bg-[#2C3E50] text-white px-4 py-2 border-4 border-white font-black text-xs shadow-lg">
        {mode === 'flow' ? '✨ FLOW' : '🎯 FOCUS'} • DOUBLE-TAP
      </div>
    </div>
  );
}
