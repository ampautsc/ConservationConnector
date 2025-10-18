#!/usr/bin/env node

/**
 * Diagnostic Script for API Connection Issues
 * 
 * This script tests connectivity to the government APIs to diagnose
 * why all requests are failing with ECONNRESET.
 */

const https = require('https');
const http = require('http');

console.log('API Connection Diagnostic Tool');
console.log('================================\n');

// Test URLs
const testUrls = [
  {
    name: 'USFS (HTTPS)',
    url: 'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0/query?where=1=1&returnGeometry=false&f=json&outFields=OBJECTID'
  },
  {
    name: 'USFS Root',
    url: 'https://apps.fs.usda.gov/'
  }
];

async function testConnection(testCase) {
  console.log(`\nTesting: ${testCase.name}`);
  console.log(`URL: ${testCase.url}`);
  
  return new Promise((resolve) => {
    const urlObj = new URL(testCase.url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*'
      },
      // Try with less strict SSL
      rejectUnauthorized: true,
      // Force TLS 1.2 or higher
      minVersion: 'TLSv1.2'
    };
    
    console.log(`  Connecting to ${options.hostname}:${options.port}...`);
    
    const req = https.request(options, (res) => {
      console.log(`  ✓ Connection established`);
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Headers:`, Object.keys(res.headers).join(', '));
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`  Response length: ${data.length} bytes`);
        if (res.statusCode === 200) {
          console.log(`  ✓ SUCCESS`);
        }
        resolve({ success: true, status: res.statusCode });
      });
    });
    
    req.on('error', (err) => {
      console.log(`  ✗ ERROR: ${err.code} - ${err.message}`);
      resolve({ success: false, error: err });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`  ✗ TIMEOUT`);
      resolve({ success: false, error: 'timeout' });
    });
    
    req.setTimeout(15000);
    req.end();
  });
}

(async () => {
  console.log('Node.js Version:', process.version);
  console.log('TLS Versions Available:', require('tls').getCiphers().slice(0, 5).join(', '), '...\n');
  
  for (const test of testUrls) {
    await testConnection(test);
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n================================');
  console.log('Diagnostic Complete');
  console.log('================================\n');
})();
