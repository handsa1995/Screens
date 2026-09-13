import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { store } from './server/store';

const PORT = 3000;
const app = express();
const server = http.createServer(app);

// Enable JSON parser with generous payload size for uploads/data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ----------------------------------------------------
// Real-time WebSocket Server
// ----------------------------------------------------
const wss = new WebSocketServer({ server, path: '/ws' });

// Track client sockets: screenId -> WebSocket or role -> WebSocket[]
interface ClientSession {
  ws: WebSocket;
  type: 'screen' | 'dashboard';
  screenId?: string;
  pairingCode?: string;
}

const sessions = new Map<WebSocket, ClientSession>();

function broadcastToDashboards(data: any) {
  const payload = JSON.stringify(data);
  for (const [ws, session] of sessions.entries()) {
    if (session.type === 'dashboard' && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function sendToScreen(screenId: string, message: any): boolean {
  let sent = false;
  for (const [ws, session] of sessions.entries()) {
    if (session.type === 'screen' && session.screenId === screenId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      sent = true;
    }
  }
  return sent;
}

function sendToScreenByPairingCode(code: string, message: any): boolean {
  let sent = false;
  const targetCode = code.toUpperCase().trim();
  for (const [ws, session] of sessions.entries()) {
    if (session.type === 'screen' && session.pairingCode?.toUpperCase() === targetCode && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      sent = true;
    }
  }
  return sent;
}

wss.on('connection', (ws: WebSocket) => {
  // Default session
  sessions.set(ws, { ws, type: 'dashboard' });

  ws.on('message', (raw: string) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'register_dashboard') {
        sessions.set(ws, { ws, type: 'dashboard' });
        ws.send(JSON.stringify({
          type: 'init_state',
          screens: store.getScreens(),
          playlists: store.getPlaylists(),
          schedules: store.getSchedules(),
          stats: store.getStats(),
        }));
      }

      else if (msg.type === 'register_screen') {
        const { screenId, pairingCode, clientInfo } = msg;
        const device = store.registerOrUpdateDevice({
          id: screenId,
          pairingCode,
          ipAddress: clientInfo?.ipAddress,
          resolution: clientInfo?.resolution,
          orientation: clientInfo?.orientation,
          name: clientInfo?.name,
        });

        sessions.set(ws, {
          ws,
          type: 'screen',
          screenId: device.id,
          pairingCode: device.pairingCode,
        });

        // Send screen its registration confirmation & config
        let activePlaylist = null;
        if (device.currentPlaylistId) {
          activePlaylist = store.getPlaylistById(device.currentPlaylistId);
        }

        ws.send(JSON.stringify({
          type: 'registered',
          device,
          playlist: activePlaylist,
        }));

        // Inform dashboards
        broadcastToDashboards({
          type: 'screen_status',
          screen: device,
          stats: store.getStats(),
        });
      }

      else if (msg.type === 'screen_heartbeat') {
        const { screenId, currentPlayingItem, volume, storageUsageMb } = msg;
        if (screenId) {
          const updated = store.updateScreen(screenId, {
            status: 'online',
            currentPlayingItem,
            volume,
            storageUsageMb,
            lastHeartbeat: new Date().toISOString(),
          });
          if (updated) {
            broadcastToDashboards({
              type: 'screen_heartbeat',
              screen: updated,
            });
          }
        }
      }
    } catch (e) {
      console.error('Error handling WS message:', e);
    }
  });

  ws.on('close', () => {
    const session = sessions.get(ws);
    if (session && session.type === 'screen' && session.screenId) {
      const screen = store.getScreenById(session.screenId);
      if (screen) {
        screen.status = 'offline';
        broadcastToDashboards({
          type: 'screen_status',
          screen,
          stats: store.getStats(),
        });
      }
    }
    sessions.delete(ws);
  });
});

// ----------------------------------------------------
// REST API Endpoints
// ----------------------------------------------------

// System Health & Stats
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/stats', (req, res) => {
  res.json(store.getStats());
});

// Screens CRUD & Remote Commands
app.get('/api/screens', (req, res) => {
  res.json(store.getScreens());
});

app.get('/api/screens/:id', (req, res) => {
  const screen = store.getScreenById(req.params.id);
  if (!screen) return res.status(404).json({ error: 'Screen not found' });
  res.json(screen);
});

app.post('/api/screens', (req, res) => {
  const screen = store.registerOrUpdateDevice(req.body);
  broadcastToDashboards({ type: 'screen_status', screen, stats: store.getStats() });
  res.status(201).json(screen);
});

app.put('/api/screens/:id', (req, res) => {
  const screen = store.updateScreen(req.params.id, req.body);
  if (!screen) return res.status(404).json({ error: 'Screen not found' });

  // If playlist changed, push immediately to connected screen
  if (req.body.currentPlaylistId) {
    const playlist = store.getPlaylistById(req.body.currentPlaylistId);
    sendToScreen(screen.id, {
      type: 'set_playlist',
      playlist,
    });
  }

  broadcastToDashboards({ type: 'screen_status', screen, stats: store.getStats() });
  res.json(screen);
});

app.delete('/api/screens/:id', (req, res) => {
  const ok = store.deleteScreen(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Screen not found' });
  broadcastToDashboards({ type: 'screen_deleted', screenId: req.params.id, stats: store.getStats() });
  res.json({ success: true });
});

// Send remote command to a screen
app.post('/api/screens/:id/command', (req, res) => {
  const screen = store.getScreenById(req.params.id);
  if (!screen) return res.status(404).json({ error: 'Screen not found' });

  const { command, payload } = req.body;
  let sent = false;

  if (command === 'reload' || command === 'reboot') {
    sent = sendToScreen(screen.id, { type: 'reload' });
    store.logAction('Screen Operator', 'screen_operator', 'REMOTE_COMMAND', `Sent ${command} command to "${screen.name}"`, screen.id);
  } else if (command === 'set_volume') {
    screen.volume = payload?.volume ?? 50;
    sent = sendToScreen(screen.id, { type: 'set_volume', volume: screen.volume });
  } else if (command === 'set_playlist') {
    screen.currentPlaylistId = payload?.playlistId;
    const pl = store.getPlaylistById(payload?.playlistId);
    sent = sendToScreen(screen.id, { type: 'set_playlist', playlist: pl });
  } else if (command === 'clear_cache') {
    sent = sendToScreen(screen.id, { type: 'clear_cache' });
  }

  broadcastToDashboards({ type: 'screen_status', screen, stats: store.getStats() });
  res.json({ success: true, delivered: sent });
});

// Pairing Endpoints
app.post('/api/pairing/generate', (req, res) => {
  const code = store.generatePairingCode();
  const screen = store.registerOrUpdateDevice({
    pairingCode: code,
    name: `Signboard (${code})`,
  });
  res.json({ pairingCode: code, screenId: screen.id });
});

app.post('/api/pairing/claim', (req, res) => {
  const { code, name, location, groupTag, playlistId, orientation } = req.body;
  if (!code) return res.status(400).json({ error: 'Pairing code is required' });

  const screen = store.pairScreen(code, {
    name: name || 'Signboard Display',
    location: location || 'General Area',
    groupTag: groupTag || 'General',
    playlistId,
    orientation,
  });

  if (!screen) {
    return res.status(404).json({ error: 'Pairing code not found or expired. Make sure the screen displays this code.' });
  }

  // Notify the paired screen immediately via WebSocket
  const playlist = screen.currentPlaylistId ? store.getPlaylistById(screen.currentPlaylistId) : null;
  sendToScreenByPairingCode(code, {
    type: 'paired_success',
    screen,
    playlist,
  });

  broadcastToDashboards({
    type: 'screen_paired',
    screen,
    stats: store.getStats(),
  });

  res.json({ success: true, screen });
});

// Assets Management
app.get('/api/assets', (req, res) => {
  res.json(store.getAssets());
});

app.post('/api/assets', (req, res) => {
  const { name, type, url, thumbnailUrl, durationSeconds, sizeBytes, width, height, tags } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }
  const asset = store.addAsset({
    name,
    type: type || 'image',
    url,
    thumbnailUrl: thumbnailUrl || url,
    durationSeconds: Number(durationSeconds) || 10,
    sizeBytes: Number(sizeBytes) || 1024000,
    width: Number(width) || 1920,
    height: Number(height) || 1080,
    tags: Array.isArray(tags) ? tags : ['General'],
  });

  broadcastToDashboards({ type: 'asset_added', asset, stats: store.getStats() });
  res.status(201).json(asset);
});

app.delete('/api/assets/:id', (req, res) => {
  const ok = store.deleteAsset(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Asset not found' });
  broadcastToDashboards({ type: 'asset_deleted', assetId: req.params.id, stats: store.getStats() });
  res.json({ success: true });
});

// Playlists
app.get('/api/playlists', (req, res) => {
  res.json(store.getPlaylists());
});

app.get('/api/playlists/:id', (req, res) => {
  const pl = store.getPlaylistById(req.params.id);
  if (!pl) return res.status(404).json({ error: 'Playlist not found' });
  res.json(pl);
});

app.post('/api/playlists', (req, res) => {
  const pl = store.createPlaylist(req.body);
  broadcastToDashboards({ type: 'playlist_created', playlist: pl, stats: store.getStats() });
  res.status(201).json(pl);
});

app.put('/api/playlists/:id', (req, res) => {
  const pl = store.updatePlaylist(req.params.id, req.body);
  if (!pl) return res.status(404).json({ error: 'Playlist not found' });

  // Update all screens currently running this playlist
  const screens = store.getScreens();
  for (const scr of screens) {
    if (scr.currentPlaylistId === pl.id) {
      sendToScreen(scr.id, { type: 'set_playlist', playlist: pl });
    }
  }

  broadcastToDashboards({ type: 'playlist_updated', playlist: pl });
  res.json(pl);
});

app.delete('/api/playlists/:id', (req, res) => {
  const ok = store.deletePlaylist(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Playlist not found' });
  broadcastToDashboards({ type: 'playlist_deleted', playlistId: req.params.id, stats: store.getStats() });
  res.json({ success: true });
});

// Schedules
app.get('/api/schedules', (req, res) => {
  res.json(store.getSchedules());
});

app.post('/api/schedules', (req, res) => {
  const sched = store.createSchedule(req.body);
  broadcastToDashboards({ type: 'schedule_created', schedule: sched });
  res.status(201).json(sched);
});

app.put('/api/schedules/:id', (req, res) => {
  const sched = store.updateSchedule(req.params.id, req.body);
  if (!sched) return res.status(404).json({ error: 'Schedule not found' });
  broadcastToDashboards({ type: 'schedule_updated', schedule: sched });
  res.json(sched);
});

app.delete('/api/schedules/:id', (req, res) => {
  const ok = store.deleteSchedule(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Schedule not found' });
  broadcastToDashboards({ type: 'schedule_deleted', scheduleId: req.params.id });
  res.json({ success: true });
});

// Emergency Alert Broadcast
app.post('/api/emergency', (req, res) => {
  const { screenIds, active, title, message, severity } = req.body;
  const alertData = active ? {
    title: title || 'PRIORITY EMERGENCY BROADCAST',
    message: message || 'Please follow security procedures immediately.',
    severity: severity || 'danger',
  } : null;

  store.setEmergencyAlert(screenIds || 'all', alertData);

  // Broadcast to all screens or target screens
  const screens = store.getScreens();
  const targetScreens = (!screenIds || screenIds === 'all')
    ? screens
    : screens.filter(s => screenIds.includes(s.id));

  for (const scr of targetScreens) {
    sendToScreen(scr.id, {
      type: 'emergency_alert',
      alert: alertData,
    });
  }

  broadcastToDashboards({
    type: 'emergency_updated',
    screens: store.getScreens(),
    stats: store.getStats(),
  });

  res.json({ success: true, targetsCount: targetScreens.length });
});

// Users & RBAC
app.get('/api/users', (req, res) => {
  res.json(store.getUsers());
});

app.post('/api/users', (req, res) => {
  const user = store.createUser(req.body);
  broadcastToDashboards({ type: 'user_created', user });
  res.status(201).json(user);
});

app.put('/api/users/:id/role', (req, res) => {
  const user = store.updateUserRole(req.params.id, req.body.role);
  if (!user) return res.status(404).json({ error: 'User not found' });
  broadcastToDashboards({ type: 'user_updated', user });
  res.json(user);
});

app.delete('/api/users/:id', (req, res) => {
  const ok = store.deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: 'User not found' });
  broadcastToDashboards({ type: 'user_deleted', userId: req.params.id });
  res.json({ success: true });
});

// Audit Activity Logs
app.get('/api/audit', (req, res) => {
  res.json(store.getAuditLogs());
});

// ----------------------------------------------------
// Vite Middleware & Static Serving
// ----------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Signboard Server] Listening on http://0.0.0.0:${PORT} and ws://0.0.0.0:${PORT}/ws`);
  });
}

bootstrap().catch(err => {
  console.error('[Signboard Server] Failed to start:', err);
  process.exit(1);
});
