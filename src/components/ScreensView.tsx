import React, { useState } from 'react';
import {
  Monitor,
  Wifi,
  WifiOff,
  RotateCw,
  Play,
  Volume2,
  VolumeX,
  Settings,
  Trash2,
  ExternalLink,
  Layers,
  HardDrive,
  Clock,
  Tag,
  AlertCircle,
  Tv,
  CheckCircle2,
  Sliders,
  Maximize2
} from 'lucide-react';
import { Playlist, ScreenDevice, UserPermission } from '../types';

interface ScreensViewProps {
  screens: ScreenDevice[];
  playlists: Playlist[];
  onRefreshScreen: (screenId: string) => void;
  onUpdateScreen: (screenId: string, updates: Partial<ScreenDevice>) => void;
  onDeleteScreen: (screenId: string) => void;
  onOpenPlayer: (screenId: string) => void;
  onOpenPairing: () => void;
  permissions: UserPermission;
}

export const ScreensView: React.FC<ScreensViewProps> = ({
  screens,
  playlists,
  onRefreshScreen,
  onUpdateScreen,
  onDeleteScreen,
  onOpenPlayer,
  onOpenPairing,
  permissions,
}) => {
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingScreen, setEditingScreen] = useState<ScreenDevice | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const tags = Array.from(new Set(screens.map(s => s.groupTag).filter(Boolean)));

  const filteredScreens = screens.filter(s => {
    const matchTag = filterTag === 'all' || s.groupTag === filterTag;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ipAddress.includes(searchQuery) ||
      (s.pairingCode && s.pairingCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTag && matchStatus && matchSearch;
  });

  const handleCommand = (screenId: string, cmd: string, payload?: any) => {
    onRefreshScreen(screenId);
    setActionSuccessMsg(`Sent remote command (${cmd}) to screen`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handlePlaylistChange = (screenId: string, playlistId: string) => {
    onUpdateScreen(screenId, { currentPlaylistId: playlistId });
    setActionSuccessMsg(`Assigned playlist to screen`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleVolumeChange = (screenId: string, volume: number) => {
    onUpdateScreen(screenId, { volume });
  };

  return (
    <div className="space-y-6">
      {/* Action Notification Banner */}
      {actionSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-indigo-400" />
              <span>Connected Displays & Telemetry</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live heartbeat monitoring, remote playback assignment, and hardware diagnostics across your local network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by name, IP, room..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-zinc-500 w-48 sm:w-64"
            />

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="online">Online Only</option>
              <option value="standby">Standby</option>
              <option value="offline">Offline</option>
            </select>

            {/* Tag Filter */}
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Groups</option>
              {tags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Pair Screen Button */}
            {permissions.canManageScreens && (
              <button
                onClick={onOpenPairing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
              >
                + Pair Screen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Screens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScreens.map(screen => {
          const isOnline = screen.status === 'online';
          const isStandby = screen.status === 'standby';
          const assignedPlaylist = playlists.find(p => p.id === screen.currentPlaylistId);

          return (
            <div
              key={screen.id}
              className={`bg-zinc-900 border rounded-2xl p-5 flex flex-col justify-between transition hover:border-zinc-700 shadow-md ${
                screen.emergencyAlert?.active
                  ? 'border-rose-500/60 bg-rose-950/20'
                  : !screen.isPaired
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-zinc-800'
              }`}
            >
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : isStandby ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                      />
                      <h3 className="font-semibold text-sm text-white tracking-tight">{screen.name}</h3>
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center space-x-2">
                      <span>{screen.location}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded text-[10px] font-mono">
                        {screen.groupTag}
                      </span>
                    </div>
                  </div>

                  {/* Orientation & Code */}
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
                      {screen.orientation}
                    </span>
                    {screen.pairingCode && (
                      <div className="text-[10px] font-mono text-indigo-400 mt-1">
                        Code: {screen.pairingCode}
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Alert Indicator */}
                {screen.emergencyAlert?.active && (
                  <div className="mt-3 bg-rose-950/60 border border-rose-500/50 text-rose-300 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 animate-pulse" />
                    <div>
                      <div className="font-bold uppercase text-[10px] tracking-wide text-rose-200">
                        {screen.emergencyAlert.title}
                      </div>
                      <div className="text-[11px] line-clamp-1">{screen.emergencyAlert.message}</div>
                    </div>
                  </div>
                )}

                {/* Live Preview Display Box */}
                <div className="mt-4 relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center group">
                  {screen.isPaired && assignedPlaylist ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
                      {/* Background image preview if available */}
                      {assignedPlaylist.items[0]?.asset?.thumbnailUrl ? (
                        <img
                          src={assignedPlaylist.items[0]?.asset?.thumbnailUrl}
                          alt="preview"
                          className="w-full h-full object-cover opacity-60"
                        />
                      ) : (
                        <div className="text-zinc-600 flex flex-col items-center">
                          <Play className="h-8 w-8 text-zinc-500 mb-1 opacity-50" />
                          <span className="text-[11px]">Active Content Loop</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded flex items-center space-x-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>PLAYING</span>
                          </span>
                          <span className="text-[10px] text-zinc-300 bg-black/60 px-1.5 py-0.5 rounded font-mono">
                            {screen.resolution}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-white truncate drop-shadow">
                            {screen.currentPlayingItem || assignedPlaylist.name}
                          </div>
                          <div className="text-[10px] text-zinc-300 drop-shadow truncate">
                            Playlist: {assignedPlaylist.name} ({assignedPlaylist.items.length} slides)
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-amber-500/10 text-amber-400 mb-2">
                        <Tv className="h-5 w-5" />
                      </div>
                      <div className="text-xs font-semibold text-amber-300">Unenrolled Display</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Pairing code: <span className="font-mono text-white font-bold">{screen.pairingCode}</span></div>
                    </div>
                  )}

                  {/* Hover Overlay Button to Open Player */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onOpenPlayer(screen.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-lg transition"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Open Live View</span>
                    </button>
                  </div>
                </div>

                {/* Diagnostics Meta */}
                <div className="mt-4 space-y-2 border-t border-zinc-800/80 pt-3 text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center space-x-1.5">
                      <Wifi className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Network IP:</span>
                    </span>
                    <span className="font-mono text-zinc-200">{screen.ipAddress}</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center space-x-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Local Cache:</span>
                    </span>
                    <span className="text-zinc-300 font-mono">
                      {screen.storageUsageMb} MB / 2 GB
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Heartbeat:</span>
                    </span>
                    <span className="text-zinc-300">
                      {new Date(screen.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center space-x-1.5 text-zinc-400">
                      {screen.volume > 0 ? (
                        <Volume2 className="h-3.5 w-3.5 text-zinc-400" />
                      ) : (
                        <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
                      )}
                      <span>Audio:</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={screen.volume}
                        onChange={e => handleVolumeChange(screen.id, Number(e.target.value))}
                        disabled={!permissions.canManageScreens}
                        className="w-20 accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                      <span className="font-mono text-[10px] text-zinc-400 w-6 text-right">
                        {screen.volume}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
                {/* Playlist Selector */}
                {permissions.canManageScreens && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-zinc-400 whitespace-nowrap">Loop:</span>
                    <select
                      value={screen.currentPlaylistId || ''}
                      onChange={e => handlePlaylistChange(screen.id, e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 px-2.5 py-1.5 rounded-lg w-full focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- No Playlist Assigned --</option>
                      {playlists.map(pl => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name} ({pl.items.length} slides)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Bottom Button Bar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1">
                    {permissions.canManageScreens && (
                      <button
                        onClick={() => handleCommand(screen.id, 'reload')}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                        title="Remote Refresh / Reload Content"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenPlayer(screen.id)}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                      title="Launch Signboard Client for this Display"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>

                    {permissions.canManageScreens && (
                      <button
                        onClick={() => setEditingScreen(screen)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                        title="Edit Screen Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {permissions.canManageScreens && (
                    <button
                      onClick={() => {
                        if (confirm(`Unenroll and disconnect screen "${screen.name}"?`)) {
                          onDeleteScreen(screen.id);
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                      title="Unenroll Screen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Screen Modal */}
      {editingScreen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Edit Screen Configuration</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingScreen.name}
                  onChange={e => setEditingScreen({ ...editingScreen, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Room / Location</label>
                <input
                  type="text"
                  value={editingScreen.location}
                  onChange={e => setEditingScreen({ ...editingScreen, location: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Group Tag</label>
                <input
                  type="text"
                  value={editingScreen.groupTag}
                  onChange={e => setEditingScreen({ ...editingScreen, groupTag: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Display Orientation</label>
                <select
                  value={editingScreen.orientation}
                  onChange={e => setEditingScreen({ ...editingScreen, orientation: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100"
                >
                  <option value="landscape">Landscape (Standard 16:9)</option>
                  <option value="portrait">Portrait (Vertical 9:16)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setEditingScreen(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateScreen(editingScreen.id, editingScreen);
                  setEditingScreen(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
