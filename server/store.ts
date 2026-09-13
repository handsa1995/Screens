import {
  MediaAsset,
  Playlist,
  ScheduleEvent,
  ScreenDevice,
  UserAccount,
  UserPermission,
  UserRole,
  AuditLogEntry,
  SystemStats
} from '../src/types';

// Default Role Permissions
export const ROLE_PERMISSIONS: Record<UserRole, UserPermission> = {
  super_admin: {
    canManageScreens: true,
    canEditContent: true,
    canPublishSchedules: true,
    canManageUsers: true,
    canTriggerEmergency: true,
  },
  content_manager: {
    canManageScreens: false,
    canEditContent: true,
    canPublishSchedules: true,
    canManageUsers: false,
    canTriggerEmergency: false,
  },
  screen_operator: {
    canManageScreens: true,
    canEditContent: false,
    canPublishSchedules: false,
    canManageUsers: false,
    canTriggerEmergency: true,
  },
  viewer: {
    canManageScreens: false,
    canEditContent: false,
    canPublishSchedules: false,
    canManageUsers: false,
    canTriggerEmergency: false,
  },
};

// Seed Assets
const initialAssets: MediaAsset[] = [
  {
    id: 'asset-1',
    name: 'Corporate Brand Welcome & Innovation',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
    durationSeconds: 10,
    sizeBytes: 2450000,
    width: 1920,
    height: 1080,
    tags: ['Lobby', 'Corporate', 'Branding'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'asset-2',
    name: 'Dynamic Cyber Waves Video Loop',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    durationSeconds: 15,
    sizeBytes: 15400000,
    width: 1920,
    height: 1080,
    tags: ['Video', 'Ambient', 'High-Tech'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'asset-3',
    name: 'Cafeteria Artisan Menu & Daily Roast',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
    durationSeconds: 12,
    sizeBytes: 3100000,
    width: 1920,
    height: 1080,
    tags: ['Cafeteria', 'Menu', 'Food'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'asset-4',
    name: 'Tech Conference 2026 Keynote Schedule',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80',
    durationSeconds: 10,
    sizeBytes: 2800000,
    width: 1920,
    height: 1080,
    tags: ['Events', 'Conference', 'Hall'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'asset-5',
    name: 'Nature Serenity UltraHD Loop',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    durationSeconds: 15,
    sizeBytes: 16800000,
    width: 1920,
    height: 1080,
    tags: ['Relaxation', 'Video', 'Nature'],
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

// Seed Playlists
const initialPlaylists: Playlist[] = [
  {
    id: 'playlist-1',
    name: 'Corporate HQ Welcome Loop',
    description: 'Primary visual sequence for headquarters main entrance & visitor reception area.',
    items: [
      { id: 'item-1', assetId: 'asset-1', durationSeconds: 10, transition: 'fade', volume: 0 },
      { id: 'item-2', assetId: 'asset-2', durationSeconds: 15, transition: 'fade', volume: 40 },
      { id: 'item-3', assetId: 'asset-4', durationSeconds: 8, transition: 'slide', volume: 0 },
    ],
    tickerText: 'Welcome to Global Innovation Center • Security badges required in all tech labs • Wi-Fi Guest: GIC-GUEST-5G',
    showClock: true,
    showWeather: true,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'playlist-2',
    name: 'Cafeteria & Lounge Specials',
    description: 'Weekly menu rotations, daily chef specials, and wellness announcements for staff dining.',
    items: [
      { id: 'item-4', assetId: 'asset-3', durationSeconds: 12, transition: 'fade', volume: 0 },
      { id: 'item-5', assetId: 'asset-5', durationSeconds: 15, transition: 'zoom', volume: 30 },
    ],
    tickerText: 'Today: Fresh Mediterranean Salmon Bowl & Cold Brew Nitro on tap • Happy Hour 4:30 - 6:00 PM',
    showClock: true,
    showWeather: false,
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'playlist-3',
    name: 'Executive Boardroom Ambient Showcase',
    description: 'High resolution ambient video showcase with live news headlines ticker.',
    items: [
      { id: 'item-6', assetId: 'asset-5', durationSeconds: 15, transition: 'fade', volume: 0 },
      { id: 'item-7', assetId: 'asset-1', durationSeconds: 10, transition: 'fade', volume: 0 },
    ],
    tickerText: 'Board of Directors Session • Q3 Enterprise Milestones Briefing 14:00 EST',
    showClock: true,
    showWeather: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

// Seed Schedules
const initialSchedules: ScheduleEvent[] = [
  {
    id: 'sched-1',
    name: 'Morning Entrance Rush',
    playlistId: 'playlist-1',
    targetType: 'tag',
    targetValue: 'Lobby',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    startTime: '07:30',
    endTime: '12:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    priority: 10,
    isActive: true,
  },
  {
    id: 'sched-2',
    name: 'Lunchtime Dining Broadcast',
    playlistId: 'playlist-2',
    targetType: 'tag',
    targetValue: 'Cafeteria',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    startTime: '11:30',
    endTime: '14:30',
    daysOfWeek: [1, 2, 3, 4, 5],
    priority: 20,
    isActive: true,
  },
  {
    id: 'sched-3',
    name: 'Executive Evening Showcase',
    playlistId: 'playlist-3',
    targetType: 'screen',
    targetValue: 'screen-3',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    startTime: '16:00',
    endTime: '21:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    priority: 15,
    isActive: true,
  },
];

// Seed Screens (Connected PCs / Displays across local network)
const initialScreens: ScreenDevice[] = [
  {
    id: 'screen-1',
    name: 'Main Lobby Video Wall',
    pairingCode: 'LOB-701',
    isPaired: true,
    status: 'online',
    ipAddress: '192.168.1.104',
    resolution: '3840x2160 (4K)',
    orientation: 'landscape',
    location: 'Building A - Ground Floor Atrium',
    groupTag: 'Lobby',
    currentPlaylistId: 'playlist-1',
    currentPlayingItem: 'Corporate Brand Welcome & Innovation',
    lastHeartbeat: new Date().toISOString(),
    volume: 50,
    emergencyAlert: null,
    appVersion: 'v2.4.1-signboard',
    storageUsageMb: 840,
  },
  {
    id: 'screen-2',
    name: '2nd Floor Cafeteria South TV',
    pairingCode: 'CAF-204',
    isPaired: true,
    status: 'online',
    ipAddress: '192.168.1.112',
    resolution: '1920x1080 (FHD)',
    orientation: 'landscape',
    location: 'Building B - Dining Hall South',
    groupTag: 'Cafeteria',
    currentPlaylistId: 'playlist-2',
    currentPlayingItem: 'Cafeteria Artisan Menu & Daily Roast',
    lastHeartbeat: new Date().toISOString(),
    volume: 25,
    emergencyAlert: null,
    appVersion: 'v2.4.1-signboard',
    storageUsageMb: 520,
  },
  {
    id: 'screen-3',
    name: 'Executive Boardroom Display',
    pairingCode: 'BRD-909',
    isPaired: true,
    status: 'online',
    ipAddress: '192.168.1.145',
    resolution: '3840x2160 (4K)',
    orientation: 'landscape',
    location: 'Executive Wing - 5th Floor',
    groupTag: 'Executive',
    currentPlaylistId: 'playlist-3',
    currentPlayingItem: 'Nature Serenity UltraHD Loop',
    lastHeartbeat: new Date().toISOString(),
    volume: 0,
    emergencyAlert: null,
    appVersion: 'v2.4.1-signboard',
    storageUsageMb: 920,
  },
  {
    id: 'screen-4',
    name: 'West Wing Elevator Kiosk',
    pairingCode: 'ELV-412',
    isPaired: true,
    status: 'standby',
    ipAddress: '192.168.1.189',
    resolution: '1080x1920 (Portrait)',
    orientation: 'portrait',
    location: 'Building A - Elevator Bank 2',
    groupTag: 'Lobby',
    currentPlaylistId: 'playlist-1',
    currentPlayingItem: 'Corporate Brand Welcome & Innovation',
    lastHeartbeat: new Date(Date.now() - 3600000).toISOString(),
    volume: 0,
    emergencyAlert: null,
    appVersion: 'v2.4.1-signboard',
    storageUsageMb: 410,
  },
  {
    id: 'screen-5',
    name: 'New Smart Display (Unpaired)',
    pairingCode: 'SGN-842',
    isPaired: false,
    status: 'online',
    ipAddress: '192.168.1.205',
    resolution: '1920x1080 (FHD)',
    orientation: 'landscape',
    location: 'Unassigned Display',
    groupTag: 'Unassigned',
    lastHeartbeat: new Date().toISOString(),
    volume: 75,
    emergencyAlert: null,
    appVersion: 'v2.4.1-signboard',
    storageUsageMb: 120,
  },
];

// Seed RBAC Users
const initialUsers: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Alex Vance (You)',
    email: 'admin@signboard-network.local',
    role: 'super_admin',
    department: 'Enterprise IT & Infrastructure',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'user-2',
    name: 'Elena Rostova',
    email: 'elena.rostova@signboard-network.local',
    role: 'content_manager',
    department: 'Marketing & Corporate Communications',
    lastActive: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'user-3',
    name: 'Marcus Chen',
    email: 'marcus.chen@signboard-network.local',
    role: 'screen_operator',
    department: 'Facilities & Hardware Operations',
    lastActive: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'user-4',
    name: 'Sarah Jenkins',
    email: 'sarah.j@signboard-network.local',
    role: 'viewer',
    department: 'Executive Governance & Auditing',
    lastActive: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

// Initial Audit Logs
const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit-1',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    userName: 'Alex Vance',
    userRole: 'super_admin',
    action: 'SCREEN_PAIR',
    details: 'Paired new screen "2nd Floor Cafeteria South TV" with pairing token CAF-204',
    target: 'screen-2',
  },
  {
    id: 'audit-2',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    userName: 'Elena Rostova',
    userRole: 'content_manager',
    action: 'PLAYLIST_UPDATE',
    details: 'Published update to playlist "Corporate HQ Welcome Loop" (3 assets assigned)',
    target: 'playlist-1',
  },
  {
    id: 'audit-3',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    userName: 'Marcus Chen',
    userRole: 'screen_operator',
    action: 'DEVICE_REBOOT',
    details: 'Dispatched remote refresh command to "Main Lobby Video Wall"',
    target: 'screen-1',
  },
];

export class SignboardStore {
  private assets: MediaAsset[] = [...initialAssets];
  private playlists: Playlist[] = [...initialPlaylists];
  private schedules: ScheduleEvent[] = [...initialSchedules];
  private screens: ScreenDevice[] = [...initialScreens];
  private users: UserAccount[] = [...initialUsers];
  private auditLogs: AuditLogEntry[] = [...initialAuditLogs];

  // Assets
  getAssets(): MediaAsset[] {
    return this.assets;
  }

  addAsset(asset: Omit<MediaAsset, 'id' | 'createdAt'>): MediaAsset {
    const newAsset: MediaAsset = {
      ...asset,
      id: 'asset-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.assets.unshift(newAsset);
    this.logAction('System Admin', 'super_admin', 'ASSET_UPLOAD', `Uploaded new media asset: ${newAsset.name}`, newAsset.id);
    return newAsset;
  }

  deleteAsset(id: string): boolean {
    const idx = this.assets.findIndex(a => a.id === id);
    if (idx !== -1) {
      const removed = this.assets.splice(idx, 1)[0];
      this.logAction('System Admin', 'super_admin', 'ASSET_DELETE', `Deleted media asset: ${removed.name}`, id);
      return true;
    }
    return false;
  }

  // Playlists
  getPlaylists(): Playlist[] {
    // Populate items with asset references
    return this.playlists.map(pl => ({
      ...pl,
      items: pl.items.map(item => ({
        ...item,
        asset: this.assets.find(a => a.id === item.assetId),
      })),
    }));
  }

  getPlaylistById(id: string): Playlist | undefined {
    const pl = this.playlists.find(p => p.id === id);
    if (!pl) return undefined;
    return {
      ...pl,
      items: pl.items.map(item => ({
        ...item,
        asset: this.assets.find(a => a.id === item.assetId),
      })),
    };
  }

  createPlaylist(data: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Playlist {
    const newPl: Playlist = {
      ...data,
      id: 'playlist-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.playlists.unshift(newPl);
    this.logAction('Content Manager', 'content_manager', 'PLAYLIST_CREATE', `Created playlist: ${newPl.name}`, newPl.id);
    return newPl;
  }

  updatePlaylist(id: string, updates: Partial<Playlist>): Playlist | undefined {
    const pl = this.playlists.find(p => p.id === id);
    if (!pl) return undefined;
    Object.assign(pl, updates, { updatedAt: new Date().toISOString() });
    this.logAction('Content Manager', 'content_manager', 'PLAYLIST_UPDATE', `Modified playlist settings: ${pl.name}`, pl.id);
    return this.getPlaylistById(id);
  }

  deletePlaylist(id: string): boolean {
    const idx = this.playlists.findIndex(p => p.id === id);
    if (idx !== -1) {
      const removed = this.playlists.splice(idx, 1)[0];
      this.logAction('Content Manager', 'content_manager', 'PLAYLIST_DELETE', `Removed playlist: ${removed.name}`, id);
      return true;
    }
    return false;
  }

  // Schedules
  getSchedules(): ScheduleEvent[] {
    return this.schedules;
  }

  createSchedule(schedule: Omit<ScheduleEvent, 'id'>): ScheduleEvent {
    const newSched: ScheduleEvent = {
      ...schedule,
      id: 'sched-' + Math.random().toString(36).substring(2, 9),
    };
    this.schedules.push(newSched);
    this.logAction('Schedule Planner', 'content_manager', 'SCHEDULE_CREATE', `Configured schedule event: ${newSched.name}`, newSched.id);
    return newSched;
  }

  updateSchedule(id: string, updates: Partial<ScheduleEvent>): ScheduleEvent | undefined {
    const item = this.schedules.find(s => s.id === id);
    if (!item) return undefined;
    Object.assign(item, updates);
    this.logAction('Schedule Planner', 'content_manager', 'SCHEDULE_UPDATE', `Updated schedule event: ${item.name}`, item.id);
    return item;
  }

  deleteSchedule(id: string): boolean {
    const idx = this.schedules.findIndex(s => s.id === id);
    if (idx !== -1) {
      const removed = this.schedules.splice(idx, 1)[0];
      this.logAction('Schedule Planner', 'content_manager', 'SCHEDULE_DELETE', `Deleted schedule: ${removed.name}`, id);
      return true;
    }
    return false;
  }

  // Screens
  getScreens(): ScreenDevice[] {
    return this.screens;
  }

  getScreenById(id: string): ScreenDevice | undefined {
    return this.screens.find(s => s.id === id);
  }

  getScreenByPairingCode(code: string): ScreenDevice | undefined {
    const cleaned = code.trim().toUpperCase();
    return this.screens.find(s => s.pairingCode?.toUpperCase() === cleaned);
  }

  registerOrUpdateDevice(deviceData: Partial<ScreenDevice> & { pairingCode?: string }): ScreenDevice {
    let screen: ScreenDevice | undefined;

    if (deviceData.id) {
      screen = this.screens.find(s => s.id === deviceData.id);
    }
    if (!screen && deviceData.pairingCode) {
      screen = this.screens.find(s => s.pairingCode === deviceData.pairingCode);
    }

    if (screen) {
      Object.assign(screen, deviceData, {
        lastHeartbeat: new Date().toISOString(),
        status: 'online',
      });
      return screen;
    }

    // New unassigned screen requesting enrollment
    const newCode = deviceData.pairingCode || this.generatePairingCode();
    const newScreen: ScreenDevice = {
      id: 'screen-' + Math.random().toString(36).substring(2, 9),
      name: deviceData.name || `Signboard Client (${newCode})`,
      pairingCode: newCode,
      isPaired: false,
      status: 'online',
      ipAddress: deviceData.ipAddress || '192.168.1.' + Math.floor(Math.random() * 200 + 50),
      resolution: deviceData.resolution || '1920x1080 (FHD)',
      orientation: deviceData.orientation || 'landscape',
      location: deviceData.location || 'Pending Enrollment',
      groupTag: deviceData.groupTag || 'Unassigned',
      currentPlaylistId: undefined,
      lastHeartbeat: new Date().toISOString(),
      volume: 50,
      emergencyAlert: null,
      appVersion: 'v2.4.1-signboard',
      storageUsageMb: 150,
    };
    this.screens.push(newScreen);
    this.logAction('System Gateway', 'screen_operator', 'DEVICE_DISCOVERED', `Device connected with pairing code: ${newCode}`, newScreen.id);
    return newScreen;
  }

  pairScreen(code: string, payload: { name: string; location: string; groupTag: string; playlistId?: string; orientation?: 'landscape' | 'portrait' }): ScreenDevice | null {
    const screen = this.getScreenByPairingCode(code);
    if (!screen) return null;

    screen.name = payload.name;
    screen.location = payload.location;
    screen.groupTag = payload.groupTag || 'General';
    screen.isPaired = true;
    screen.status = 'online';
    if (payload.playlistId) {
      screen.currentPlaylistId = payload.playlistId;
    } else if (!screen.currentPlaylistId && this.playlists.length > 0) {
      screen.currentPlaylistId = this.playlists[0].id;
    }
    if (payload.orientation) {
      screen.orientation = payload.orientation;
    }
    screen.lastHeartbeat = new Date().toISOString();

    this.logAction('Screen Operator', 'screen_operator', 'SCREEN_PAIRED', `Paired device "${screen.name}" (${code}) at ${screen.location}`, screen.id);
    return screen;
  }

  updateScreen(id: string, updates: Partial<ScreenDevice>): ScreenDevice | undefined {
    const screen = this.screens.find(s => s.id === id);
    if (!screen) return undefined;
    Object.assign(screen, updates);
    this.logAction('Screen Operator', 'screen_operator', 'SCREEN_UPDATE', `Updated settings for "${screen.name}"`, screen.id);
    return screen;
  }

  deleteScreen(id: string): boolean {
    const idx = this.screens.findIndex(s => s.id === id);
    if (idx !== -1) {
      const removed = this.screens.splice(idx, 1)[0];
      this.logAction('Screen Operator', 'screen_operator', 'SCREEN_UNENROLL', `Removed screen "${removed.name}" from network`, id);
      return true;
    }
    return false;
  }

  setEmergencyAlert(screenIds: string[] | 'all', alert: { title: string; message: string; severity: 'warning' | 'danger' | 'info' } | null): void {
    const targets = screenIds === 'all' ? this.screens : this.screens.filter(s => screenIds.includes(s.id));
    for (const screen of targets) {
      if (alert) {
        screen.emergencyAlert = {
          active: true,
          ...alert,
          timestamp: new Date().toISOString(),
        };
      } else {
        screen.emergencyAlert = null;
      }
    }
    const actionText = alert ? `DISPATCH EMERGENCY BROADCAST [${alert.severity.toUpperCase()}]: ${alert.title}` : 'CLEARED EMERGENCY BROADCAST';
    this.logAction('Safety Officer', 'super_admin', 'EMERGENCY_BROADCAST', actionText);
  }

  // Users & RBAC
  getUsers(): UserAccount[] {
    return this.users;
  }

  createUser(user: Omit<UserAccount, 'id' | 'lastActive'>): UserAccount {
    const newUser: UserAccount = {
      ...user,
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      lastActive: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.logAction('Super Admin', 'super_admin', 'USER_CREATE', `Created operator account for ${newUser.name} with role ${newUser.role}`, newUser.id);
    return newUser;
  }

  updateUserRole(userId: string, role: UserRole): UserAccount | undefined {
    const u = this.users.find(usr => usr.id === userId);
    if (!u) return undefined;
    const oldRole = u.role;
    u.role = role;
    this.logAction('Super Admin', 'super_admin', 'ROLE_CHANGE', `Changed role for ${u.name} from ${oldRole} to ${role}`, u.id);
    return u;
  }

  deleteUser(userId: string): boolean {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const removed = this.users.splice(idx, 1)[0];
      this.logAction('Super Admin', 'super_admin', 'USER_DELETE', `Deleted user account: ${removed.name}`, userId);
      return true;
    }
    return false;
  }

  // Audit Logs
  getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  logAction(userName: string, userRole: UserRole, action: string, details: string, target?: string): void {
    const entry: AuditLogEntry = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      userName,
      userRole,
      action,
      details,
      target,
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  // Aggregate Stats
  getStats(): SystemStats {
    const online = this.screens.filter(s => s.status === 'online').length;
    const storage = this.screens.reduce((acc, s) => acc + (s.storageUsageMb || 0), 0) + 1200;
    const alarms = this.screens.filter(s => s.emergencyAlert?.active).length;
    return {
      totalScreens: this.screens.length,
      onlineScreens: online,
      activePlaylists: this.playlists.length,
      totalAssets: this.assets.length,
      storageUsedMb: storage,
      activeAlarms: alarms,
    };
  }

  generatePairingCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 3; i++) {
      p1 += chars.charAt(Math.floor(Math.random() * chars.length));
      p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${p1}-${p2}`;
  }
}

export const store = new SignboardStore();
