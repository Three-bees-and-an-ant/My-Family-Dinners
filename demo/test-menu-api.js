#!/usr/bin/env node

/**
 * Quick test script to check if menu API is working
 * Run: node test-menu-api.js
 */

const http = require('http');

console.log('🔍 Testing Menu API...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/menu',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`📡 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📦 Response Body:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success && Array.isArray(json.data)) {
        console.log(`\n✅ SUCCESS! Found ${json.data.length} menu items`);
        if (json.data.length > 0) {
          console.log(`\n📝 First item:`, json.data[0].name);
        }
      } else if (Array.isArray(json)) {
        console.log(`\n✅ SUCCESS! Found ${json.length} menu items (direct array)`);
      } else {
        console.log(`\n⚠️  WARNING: Unexpected response format`);
      }
    } catch (e) {
      console.log('❌ Error parsing JSON:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERROR:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Make sure backend is running: cd backend && npm run dev');
  console.log('2. Check if port 3000 is in use: lsof -i :3000');
  console.log('3. Check backend logs for errors');
});

req.end();
