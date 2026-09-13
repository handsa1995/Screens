export type UserRole = 'super_admin' | 'content_manager' | 'screen_operator' | 'viewer';

export interface UserPermission {
  canManageScreens: boolean;
  canEditContent: boolean;
  canPublishSchedules: boolean;
  canManageUsers: boolean;
  canTriggerEmergency: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
  lastActive: string;
}

export type AssetType = 'image' | 'video' | 'ticker' | 'web';

export interface MediaAsset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  thumbnailUrl: string;
  durationSeconds: number; // For video: length, for image: default duration
  sizeBytes: number;
  width?: number;
  height?: number;
  tags: string[];
  createdAt: string;
}

export interface PlaylistItem {
  id: string;
  assetId: string;
  asset?: MediaAsset;
  durationSeconds: number;
  transition: 'fade' | 'slide' | 'zoom' | 'none';
  volume: number; // 0 to 100
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  items: PlaylistItem[];
  tickerText?: string;
  showClock: boolean;
  showWeather: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleEvent {
  id: string;
  name: string;
  playlistId: string;
  targetType: 'all' | 'tag' | 'screen';
  targetValue: string; // screenId or tag name or 'all'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  priority: number; // Higher overrides lower
  isActive: boolean;
}

export interface ScreenDevice {
  id: string;
  name: string;
  pairingCode?: string;
  isPaired: boolean;
  status: 'online' | 'offline' | 'standby';
  ipAddress: string;
  resolution: string;
  orientation: 'landscape' | 'portrait';
  location: string;
  groupTag: string;
  currentPlaylistId?: string;
  currentPlayingItem?: string;
  lastHeartbeat: string;
  volume: number;
  emergencyAlert?: {
    active: boolean;
    title: string;
    message: string;
    severity: 'warning' | 'danger' | 'info';
    timestamp: string;
  } | null;
  appVersion: string;
  storageUsageMb: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  target?: string;
}

export interface SystemStats {
  totalScreens: number;
  onlineScreens: number;
  activePlaylists: number;
  totalAssets: number;
  storageUsedMb: number;
  activeAlarms: number;
}
