import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ScreensView } from './components/ScreensView';
import { PairingModal } from './components/PairingModal';
import { AssetManagerView } from './components/AssetManagerView';
import { PlaylistsView } from './components/PlaylistsView';
import { SchedulerView } from './components/SchedulerView';
import { SimulatorView } from './components/SimulatorView';
import { RbacView } from './components/RbacView';
import { PlayerView } from './components/PlayerView';
import { EmergencyModal } from './components/EmergencyModal';
import { api } from './lib/api';
import { ROLE_PERMISSIONS } from '../server/store';
import {
  AuditLogEntry,
  MediaAsset,
  Playlist,
  ScheduleEvent,
  ScreenDevice,
  SystemStats,
  UserAccount,
  UserRole
} from './types';

export default function App() {
  // Navigation & View Mode
  const [currentTab, setCurrentTab] = useState<string>('screens');
  const [activePlayerScreenId, setActivePlayerScreenId] = useState<string | null>(null);

  // Core App Data
  const [screens, setScreens] = useState<ScreenDevice[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  // Modals
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // User RBAC State
  const [currentUser, setCurrentUser] = useState<UserAccount>({
    id: 'user-1',
    name: 'Alex Vance (You)',
    email: 'admin@signboard-network.local',
    role: 'super_admin',
    department: 'Enterprise IT & Infrastructure',
    lastActive: new Date().toISOString(),
  });

  // WebSocket Connection State
  const [isWsConnected, setIsWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Load initial data
  const loadAllData = async () => {
    try {
      const [
        screensData,
        playlistsData,
        assetsData,
        schedulesData,
        usersData,
        auditData,
        statsData,
      ] = await Promise.all([
        api.getScreens(),
        api.getPlaylists(),
        api.getAssets(),
        api.getSchedules(),
        api.getUsers(),
        api.getAuditLogs(),
        api.getStats(),
      ]);

      setScreens(screensData);
      setPlaylists(playlistsData);
      setAssets(assetsData);
      setSchedules(schedulesData);
      setUsers(usersData);
      setAuditLogs(auditData);
      setStats(statsData);

      // Match current user
      const existingMe = usersData.find(u => u.id === currentUser.id);
      if (existingMe) setCurrentUser(existingMe);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Real-time WebSocket connection to /ws
  useEffect(() => {
    let reconnectTimer: any = null;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsWsConnected(true);
        ws.send(JSON.stringify({ type: 'register_dashboard' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'init_state') {
            if (msg.screens) setScreens(msg.screens);
            if (msg.playlists) setPlaylists(msg.playlists);
            if (msg.schedules) setSchedules(msg.schedules);
            if (msg.stats) setStats(msg.stats);
          } else if (msg.type === 'screen_status' || msg.type === 'screen_paired') {
            setScreens(prev => {
              const idx = prev.findIndex(s => s.id === msg.screen.id);
              if (idx !== -1) {
                const next = [...prev];
                next[idx] = msg.screen;
                return next;
              }
              return [...prev, msg.screen];
            });
            if (msg.stats) setStats(msg.stats);
            // Refresh audit logs
            api.getAuditLogs().then(setAuditLogs).catch(() => {});
          } else if (msg.type === 'screen_heartbeat') {
            setScreens(prev =>
              prev.map(s => (s.id === msg.screen.id ? msg.screen : s))
            );
          } else if (msg.type === 'screen_deleted') {
            setScreens(prev => prev.filter(s => s.id !== msg.screenId));
            if (msg.stats) setStats(msg.stats);
          } else if (msg.type === 'emergency_updated') {
            if (msg.screens) setScreens(msg.screens);
            if (msg.stats) setStats(msg.stats);
            api.getAuditLogs().then(setAuditLogs).catch(() => {});
          } else if (msg.type === 'playlist_created' || msg.type === 'playlist_updated') {
            api.getPlaylists().then(setPlaylists).catch(() => {});
            api.getScreens().then(setScreens).catch(() => {});
          } else if (msg.type === 'playlist_deleted') {
            api.getPlaylists().then(setPlaylists).catch(() => {});
          } else if (msg.type === 'asset_added' || msg.type === 'asset_deleted') {
            api.getAssets().then(setAssets).catch(() => {});
            if (msg.stats) setStats(msg.stats);
          } else if (msg.type === 'schedule_created' || msg.type === 'schedule_updated' || msg.type === 'schedule_deleted') {
            api.getSchedules().then(setSchedules).catch(() => {});
          } else if (msg.type === 'user_created' || msg.type === 'user_updated' || msg.type === 'user_deleted') {
            api.getUsers().then(setUsers).catch(() => {});
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setIsWsConnected(false);
        reconnectTimer = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        setIsWsConnected(false);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Compute permissions for active user
  const permissions = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.viewer;

  // Handlers for Screens
  const handleRefreshScreen = async (screenId: string) => {
    await api.sendScreenCommand(screenId, 'reload');
    await loadAllData();
  };

  const handleUpdateScreen = async (screenId: string, updates: Partial<ScreenDevice>) => {
    const updated = await api.updateScreen(screenId, updates);
    setScreens(prev => prev.map(s => (s.id === screenId ? updated : s)));
  };

  const handleDeleteScreen = async (screenId: string) => {
    await api.deleteScreen(screenId);
    setScreens(prev => prev.filter(s => s.id !== screenId));
    loadAllData();
  };

  // Handlers for Pairing
  const handlePairScreen = async (data: {
    code: string;
    name: string;
    location: string;
    groupTag: string;
    playlistId?: string;
    orientation?: 'landscape' | 'portrait';
  }) => {
    const res = await api.claimPairingCode(data);
    if (res.success) {
      await loadAllData();
    }
  };

  // Handlers for Assets
  const handleAddAsset = async (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => {
    const created = await api.createAsset(asset);
    setAssets(prev => [created, ...prev]);
    loadAllData();
  };

  const handleDeleteAsset = async (id: string) => {
    await api.deleteAsset(id);
    setAssets(prev => prev.filter(a => a.id !== id));
    loadAllData();
  };

  // Handlers for Playlists
  const handleCreatePlaylist = async (data: Partial<Playlist>) => {
    const created = await api.createPlaylist(data);
    setPlaylists(prev => [created, ...prev]);
    loadAllData();
  };

  const handleUpdatePlaylist = async (id: string, data: Partial<Playlist>) => {
    const updated = await api.updatePlaylist(id, data);
    setPlaylists(prev => prev.map(p => (p.id === id ? updated : p)));
    loadAllData();
  };

  const handleDeletePlaylist = async (id: string) => {
    await api.deletePlaylist(id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
    loadAllData();
  };

  // Handlers for Schedules
  const handleCreateSchedule = async (data: Partial<ScheduleEvent>) => {
    const created = await api.createSchedule(data);
    setSchedules(prev => [...prev, created]);
    loadAllData();
  };

  const handleUpdateSchedule = async (id: string, data: Partial<ScheduleEvent>) => {
    const updated = await api.updateSchedule(id, data);
    setSchedules(prev => prev.map(s => (s.id === id ? updated : s)));
  };

  const handleDeleteSchedule = async (id: string) => {
    await api.deleteSchedule(id);
    setSchedules(prev => prev.filter(s => s.id !== id));
    loadAllData();
  };

  // Handlers for Emergency Broadcast
  const handleDispatchEmergency = async (payload: {
    screenIds?: string[] | 'all';
    active: boolean;
    title?: string;
    message?: string;
    severity?: 'warning' | 'danger' | 'info';
  }) => {
    await api.triggerEmergency(payload);
    await loadAllData();
  };

  // Handlers for Users & Roles
  const handleUpdateUserRole = async (userId: string, role: UserRole) => {
    const updated = await api.updateUserRole(userId, role);
    setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
    if (currentUser.id === userId) {
      setCurrentUser(updated);
    }
    loadAllData();
  };

  const handleCreateUser = async (data: Partial<UserAccount>) => {
    const created = await api.createUser(data);
    setUsers(prev => [...prev, created]);
    loadAllData();
  };

  const handleDeleteUser = async (userId: string) => {
    await api.deleteUser(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    loadAllData();
  };

  // If Player view is requested (dedicated full-screen signboard display client)
  if (activePlayerScreenId) {
    return (
      <PlayerView
        initialScreenId={activePlayerScreenId}
        onExit={() => setActivePlayerScreenId(null)}
        allScreens={screens}
        allPlaylists={playlists}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Central Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        stats={stats}
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        allUsers={users}
        onOpenPairing={() => setIsPairingModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenPlayer={(screenId) => setActivePlayerScreenId(screenId || screens[0]?.id || '')}
        isConnected={isWsConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'screens' && (
          <ScreensView
            screens={screens}
            playlists={playlists}
            onRefreshScreen={handleRefreshScreen}
            onUpdateScreen={handleUpdateScreen}
            onDeleteScreen={handleDeleteScreen}
            onOpenPlayer={(screenId) => setActivePlayerScreenId(screenId)}
            onOpenPairing={() => setIsPairingModalOpen(true)}
            permissions={permissions}
          />
        )}

        {currentTab === 'pairing' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Display Pairing & Device Enrollment Station</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Enroll any PC or smart screen on your network by entering its pairing code below, or launch a new player window.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setIsPairingModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition"
                >
                  Open Pairing Enrollment Wizard
                </button>
              </div>
            </div>

            <ScreensView
              screens={screens.filter(s => !s.isPaired)}
              playlists={playlists}
              onRefreshScreen={handleRefreshScreen}
              onUpdateScreen={handleUpdateScreen}
              onDeleteScreen={handleDeleteScreen}
              onOpenPlayer={(screenId) => setActivePlayerScreenId(screenId)}
              onOpenPairing={() => setIsPairingModalOpen(true)}
              permissions={permissions}
            />
          </div>
        )}

        {currentTab === 'assets' && (
          <AssetManagerView
            assets={assets}
            onAddAsset={handleAddAsset}
            onDeleteAsset={handleDeleteAsset}
            permissions={permissions}
          />
        )}

        {currentTab === 'playlists' && (
          <PlaylistsView
            playlists={playlists}
            assets={assets}
            onCreatePlaylist={handleCreatePlaylist}
            onUpdatePlaylist={handleUpdatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            permissions={permissions}
          />
        )}

        {currentTab === 'schedules' && (
          <SchedulerView
            schedules={schedules}
            playlists={playlists}
            screens={screens}
            onCreateSchedule={handleCreateSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            permissions={permissions}
          />
        )}

        {currentTab === 'simulator' && (
          <SimulatorView
            screens={screens}
            playlists={playlists}
            onOpenPlayer={(screenId) => setActivePlayerScreenId(screenId)}
            onRefreshScreen={handleRefreshScreen}
            onUpdateScreen={handleUpdateScreen}
            onOpenPairing={() => setIsPairingModalOpen(true)}
            permissions={permissions}
          />
        )}

        {currentTab === 'rbac' && (
          <RbacView
            users={users}
            auditLogs={auditLogs}
            currentUser={currentUser}
            onUpdateUserRole={handleUpdateUserRole}
            onCreateUser={handleCreateUser}
            onDeleteUser={handleDeleteUser}
            permissions={permissions}
          />
        )}
      </main>

      {/* Screen Pairing Modal */}
      <PairingModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        onPairSuccess={handlePairScreen}
        playlists={playlists}
        screens={screens}
        onOpenPlayer={(screenId) => {
          setIsPairingModalOpen(false);
          setActivePlayerScreenId(screenId || screens[0]?.id || '');
        }}
      />

      {/* Emergency Broadcast Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        screens={screens}
        onDispatchEmergency={handleDispatchEmergency}
      />
    </div>
  );
}
