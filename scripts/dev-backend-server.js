const http = require('http');
const os = require('os');

const PORT = process.env.EXPO_PUBLIC_API_PORT || 5000;
const HOST = '0.0.0.0';

/**
 * Utility to discover the laptop's LAN IP address.
 */
function getLocalLanIp() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (!iface) continue;
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal && alias.address !== '127.0.0.1') {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
}

const server = http.createServer((req, res) => {
  // Enable CORS for Expo Go & multi-device development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url || '/';

  // API Health Check
  if (url === '/api/health' || url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'OnePlace Development Backend',
      host: HOST,
      lanIp: getLocalLanIp(),
      port: PORT,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // API Config Info
  if (url === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      appName: 'OnePlace',
      lanApiUrl: `http://${getLocalLanIp()}:${PORT}`,
      activeDevices: 'Multi-device LAN mode active',
    }));
    return;
  }

  // Generic 404 for unknown endpoints
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, HOST, () => {
  const lanIp = getLocalLanIp();
  console.log('==================================================');
  console.log('  ONEPLACE MULTI-DEVICE DEVELOPMENT BACKEND       ');
  console.log('==================================================');
  console.log(`  Listening on Host: ${HOST} (All Interfaces)`);
  console.log(`  Local Access:      http://localhost:${PORT}`);
  console.log(`  LAN Access:        http://${lanIp}:${PORT}`);
  console.log('--------------------------------------------------');
  console.log('  PHYSICAL PHONES CONFIGURATION:');
  console.log(`  Set environment variable in your terminal / .env:`);
  console.log(`  EXPO_PUBLIC_API_URL=http://${lanIp}:${PORT}`);
  console.log('--------------------------------------------------');
  console.log('  Press Ctrl+C to stop backend server');
  console.log('==================================================\n');
});
