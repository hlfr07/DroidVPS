import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import * as systemMonitor from './system-monitor.js';
import * as terminalHandler from './terminal-handler.js';
import ssh from 'ssh2-promise';

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
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline'");
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const server = createServer(app);
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
