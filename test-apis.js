// Test all API keys locally
require('dotenv').config({ path: '.env.local' });

console.log('Testing API Keys Configuration:\n');

// Check which keys exist
const keys = {
  'GROQ_API_KEY': process.env.GROQ_API_KEY,
  'OPENROUTER_API_KEY': process.env.OPENROUTER_API_KEY,
  'ELEVENLABS_API_KEY': process.env.ELEVENLABS_API_KEY,
  'ELEVENLABS_VOICE_ID': process.env.ELEVENLABS_VOICE_ID,
  'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL,
  'NEXT_PUBLIC_API_KEY': process.env.NEXT_PUBLIC_API_KEY
};

for (const [name, value] of Object.entries(keys)) {
  if (value) {
    console.log(`✅ ${name}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${name}: MISSING`);
  }
}

// Test Groq API
async function testGroq() {
  if (!process.env.GROQ_API_KEY) {
    console.log('\n❌ Cannot test Groq - API key missing');
    return;
  }
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('\n✅ Groq API key is valid');
      const data = await response.json();
      const whisperModels = data.data.filter(m => m.id.includes('whisper'));
      console.log(`   Found ${whisperModels.length} Whisper models available`);
    } else {
      console.log('\n❌ Groq API key is invalid:', response.status);
    }
  } catch (error) {
    console.log('\n❌ Groq API test failed:', error.message);
  }
}

// Test ElevenLabs API
async function testElevenLabs() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.log('\n❌ Cannot test ElevenLabs - API key missing');
    return;
  }
  
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });
    
    if (response.ok) {
      console.log('\n✅ ElevenLabs API key is valid');
      const data = await response.json();
      console.log(`   Found ${data.voices.length} voices available`);
    } else {
      console.log('\n❌ ElevenLabs API key is invalid:', response.status);
    }
  } catch (error) {
    console.log('\n❌ ElevenLabs API test failed:', error.message);
  }
}

// Run tests
(async () => {
  await testGroq();
  await testElevenLabs();
  
  console.log('\n📝 Instructions for Render:');
  console.log('1. Go to Render Dashboard → Environment');
  console.log('2. Add all missing keys shown above');
  console.log('3. Click "Save Changes"');
  console.log('4. Go to Manual Deploy → Clear build cache & deploy');
})();