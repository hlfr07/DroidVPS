import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import * as systemMonitor from './system-monitor.js';
import * as terminalHandler from './terminal-handler.js';
import ssh from 'ssh2-promise';
import httpProxy from 'http-proxy';
import { createProotDistro } from './system-monitor.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS más específicamente para evitar bloqueos
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Headers de seguridad y privacidad para evitar que extensiones lo bloqueen
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.path.startsWith('/ttyd')) {
    res.removeHeader('X-Frame-Options');
  } else {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (req.path.startsWith('/ttyd')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' data: blob: ws: wss: http: https:"
    );
  } else {
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline'");
  }
  next();
});

app.use(express.json());

// Credenciales del sistema (configurables por entorno). Esto permite usar
// las mismas credenciales que usas por SSH en userland sin exponer IP en el login.

let authenticatedUsers = new Map();

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  //Aca haremos la validacion contra las credenciales haciendo una conexion SSH a localhost
  //usando las credenciales provistas. Si la conexion es exitosa, consideramos al usuario
  //autenticado.

  const sshConfig = {
    host: 'localhost',
    port: 8022,
    username,
    password,
    readyTimeout: 5000
  };

  const sshClient = new ssh(sshConfig);

  try {
    await sshClient.connect();
    await sshClient.close();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Generar un token simple (no JWT) para la sesión

  const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
  authenticatedUsers.set(token, { username, timestamp: Date.now() });

  setTimeout(() => {
    authenticatedUsers.delete(token);
  }, 24 * 60 * 60 * 1000);

  res.json({
    token,
    username,
    message: 'Login successful'
  });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    authenticatedUsers.delete(token);
  }
  res.json({ message: 'Logout successful' });
});

function authenticateRequest(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token || !authenticatedUsers.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = authenticatedUsers.get(token);
  next();
}

app.get('/api/system/all', authenticateRequest, async (req, res) => {
  try {
    const data = await systemMonitor.getAllSystemData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/system/cpu', authenticateRequest, async (req, res) => {
  try {
    const cpu = await systemMonitor.getCPUUsage();
    res.json({ cpu });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/system/memory', authenticateRequest, async (req, res) => {
  try {
    const memory = await systemMonitor.getMemoryUsage();
    res.json(memory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/system/processes', authenticateRequest, async (req, res) => {
  try {
    const processes = await systemMonitor.getProcessList();
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Nota: en userland/proot no tenemos netlink para listar puertos; devolvemos vacío.
app.get('/api/system/ports', authenticateRequest, async (req, res) => {
  res.json([]);
});

app.get('/api/system/device', authenticateRequest, async (req, res) => {
  try {
    const deviceInfo = await systemMonitor.getDeviceInfo();
    res.json(deviceInfo);
  } catch (error) {
    console.error('API Error /api/system/device:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.get('/api/system/battery', authenticateRequest, async (req, res) => {
  try {
    const batteryInfo = await systemMonitor.getBatteryInfo();
    res.json(batteryInfo);
  } catch (error) {
    console.error('API Error /api/system/battery:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.get('/api/system/temperatures', authenticateRequest, async (req, res) => {
  try {
    const temperatureInfo = await systemMonitor.getTemperatureInfo();
    res.json(temperatureInfo);
  } catch (error) {
    console.error('API Error /api/system/temperatures:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.post('/api/proot/create', authenticateRequest, async (req, res) => {
  const { name, port } = req.body;

  try {
    const result = await createProotDistro(name, port);
    res.json(result);
  } catch (error) {
    console.error('Error creating proot distro:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/proot/delete/:name', authenticateRequest, async (req, res) => {
  const distroName = req.params.name;
  try {
    const result = await systemMonitor.deleteProotDistro(distroName);
    res.json(result);
  } catch (error) {
    console.error('Error deleting proot distro:', error);
    res.status(500).json({ error: error.message });
  }
});

//Ahora haremos un get para tarer los proots creados
app.get('/api/proot/list', authenticateRequest, async (req, res) => {
  try {
    const distros = await systemMonitor.listProotDistros();
    res.json(distros);
  } catch (error) {
    console.error('Error listing proot distros:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/terminal/url', authenticateRequest, (req, res) => {
  const token = Buffer
    .from(`${req.user.username}:${Date.now()}`)
    .toString('base64');

  // token corto (5 minutos)
  authenticatedUsers.set(token, {
    username: req.user.username,
    ttyd: true
  });

  setTimeout(() => {
    authenticatedUsers.delete(token);
  }, 5 * 60 * 1000);

  const baseUrl = `${req.protocol}://${req.headers.host}`;

  res.json({
    url: `${baseUrl}/ttyd?token=${token}`
  });

});


const ttydProxy = httpProxy.createProxyServer({
  target: 'http://127.0.0.1:7681',
  ws: true
});

ttydProxy.on('error', (err, req, res) => {
  console.error('[ttydProxy error]', err.message);

  if (res && !res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad gateway');
  }
});


app.use('/ttyd', (req, res) => {
  const token = req.query.token;

  if (!token || !authenticatedUsers.has(token)) {
    return res.status(401).send('Unauthorized');
  }

  const data = authenticatedUsers.get(token);
  if (!data.ttyd) {
    return res.status(403).send('Forbidden');
  }

  // 🔥 REWRITE PATH PARA ttyd
  req.url = req.url.replace(/^\/ttyd/, '');

  ttydProxy.web(req, res);
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});


const server = createServer(app);
server.on('upgrade', (req, socket, head) => {
  if (!req.url.startsWith('/ttyd')) return;

  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');

  if (!token || !authenticatedUsers.has(token)) {
    socket.destroy();
    return;
  }

  // 🔥 REESCRIBIR PATH PARA ttyd
  req.url = req.url.replace('/ttyd', '');

  ttydProxy.ws(req, socket, head);
});

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const urlParams = new URL(req.url, `http://${req.headers.host}`);
  const token = urlParams.searchParams.get('token');

  if (!token || !authenticatedUsers.has(token)) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  console.log('WebSocket client connected');

  let terminalId = null;
  let systemDataInterval = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'terminal:create') {
        terminalId = `term_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const term = terminalHandler.createTerminal(terminalId, data.cols || 80, data.rows || 24);

        term.onData((termData) => {
          ws.send(JSON.stringify({
            type: 'terminal:data',
            data: termData
          }));
        });

        term.onExit(() => {
          ws.send(JSON.stringify({
            type: 'terminal:exit'
          }));
        });

        ws.send(JSON.stringify({
          type: 'terminal:ready',
          id: terminalId
        }));
      }

      else if (data.type === 'terminal:input' && terminalId) {
        terminalHandler.writeToTerminal(terminalId, data.data);
      }

      else if (data.type === 'terminal:resize' && terminalId) {
        terminalHandler.resizeTerminal(terminalId, data.cols, data.rows);
      }

      else if (data.type === 'system:subscribe') {
        if (systemDataInterval) {
          clearInterval(systemDataInterval);
        }

        const sendSystemData = async () => {
          try {
            const systemData = await systemMonitor.getAllSystemData();
            ws.send(JSON.stringify({
              type: 'system:data',
              data: systemData
            }));
          } catch (error) {
            console.error('Error getting system data:', error);
          }
        };

        sendSystemData();
        systemDataInterval = setInterval(sendSystemData, 2000);
      }

      else if (data.type === 'system:unsubscribe') {
        if (systemDataInterval) {
          clearInterval(systemDataInterval);
          systemDataInterval = null;
        }
      }

    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');

    if (terminalId) {
      terminalHandler.killTerminal(terminalId);
    }

    if (systemDataInterval) {
      clearInterval(systemDataInterval);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`UserLAnd Dashboard Server running on http://0.0.0.0:${PORT}`);
  console.log(`WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
  console.log(`\nAccess the dashboard from your browser at http://[your-device-ip]:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up...');
  terminalHandler.cleanupTerminals();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, cleaning up...');
  terminalHandler.cleanupTerminals();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
