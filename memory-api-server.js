const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3002;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Memory search endpoint
app.get('/api/memory-search', async (req, res) => {
  const { q, type, limit = 10, smart = false } = req.query;
  const apiKey = req.headers['x-api-key'];

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let query = supabase.from('smart_memories').select('*');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query
      .eq('is_archived', false)
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Parse and filter results
    let results = data.map(item => {
      let parsedData = {};
      try {
        parsedData = typeof item.data === 'string' ? JSON.parse(item.data || '{}') : item.data || {};
      } catch (e) {
        parsedData = { error: 'parse_error', raw: item.data };
      }

      return {
        id: item.id,
        type: item.type,
        importance: item.importance,
        created_at: item.created_at,
        ...parsedData
      };
    });

    // Filter by search query
    if (q) {
      const searchTerm = q.toLowerCase();
      results = results.filter(item => {
        const searchText = `
          ${item.title || ''}
          ${item.content || ''}
          ${item.subject || ''}
          ${item.summary || ''}
        `.toLowerCase();

        return searchText.includes(searchTerm);
      });
    }

    res.json({
      success: true,
      results,
      count: results.length,
      query: q
    });
  } catch (error) {
    console.error('Memory search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Memory store endpoint
app.post('/api/memory-store', async (req, res) => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { content, title, type = 'memory', importance = 3 } = req.body;

    const memoryData = {
      title: title || content.substring(0, 50),
      content,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('smart_memories')
      .insert([{
        type,
        data: JSON.stringify(memoryData),
        importance,
        metadata: JSON.stringify({ source: 'voice-assistant' }),
        is_archived: false
      }])
      .select();

    if (error) throw error;

    res.json({
      success: true,
      memory: {
        id: data[0].id,
        ...memoryData
      },
      message: `Memory saved: ${memoryData.title}`
    });
  } catch (error) {
    console.error('Memory store error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Memory API is healthy!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n🧠 Memory API Server running on http://localhost:${PORT}`);
  console.log('📚 Endpoints:');
  console.log(`  - GET  http://localhost:${PORT}/api/memory-search`);
  console.log(`  - POST http://localhost:${PORT}/api/memory-store`);
  console.log(`  - GET  http://localhost:${PORT}/api/health\n`);
});