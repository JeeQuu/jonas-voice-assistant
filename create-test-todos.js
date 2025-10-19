#!/usr/bin/env node

/**
 * Create test todos for FLOW dashboard
 * Run: node create-test-todos.js
 */

const https = require('https');

const API_URL = 'https://quant-show-api.onrender.com';
const API_KEY = 'JeeQuuFjong';

const testTodos = [
  {
    summary: 'Ring Gun om fredagsmiddag',
    full_content: 'Ring Gun och bekräfta fredagsmiddag kl 18:00',
    importance_level: 4,
    tags: ['familj'],
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
  },
  {
    summary: 'Lunch med Karin',
    full_content: 'Träffa Karin för lunch på Sjöbaren kl 12:00',
    importance_level: 3,
    tags: ['familj'],
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours from now
  },
  {
    summary: 'Code review för Liseberg projektet',
    full_content: 'Gå igenom Philip\'s kod för animation projektion',
    importance_level: 5,
    tags: ['jobb'],
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours from now
  },
  {
    summary: 'Discgolf med Henrik',
    full_content: 'Slottsskogen kl 17:00',
    importance_level: 2,
    tags: ['hälsa'],
    deadline: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString() // 9 hours from now
  },
  {
    summary: 'Yoga stretch',
    full_content: '15 min yoga innan sänggåendet',
    importance_level: 3,
    tags: ['hälsa']
  },
  {
    summary: 'Sonja till skolan',
    full_content: 'Packa matsäck och lämna kl 07:30',
    importance_level: 4,
    tags: ['familj'],
    deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // Tomorrow morning
  }
];

function createTodo(todo) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(todo);

    const options = {
      hostname: 'quant-show-api.onrender.com',
      path: '/api/todos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(responseData);
          resolve(result);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Creating test todos for FLOW dashboard...\n');

  for (const todo of testTodos) {
    try {
      console.log(`Creating: "${todo.summary}"...`);
      const result = await createTodo(todo);
      console.log(`✅ Created todo with ID: ${result.todo.id}`);
      console.log(`   Summary: ${result.todo.summary || '(null)'}`);
      console.log(`   Full content: ${result.todo.full_content || '(null)'}\n`);
    } catch (error) {
      console.error(`❌ Failed to create "${todo.summary}":`, error.message, '\n');
    }
  }

  console.log('✨ Done! Check your FLOW dashboard now!');
}

main();
