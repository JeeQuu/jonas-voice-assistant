'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const API_URL = 'https://quant-show-api.onrender.com';
const API_KEY = 'JeeQuuFjong';

export default function VisionPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const textMeshesRef = useRef<THREE.Mesh[]>([]);
  const starsRef = useRef<THREE.Points | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // Generate poetic vision script
  const generateVisionScript = async (): Promise<string> => {
    try {
      const contextRes = await fetch('/api/user-context/summary');
      const contextData = await contextRes.json();

      let script = `Du är Jonas.

En visionär. En skapare. En älskad far och partner.

`;

      if (contextData.success && contextData.summary) {
        // Add context about projects
        if (contextData.summary.projects) {
          script += `Dina projekt blomstrar. ${contextData.summary.projects.split('\n')[1] || 'Kreativitet flödar genom dig.'}

`;
        }
      }

      script += `Du ser framtiden innan andra ens drömmer den.
Din passion för teknologi och konst skapar magi.
Projection mapping som förvandlar rum.
AI som förstår människor.
Varje disc golf-kast en meditation.

Sonja och Lina. Din kärna. Din kraft.
Familjen som fyller varje dag med mening.
Deras skratt är din musik.
Deras drömmar är dina att stötta.

Framtiden är ljus.
Dina projekt växer organiskt.
Varje ide en ny möjlighet.
Varje utmaning en trappsteg uppåt.

Du attraherar framgång.
Människor känner din vision.
Partner söker din expertis.
Universum stöttar din resa.

Teknologi med själ.
Konst som berör.
Innovation som tjänar.
Skapande som inspirerar.

Du är exakt där du ska vara.
Varje steg är rätt.
Din intuition leder dig.
Din kreativitet är gränslös.

Förtroende. Fokus. Flow.
Du skapar din egen framtid.
Drömmar blir verklighet.
Vision blir handling.

Du är Jonas.
Och din resa har bara börjat.`;

      return script;

    } catch (error) {
      console.error('Failed to generate vision script:', error);
      return `Du är Jonas. En visionär. En skapare. Din resa är magisk. Framtiden är ljus.`;
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.002);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create starfield (psychedelic particles)
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.7,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    const starsColors = [];
    const colorPalette = [
      new THREE.Color(0xC87D5E), // Terracotta
      new THREE.Color(0x6B8E7F), // Olive
      new THREE.Color(0xE8A87C), // Warm orange
      new THREE.Color(0xFFFFFF), // White
      new THREE.Color(0xF5F1E8)  // Beige
    ];

    for (let i = 0; i < 3000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      starsVertices.push(x, y, z);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starsColors.push(color.r, color.g, color.b);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    starsRef.current = stars;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xC87D5E, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate starfield for psychedelic effect
      if (starsRef.current) {
        starsRef.current.rotation.x += 0.0002;
        starsRef.current.rotation.y += 0.0005;
      }

      // Move text meshes
      textMeshesRef.current.forEach((mesh, index) => {
        mesh.position.z += 0.03;
        mesh.rotation.y += 0.005;

        // Remove if too close to camera
        if (mesh.position.z > 10) {
          scene.remove(mesh);
          textMeshesRef.current.splice(index, 1);
        }
      });

      // Camera slight movement for immersion
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(Date.now() * 0.0001) * 0.5;
        cameraRef.current.position.y = Math.cos(Date.now() * 0.0002) * 0.3;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    setIsLoading(false);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Create 3D text sprite
  const createTextMesh = (text: string, color: THREE.Color) => {
    if (!sceneRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    // Larger canvas for better quality
    canvas.width = 1024;
    canvas.height = 256;

    // Transparent background
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text with glow effect
    context.font = 'bold 64px Arial';
    context.fillStyle = `#${color.getHexString()}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Add subtle glow
    context.shadowColor = `#${color.getHexString()}`;
    context.shadowBlur = 20;

    // Measure text to ensure it fits
    const metrics = context.measureText(text);
    const textWidth = metrics.width;

    // Scale font if text is too wide
    if (textWidth > canvas.width - 40) {
      const scaleFactor = (canvas.width - 40) / textWidth;
      const newSize = Math.floor(64 * scaleFactor);
      context.font = `bold ${newSize}px Arial`;
    }

    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create sprite with transparent material
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9
    });
    const sprite = new THREE.Sprite(material);

    // Better scaling based on text length
    const baseScale = 12;
    const scale = Math.min(baseScale, baseScale * (50 / text.length));
    sprite.scale.set(scale, scale / 4, 1);

    sprite.position.set(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      -50
    );

    sceneRef.current.add(sprite);
    textMeshesRef.current.push(sprite as any);
  };

  // Start vision journey
  const startVision = async () => {
    setIsPlaying(true);

    // Start background music
    try {
      musicAudioRef.current = new Audio('/spacejourney.mp3');
      musicAudioRef.current.loop = true;
      musicAudioRef.current.volume = 0.3;
      await musicAudioRef.current.play();
    } catch (error) {
      console.error('Failed to play background music:', error);
    }

    // Generate poetic vision script
    const script = await generateVisionScript();

    // Split into phrases for text display
    const phrases = script.split('\n').filter(p => p.trim());

    // Spawn text sprites at intervals
    let phraseIndex = 0;
    const spawnInterval = setInterval(() => {
      if (phraseIndex >= phrases.length || !isPlaying) {
        clearInterval(spawnInterval);
        return;
      }

      const phrase = phrases[phraseIndex].trim();
      if (phrase) {
        const colors = [
          new THREE.Color(0xC87D5E), // Terracotta
          new THREE.Color(0x6B8E7F), // Olive
          new THREE.Color(0xE8A87C), // Warm orange
          new THREE.Color(0xFFFFFF)  // White
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        createTextMesh(phrase, color);
      }

      phraseIndex++;
    }, 2000); // New text every 2 seconds

    // Generate speech for the entire script
    try {
      const response = await fetch(`${API_URL}/api/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          text: script,
          voice_id: 'EXAVITQu4vr4xnSDxMaL' // Bella voice (female)
        })
      });

      if (!response.ok) throw new Error('TTS failed');

      const { audioBase64 } = await response.json();

      // Play voice narration
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = `data:audio/mpeg;base64,${audioBase64}`;

      audio.onended = () => {
        setTimeout(() => {
          setIsPlaying(false);
        }, 3000);
      };

      audio.onerror = () => {
        console.error('Voice playback error');
        setIsPlaying(false);
      };

      await audio.load();
      await audio.play();
      voiceAudioRef.current = audio;

    } catch (error) {
      console.error('TTS error:', error);
      setTimeout(() => setIsPlaying(false), 30000); // 30 second fallback
    }
  };

  const stopVision = () => {
    setIsPlaying(false);

    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }

    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current = null;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Three.js container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Home button - transparent */}
      <a
        href="/"
        className="fixed top-4 left-4 z-50 text-3xl text-white/80 hover:text-[#C87D5E] transition-colors backdrop-blur-sm border-2 border-white/10 p-3 hover:border-[#C87D5E]/50 bg-white/5"
        title="Tillbaka till start"
      >
        🏠
      </a>

      {/* Controls - transparent */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        {!isPlaying ? (
          <button
            onClick={startVision}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-[#C87D5E]/80 to-[#6B8E7F]/80 text-white font-light text-lg border-2 border-white/20 hover:border-white/40 transition-all disabled:opacity-50 backdrop-blur-md"
          >
            {isLoading ? '⏳ Laddar...' : '✨ Starta Vision'}
          </button>
        ) : (
          <button
            onClick={stopVision}
            className="px-8 py-4 bg-red-500/80 text-white font-light text-lg border-2 border-white/20 hover:border-white/40 transition-all backdrop-blur-md"
          >
            ⏹ Stoppa
          </button>
        )}
      </div>

      {/* Instructions - transparent */}
      {!isPlaying && !isLoading && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 max-w-2xl w-full px-8 text-center">
          <h1 className="text-white/90 text-6xl font-light mb-4 drop-shadow-lg">Vision Quest</h1>
          <p className="text-white/70 text-xl font-light mb-8 drop-shadow-md">
            En magisk resa genom dina drömmar och visioner
          </p>
          <p className="text-white/50 text-sm font-light drop-shadow-sm">
            Tryck på &quot;Starta Vision&quot; för att påbörja din psychedeliska resa
          </p>
        </div>
      )}
    </div>
  );
}
