import React, { useState } from 'react';
import {
  KeyRound,
  Tv,
  CheckCircle,
  AlertCircle,
  Sparkles,
  QrCode,
  ArrowRight,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { Playlist, ScreenDevice } from '../types';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPairSuccess: (data: {
    code: string;
    name: string;
    location: string;
    groupTag: string;
    playlistId?: string;
    orientation?: 'landscape' | 'portrait';
  }) => Promise<void>;
  playlists: Playlist[];
  screens: ScreenDevice[];
  onOpenPlayer: (screenId?: string) => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  isOpen,
  onClose,
  onPairSuccess,
  playlists,
  screens,
  onOpenPlayer,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [groupTag, setGroupTag] = useState('Lobby');
  const [playlistId, setPlaylistId] = useState(playlists[0]?.id || '');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Unpaired screens detected in network
  const unpairedScreens = screens.filter(s => !s.isPaired && s.pairingCode);

  const handleSelectDiscovered = (unpaired: ScreenDevice) => {
    setCode(unpaired.pairingCode || '');
    setName(unpaired.name || 'New Signboard Client');
    setLocation(unpaired.location || 'Building A');
    setError(null);
  };

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the 6-character pairing code');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onPairSuccess({
        code: code.trim().toUpperCase(),
        name: name.trim() || 'Signboard Display',
        location: location.trim() || 'Main Hall',
        groupTag: groupTag.trim() || 'General',
        playlistId: playlistId || undefined,
        orientation,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to pair device. Verify the pairing code is correct and active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Enroll Signboard Display</h2>
              <p className="text-xs text-zinc-400">Pair any PC, smart TV, or mini computer running the Signboard Player.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="py-10 text-center space-y-3">
            <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Device Successfully Enrolled!</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Display has synchronized with the central gateway. Content playback will begin immediately on the paired screen.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePair} className="space-y-5">
            {error && (
              <div className="bg-rose-950/60 border border-rose-500/50 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Discovered Unpaired Screens in Network */}
            {unpairedScreens.length > 0 && (
              <div className="bg-zinc-950 border border-indigo-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center space-x-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                    <span>Auto-Discovered Unpaired Screen in Network:</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">1-Click Auto-Fill</span>
                </div>
                <div className="space-y-1.5">
                  {unpairedScreens.map(unpaired => (
                    <button
                      key={unpaired.id}
                      type="button"
                      onClick={() => handleSelectDiscovered(unpaired)}
                      className="w-full text-left bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-indigo-500/40 p-2.5 rounded-lg flex items-center justify-between transition group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Tv className="h-4 w-4 text-amber-400" />
                        <div>
                          <div className="text-xs font-medium text-white">{unpaired.name}</div>
                          <div className="text-[10px] text-zinc-400">{unpaired.ipAddress} • {unpaired.resolution}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                          {unpaired.pairingCode}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-indigo-400 transition" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pairing Code Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Screen Pairing Code <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-zinc-500">6 characters displayed on screen (e.g. SGN-842)</span>
              </div>
              <input
                type="text"
                placeholder="XXX-XXX"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                required
                className="w-full bg-zinc-950 border border-zinc-700 text-center font-mono text-xl tracking-widest text-white py-3 rounded-xl focus:outline-none focus:border-indigo-500 uppercase placeholder-zinc-600"
              />
            </div>

            {/* Device Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. 1st Floor Reception Video Wall"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Room / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Building A, Main Entrance"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Group / Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Lobby, Cafeteria, Kiosk"
                  value={groupTag}
                  onChange={e => setGroupTag(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Screen Orientation</label>
                <select
                  value={orientation}
                  onChange={e => setOrientation(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="landscape">Landscape (Standard 16:9)</option>
                  <option value="portrait">Portrait (Vertical 9:16)</option>
                </select>
              </div>
            </div>

            {/* Initial Playlist */}
            <div className="space-y-1.5 text-xs">
              <label className="text-zinc-300 font-medium">Initial Content Playlist</label>
              <select
                value={playlistId}
                onChange={e => setPlaylistId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                {playlists.map(pl => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name} ({pl.items.length} slides)
                  </option>
                ))}
              </select>
            </div>

            {/* Hint & Launch Client Simulator Button */}
            <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800">
              <div className="flex items-center space-x-1.5">
                <Monitor className="h-4 w-4 text-zinc-500" />
                <span>Need a test display screen?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenPlayer();
                  onClose();
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Launch Display Player in new tab
              </button>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Enrolling Screen...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Enroll & Pair Device</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
