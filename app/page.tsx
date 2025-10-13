'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">

        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl">
          <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Jonas AI
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            Din personliga AI-assistent med 30 integrerade operationer
          </p>
          <p className="text-lg text-gray-400">
            Powered by Claude 3.5 Sonnet & Brainolf 2.0
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full mb-16">

          {/* Chat Card */}
          <Link
            href="/chat"
            className="group relative bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-2xl border-4 border-white/20 hover:border-white/40 transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-3xl font-black mb-3">CHAT</h2>
            <p className="text-blue-100 mb-4">
              Din huvudassistent med full tillgång till alla dina verktyg
            </p>
            <ul className="text-sm text-blue-200 space-y-2">
              <li>✓ Gmail & Kalender</li>
              <li>✓ Kvitton & Ekonomi</li>
              <li>✓ Todos & Smartminne</li>
              <li>✓ Dropbox & Prenumerationer</li>
              <li>✓ Brainolf 2.0 Personlighet</li>
            </ul>
            <div className="absolute bottom-4 right-4 text-white/50 group-hover:text-white transition-colors">
              →
            </div>
          </Link>

          {/* Flow Card */}
          <Link
            href="/flow"
            className="group relative bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-2xl border-4 border-white/20 hover:border-white/40 transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-6xl mb-4">🧘</div>
            <h2 className="text-3xl font-black mb-3">FLOW</h2>
            <p className="text-purple-100 mb-4">
              ADHD-vänlig översikt med zen-vibes för fokus & kreativitet
            </p>
            <ul className="text-sm text-purple-200 space-y-2">
              <li>✓ FLOW & FOCUS modes</li>
              <li>✓ Zen meditation musik</li>
              <li>✓ Morning meditation</li>
              <li>✓ Visuell task overview</li>
              <li>✓ Minimal distractions</li>
            </ul>
            <div className="absolute bottom-4 right-4 text-white/50 group-hover:text-white transition-colors">
              →
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full mb-12">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-center">
            <div className="text-3xl font-black text-blue-400">30</div>
            <div className="text-sm text-gray-300">Operationer</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-center">
            <div className="text-3xl font-black text-purple-400">24/7</div>
            <div className="text-sm text-gray-300">Tillgänglig</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-center">
            <div className="text-3xl font-black text-pink-400">AI</div>
            <div className="text-sm text-gray-300">Claude 3.5</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-center">
            <div className="text-3xl font-black text-green-400">✓</div>
            <div className="text-sm text-gray-300">Mobil-ready</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl w-full mb-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-200">Vad kan jag hjälpa dig med?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '📧', label: 'Gmail' },
              { icon: '📅', label: 'Kalender' },
              { icon: '✅', label: 'Todos' },
              { icon: '🧠', label: 'Minne' },
              { icon: '💰', label: 'Kvitton' },
              { icon: '💳', label: 'Prenumerationer' },
              { icon: '📁', label: 'Dropbox' },
              { icon: '📊', label: 'Analytics' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 text-center hover:bg-white/10 transition-colors"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm text-gray-300">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>Maintained by Jonas Quant • Powered by Anthropic Claude</p>
          <p className="mt-2">
            <a
              href="https://github.com/jonasquant"
              className="hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub →
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
