import {
  MediaAsset,
  Playlist,
  ScheduleEvent,
  ScreenDevice,
  SystemStats,
  UserAccount,
  AuditLogEntry,
  UserRole
} from '../types';

export const API_BASE = '/api';

// Fetch helper with error handling
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Stats
  getStats: () => fetchJson<SystemStats>(`${API_BASE}/stats`),

  // Screens
  getScreens: () => fetchJson<ScreenDevice[]>(`${API_BASE}/screens`),
  getScreen: (id: string) => fetchJson<ScreenDevice>(`${API_BASE}/screens/${id}`),
  createScreen: (data: Partial<ScreenDevice>) => fetchJson<ScreenDevice>(`${API_BASE}/screens`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateScreen: (id: string, updates: Partial<ScreenDevice>) => fetchJson<ScreenDevice>(`${API_BASE}/screens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  deleteScreen: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/screens/${id}`, {
    method: 'DELETE',
  }),
  sendScreenCommand: (id: string, command: string, payload?: any) => fetchJson<{ success: boolean; delivered: boolean }>(`${API_BASE}/screens/${id}/command`, {
    method: 'POST',
    body: JSON.stringify({ command, payload }),
  }),

  // Pairing
  generatePairingCode: () => fetchJson<{ pairingCode: string; screenId: string }>(`${API_BASE}/pairing/generate`, {
    method: 'POST',
  }),
  claimPairingCode: (data: {
    code: string;
    name: string;
    location: string;
    groupTag: string;
    playlistId?: string;
    orientation?: 'landscape' | 'portrait';
  }) => fetchJson<{ success: boolean; screen: ScreenDevice }>(`${API_BASE}/pairing/claim`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Assets
  getAssets: () => fetchJson<MediaAsset[]>(`${API_BASE}/assets`),
  createAsset: (data: Partial<MediaAsset>) => fetchJson<MediaAsset>(`${API_BASE}/assets`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteAsset: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/assets/${id}`, {
    method: 'DELETE',
  }),

  // Playlists
  getPlaylists: () => fetchJson<Playlist[]>(`${API_BASE}/playlists`),
  getPlaylist: (id: string) => fetchJson<Playlist>(`${API_BASE}/playlists/${id}`),
  createPlaylist: (data: Partial<Playlist>) => fetchJson<Playlist>(`${API_BASE}/playlists`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePlaylist: (id: string, updates: Partial<Playlist>) => fetchJson<Playlist>(`${API_BASE}/playlists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  deletePlaylist: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/playlists/${id}`, {
    method: 'DELETE',
  }),

  // Schedules
  getSchedules: () => fetchJson<ScheduleEvent[]>(`${API_BASE}/schedules`),
  createSchedule: (data: Partial<ScheduleEvent>) => fetchJson<ScheduleEvent>(`${API_BASE}/schedules`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSchedule: (id: string, updates: Partial<ScheduleEvent>) => fetchJson<ScheduleEvent>(`${API_BASE}/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  deleteSchedule: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/schedules/${id}`, {
    method: 'DELETE',
  }),

  // Emergency Broadcast
  triggerEmergency: (payload: {
    screenIds?: string[] | 'all';
    active: boolean;
    title?: string;
    message?: string;
    severity?: 'warning' | 'danger' | 'info';
  }) => fetchJson<{ success: boolean; targetsCount: number }>(`${API_BASE}/emergency`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Users & RBAC
  getUsers: () => fetchJson<UserAccount[]>(`${API_BASE}/users`),
  createUser: (data: Partial<UserAccount>) => fetchJson<UserAccount>(`${API_BASE}/users`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUserRole: (id: string, role: UserRole) => fetchJson<UserAccount>(`${API_BASE}/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  deleteUser: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
  }),

  // Audit Logs
  getAuditLogs: () => fetchJson<AuditLogEntry[]>(`${API_BASE}/audit`),
};
