import React, { useState } from 'react';
import {
  Tv,
  Play,
  RotateCw,
  ExternalLink,
  Volume2,
  VolumeX,
  Plus,
  Radio,
  Sliders,
  AlertTriangle,
  MonitorCheck,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Playlist, ScreenDevice, UserPermission } from '../types';

interface SimulatorViewProps {
  screens: ScreenDevice[];
  playlists: Playlist[];
  onOpenPlayer: (screenId: string) => void;
  onRefreshScreen: (screenId: string) => void;
  onUpdateScreen: (screenId: string, updates: Partial<ScreenDevice>) => void;
  onOpenPairing: () => void;
  permissions: UserPermission;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  screens,
  playlists,
  onOpenPlayer,
  onRefreshScreen,
  onUpdateScreen,
  onOpenPairing,
  permissions,
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'split'>('grid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Tv className="h-5 w-5 text-indigo-400" />
              <span>Multi-Screen Network Simulator & Test Bench</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Simulate multiple connected PCs across your local network in real-time. Verify playback synchronization, playlist transitions, and remote commands.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono bg-zinc-950 border border-zinc-800 text-emerald-400 px-3 py-1.5 rounded-lg flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{screens.filter(s => s.status === 'online').length} Nodes Active</span>
            </span>

            {permissions.canManageScreens && (
              <button
                onClick={onOpenPairing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition flex items-center space-x-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Pair Another Virtual Screen</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Screen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screens.map(screen => {
          const playlist = playlists.find(p => p.id === screen.currentPlaylistId);
          const firstAsset = playlist?.items[0]?.asset;
          const isEmergency = screen.emergencyAlert?.active;

          return (
            <div
              key={screen.id}
              className={`bg-zinc-900 border rounded-2xl p-4 flex flex-col justify-between shadow-xl transition relative overflow-hidden ${
                isEmergency ? 'border-rose-500/80 bg-rose-950/20' : !screen.isPaired ? 'border-amber-500/40' : 'border-zinc-800'
              }`}
            >
              {/* Virtual Monitor Bezel */}
              <div>
                {/* Top Bezel Meta */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`h-2 w-2 rounded-full ${screen.status === 'online' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                    <span className="font-semibold text-white truncate max-w-[160px]">{screen.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                    {screen.ipAddress}
                  </span>
                </div>

                {/* Simulated Screen Monitor Glass */}
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-inner group flex items-center justify-center">
                  {screen.isPaired && playlist ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      {/* Media Display */}
                      {firstAsset?.type === 'video' ? (
                        <video
                          src={firstAsset.url}
                          autoPlay
                          playsInline
                          loop
                          muted
                          className="w-full h-full object-cover opacity-85"
                        />
                      ) : firstAsset?.type === 'image' ? (
                        <img
                          src={firstAsset.url}
                          alt={firstAsset.name}
                          className="w-full h-full object-cover opacity-90"
                        />
                      ) : (
                        <div className="text-zinc-600 text-xs flex flex-col items-center">
                          <Play className="h-6 w-6 text-zinc-500 mb-1" />
                          <span>Active Broadcast Loop</span>
                        </div>
                      )}

                      {/* Screen Overlay Widgets in miniature */}
                      <div className="absolute top-2 left-2 text-[9px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-zinc-200">
                        {screen.location}
                      </div>

                      {playlist.showClock && (
                        <div className="absolute top-2 right-2 text-[9px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-white">
                          12:00 PM
                        </div>
                      )}

                      {/* Mini Ticker */}
                      {playlist.tickerText && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-zinc-200 px-2 py-0.5 truncate font-sans">
                          {playlist.tickerText}
                        </div>
                      )}

                      {/* Emergency Flash */}
                      {isEmergency && (
                        <div className="absolute inset-0 bg-rose-600/90 flex flex-col items-center justify-center p-4 text-center z-10 animate-pulse">
                          <AlertTriangle className="h-6 w-6 text-white mb-1" />
                          <span className="font-bold text-xs text-white uppercase">{screen.emergencyAlert?.title}</span>
                          <span className="text-[10px] text-rose-100 line-clamp-2">{screen.emergencyAlert?.message}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Unenrolled Standby Visual */
                    <div className="p-4 text-center space-y-1.5">
                      <div className="font-mono text-xs text-zinc-400">UNPAIRED SIGNBOARD</div>
                      <div className="font-mono text-xl font-extrabold text-amber-400 tracking-wider">
                        {screen.pairingCode || 'SGN-842'}
                      </div>
                      <div className="text-[9px] text-zinc-500">Awaiting enrollment from admin</div>
                    </div>
                  )}

                  {/* Hover Quick Action to Open True Player */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onOpenPlayer(screen.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-lg transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Launch Full Player</span>
                    </button>
                  </div>
                </div>

                {/* Status bar */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Loop: <strong className="text-zinc-200">{playlist?.name || 'None'}</strong></span>
                  <span className="font-mono text-[10px]">{screen.resolution}</span>
                </div>
              </div>

              {/* Bench Remote Command Bar */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between">
                {permissions.canManageScreens ? (
                  <div className="flex items-center space-x-1 text-xs">
                    <button
                      onClick={() => onRefreshScreen(screen.id)}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center space-x-1 transition text-[11px]"
                      title="Simulate remote reload"
                    >
                      <RotateCw className="h-3 w-3" />
                      <span>Reload</span>
                    </button>

                    <select
                      value={screen.currentPlaylistId || ''}
                      onChange={e => onUpdateScreen(screen.id, { currentPlaylistId: e.target.value })}
                      className="bg-zinc-950 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-1 rounded max-w-[130px] focus:outline-none"
                    >
                      {playlists.map(pl => (
                        <option key={pl.id} value={pl.id}>{pl.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-500">Read-Only Telemetry View</span>
                )}

                <button
                  onClick={() => onOpenPlayer(screen.id)}
                  className="p-1 text-indigo-400 hover:text-indigo-300 rounded"
                  title="Open in Player Mode"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
