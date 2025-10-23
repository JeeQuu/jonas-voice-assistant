'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const API_URL = 'https://quant-show-api.onrender.com';
const API_KEY = 'JeeQuuFjong';

interface VisionItem {
  text: string;
  type: 'project' | 'affirmation' | 'todo' | 'idea';
  color: THREE.Color;
}

export default function VisionPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const textMeshesRef = useRef<THREE.Mesh[]>([]);
  const starsRef = useRef<THREE.Points | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visionItemsRef = useRef<VisionItem[]>([]);
  const currentIndexRef = useRef(0);

  // Generate affirmations and vision items
  const generateVisionItems = async (): Promise<VisionItem[]> => {
    const items: VisionItem[] = [];

    // Fetch user context
    try {
      const contextRes = await fetch('/api/user-context/summary');
      const contextData = await contextRes.json();

      if (contextData.success) {
        // Add projects
        if (contextData.summary?.projects) {
          const projectLines = contextData.summary.projects.split('\n');
          projectLines.forEach((line: string) => {
            if (line.trim() && !line.includes('Projekt:')) {
              items.push({
                text: line.trim().replace(/^-\s*/, ''),
                type: 'project',
                color: new THREE.Color(0xC87D5E) // Terracotta
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch context:', error);
    }

    // Powerful affirmations in Swedish
    const affirmations = [
      'Du skapar magi varje dag',
      'Dina idéer förändrar världen',
      'Du är en visionär',
      'Framgång flödar till dig naturligt',
      'Du förvandlar drömmar till verklighet',
      'Din kreativitet är gränslös',
      'Allt du behöver finns redan inom dig',
      'Du är exakt där du ska vara',
      'Universum stöttar dina visioner',
      'Du är en kraft att räkna med',
      'Dina projekt blomstrar och växer',
      'Du attraherar framgång och överflöd',
      'Din potential är obegränsad',
      'Du skapar din egen framtid',
      'Varje steg tar dig närmare dina mål'
    ];

    affirmations.forEach(affirmation => {
      items.push({
        text: affirmation,
        type: 'affirmation',
        color: new THREE.Color(0x6B8E7F) // Olive green
      });
    });

    // Ideas and inspiration
    const ideas = [
      'Projection mapping som förändrar rum',
      'AI som förstår och stöttar',
      'Disc golf i solnedgången',
      'Familj och kärlek',
      'Kreativitet och innovation',
      'Teknologi med själ',
      'Konst som berör',
      'Musik som förenar'
    ];

    ideas.forEach(idea => {
      items.push({
        text: idea,
        type: 'idea',
        color: new THREE.Color(0xE8A87C) // Warm orange
      });
    });

    // Shuffle items for variety
    return items.sort(() => Math.random() - 0.5);
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
    const renderer = new THREE.WebGLRenderer({ antialias: true });
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

  // Create 3D text
  const createTextMesh = (text: string, color: THREE.Color) => {
    if (!sceneRef.current) return;

    const loader = new FontLoader();

    // We'll use a simple sprite for now as FontLoader requires font files
    // Create a canvas-based sprite instead
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = 512;
    canvas.height = 128;

    // Draw text on canvas
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 48px Arial';
    context.fillStyle = `#${color.getHexString()}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    sprite.scale.set(8, 2, 1);
    sprite.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      -50
    );

    sceneRef.current.add(sprite);
    textMeshesRef.current.push(sprite as any);
  };

  // Start vision journey
  const startVision = async () => {
    setIsPlaying(true);

    // Generate vision items
    const items = await generateVisionItems();
    visionItemsRef.current = items;
    currentIndexRef.current = 0;

    // Play through items
    const playNextItem = async () => {
      if (currentIndexRef.current >= items.length) {
        setIsPlaying(false);
        setCurrentText('Vision Complete ✨');
        return;
      }

      const item = items[currentIndexRef.current];
      setCurrentText(item.text);
      createTextMesh(item.text, item.color);

      // Generate speech
      try {
        const response = await fetch(`${API_URL}/api/text-to-speech`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          body: JSON.stringify({
            text: item.text,
            voice_id: 'EXAVITQu4vr4xnSDxMaL' // Bella voice (female)
          })
        });

        if (!response.ok) throw new Error('TTS failed');

        const { audioBase64 } = await response.json();

        // Play audio
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = `data:audio/mpeg;base64,${audioBase64}`;

        audio.onended = () => {
          currentIndexRef.current++;
          setTimeout(playNextItem, 1000); // 1 second pause between items
        };

        audio.onerror = () => {
          currentIndexRef.current++;
          setTimeout(playNextItem, 3000);
        };

        await audio.load();
        await audio.play();
        audioRef.current = audio;

      } catch (error) {
        console.error('TTS error:', error);
        currentIndexRef.current++;
        setTimeout(playNextItem, 3000);
      }
    };

    playNextItem();
  };

  const stopVision = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Three.js container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Home button */}
      <a
        href="/"
        className="fixed top-4 left-4 z-50 text-3xl text-white hover:text-[#C87D5E] transition-colors bg-black/50 backdrop-blur-sm border-2 border-white/20 p-3 hover:border-[#C87D5E]"
        title="Tillbaka till start"
      >
        🏠
      </a>

      {/* Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        {!isPlaying ? (
          <button
            onClick={startVision}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-[#C87D5E] to-[#6B8E7F] text-white font-light text-lg border-2 border-white/30 hover:border-white transition-all disabled:opacity-50 backdrop-blur-sm"
          >
            {isLoading ? '⏳ Laddar...' : '✨ Starta Vision'}
          </button>
        ) : (
          <button
            onClick={stopVision}
            className="px-8 py-4 bg-black/70 text-white font-light text-lg border-2 border-red-500 hover:bg-red-500 transition-all backdrop-blur-sm"
          >
            ⏹ Stoppa
          </button>
        )}
      </div>

      {/* Current text display */}
      {isPlaying && currentText && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 max-w-4xl w-full px-8">
          <div className="bg-black/60 backdrop-blur-md border-2 border-[#C87D5E]/50 p-8 text-center">
            <p className="text-white text-3xl md:text-5xl font-light leading-relaxed">
              {currentText}
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isPlaying && !isLoading && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 max-w-2xl w-full px-8 text-center">
          <h1 className="text-white text-6xl font-light mb-4">Vision Quest</h1>
          <p className="text-white/80 text-xl font-light mb-8">
            En magisk resa genom dina drömmar och visioner
          </p>
          <p className="text-white/60 text-sm font-light">
            Tryck på &quot;Starta Vision&quot; för att påbörja din psychedeliska resa
          </p>
        </div>
      )}
    </div>
  );
}
