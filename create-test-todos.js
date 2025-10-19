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
    title: 'Lunch med Karin',
    content: 'Träffa Karin för lunch på Sjöbaren kl 12:00',
    importance: 3,
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours from now
  },
  {
    title: 'Code review för Liseberg projektet',
    content: 'Gå igenom Philip\'s kod för animation projektion',
    importance: 5,
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours from now
  },
  {
    title: 'Discgolf med Henrik',
    content: 'Slottsskogen kl 17:00',
    importance: 2,
    deadline: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString() // 9 hours from now
  },
  {
    title: 'Yoga stretch',
    content: '15 min yoga innan sänggåendet',
    importance: 3
  },
  {
    title: 'Sonja till skolan',
    content: 'Packa matsäck och lämna kl 07:30',
    importance: 4,
    deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // Tomorrow morning
  },
  {
    title: 'Client meeting',
    content: 'Rune @ Liseberg kl 10:30',
    importance: 4,
    deadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Kvällsmat familjen',
    content: 'Laga middag kl 19:00',
    importance: 3,
    deadline: new Date(Date.now() + 11 * 60 * 60 * 1000).toISOString()
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
      console.log(`Creating: "${todo.title}"...`);
      const result = await createTodo(todo);
      console.log(`✅ Created todo with ID: ${result.todo.id}`);
      console.log(`   Summary: ${result.todo.summary || '(null)'}`);
      console.log(`   Full content: ${result.todo.full_content || '(null)'}\n`);
    } catch (error) {
      console.error(`❌ Failed to create "${todo.title}":`, error.message, '\n');
    }
  }

  console.log('✨ Done! Check your FLOW dashboard now!');
}

main();
