import React, { useState } from 'react';
import {
  PlaySquare,
  Plus,
  Trash2,
  Clock,
  Volume2,
  Layers,
  Sparkles,
  MoveLeft,
  MoveRight,
  Tv,
  Check,
  Eye,
  Type,
  CloudSun
} from 'lucide-react';
import { MediaAsset, Playlist, PlaylistItem, UserPermission } from '../types';

interface PlaylistsViewProps {
  playlists: Playlist[];
  assets: MediaAsset[];
  onCreatePlaylist: (data: Partial<Playlist>) => Promise<void>;
  onUpdatePlaylist: (id: string, data: Partial<Playlist>) => Promise<void>;
  onDeletePlaylist: (id: string) => Promise<void>;
  permissions: UserPermission;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  assets,
  onCreatePlaylist,
  onUpdatePlaylist,
  onDeletePlaylist,
  permissions,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(playlists[0]?.id || '');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [newTickerText, setNewTickerText] = useState('Welcome to Signboard Network • Digital Signage Broadcast Active');
  const [showClock, setShowClock] = useState(true);
  const [showWeather, setShowWeather] = useState(true);

  // Asset picker modal for adding to playlist
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);

  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId) || playlists[0];

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    // Default with first 2 assets if available
    const initialItems: PlaylistItem[] = assets.slice(0, 2).map((a, idx) => ({
      id: 'item-' + Math.random().toString(36).substring(2, 9),
      assetId: a.id,
      durationSeconds: a.durationSeconds || 10,
      transition: 'fade',
      volume: a.type === 'video' ? 30 : 0,
    }));

    await onCreatePlaylist({
      name: newPlaylistName,
      description: newPlaylistDesc,
      items: initialItems,
      tickerText: newTickerText,
      showClock,
      showWeather,
    });

    setIsNewModalOpen(false);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
  };

  const handleAddItem = async (asset: MediaAsset) => {
    if (!activePlaylist) return;
    const newItem: PlaylistItem = {
      id: 'item-' + Math.random().toString(36).substring(2, 9),
      assetId: asset.id,
      durationSeconds: asset.durationSeconds || 10,
      transition: 'fade',
      volume: asset.type === 'video' ? 40 : 0,
    };
    const updatedItems = [...activePlaylist.items, newItem];
    await onUpdatePlaylist(activePlaylist.id, { items: updatedItems });
    setIsAssetPickerOpen(false);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!activePlaylist) return;
    const updatedItems = activePlaylist.items.filter(i => i.id !== itemId);
    await onUpdatePlaylist(activePlaylist.id, { items: updatedItems });
  };

  const handleMoveItem = async (index: number, direction: 'left' | 'right') => {
    if (!activePlaylist) return;
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activePlaylist.items.length) return;

    const copy = [...activePlaylist.items];
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;

    await onUpdatePlaylist(activePlaylist.id, { items: copy });
  };

  const handleUpdateItemDuration = async (itemId: string, duration: number) => {
    if (!activePlaylist) return;
    const copy = activePlaylist.items.map(it => it.id === itemId ? { ...it, durationSeconds: duration } : it);
    await onUpdatePlaylist(activePlaylist.id, { items: copy });
  };

  const handleUpdateItemTransition = async (itemId: string, transition: 'fade' | 'slide' | 'zoom' | 'none') => {
    if (!activePlaylist) return;
    const copy = activePlaylist.items.map(it => it.id === itemId ? { ...it, transition } : it);
    await onUpdatePlaylist(activePlaylist.id, { items: copy });
  };

  const totalLoopDuration = activePlaylist?.items.reduce((acc, it) => acc + (it.durationSeconds || 10), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <PlaySquare className="h-5 w-5 text-indigo-400" />
              <span>Signage Playlists & Sequences</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Compose video loops, image presentations, ticker headlines, and screen overlay widgets into broadcast loops.
            </p>
          </div>

          {permissions.canEditContent && (
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Playlist</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Playlists Selector (Left 4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Available Playlists ({playlists.length})
          </div>

          <div className="space-y-2">
            {playlists.map(pl => {
              const isSelected = pl.id === activePlaylist?.id;
              const loopDuration = pl.items.reduce((acc, it) => acc + (it.durationSeconds || 10), 0);

              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-zinc-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className={`text-sm font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                        {pl.name}
                      </h3>
                      <span className="text-[10px] font-mono bg-zinc-800 text-indigo-300 px-2 py-0.5 rounded">
                        {pl.items.length} slides
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {pl.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{loopDuration}s loop</span>
                    </span>
                    {permissions.canEditContent && playlists.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete playlist "${pl.name}"?`)) {
                            onDeletePlaylist(pl.id);
                          }
                        }}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition"
                        title="Delete Playlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Playlist Sequence Canvas (Right 8 cols) */}
        {activePlaylist ? (
          <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-800 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">{activePlaylist.name}</h2>
                  <span className="text-xs font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    {totalLoopDuration}s Total Loop
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{activePlaylist.description}</p>
              </div>

              {permissions.canEditContent && (
                <button
                  onClick={() => setIsAssetPickerOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Slide from Library</span>
                </button>
              )}
            </div>

            {/* Sequence Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Slide Playback Timeline ({activePlaylist.items.length} Elements)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Plays in circular rotation on connected screens
                </span>
              </div>

              {activePlaylist.items.length === 0 ? (
                <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">This playlist is currently empty.</p>
                  <button
                    onClick={() => setIsAssetPickerOpen(true)}
                    className="mt-3 text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    + Add your first slide from the library
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activePlaylist.items.map((item, idx) => {
                    const asset = item.asset || assets.find(a => a.id === item.assetId);

                    return (
                      <div
                        key={item.id}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition"
                      >
                        {/* Slide Thumbnail and Index */}
                        <div className="flex items-center space-x-3">
                          <span className="h-6 w-6 rounded-full bg-zinc-800 font-mono text-[11px] font-bold text-zinc-300 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>

                          <div className="h-14 w-24 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 relative">
                            {asset?.thumbnailUrl || asset?.url ? (
                              <img
                                src={asset.thumbnailUrl || asset.url}
                                alt={asset.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                                Slide
                              </div>
                            )}
                            {asset?.type === 'video' && (
                              <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-[9px] font-bold px-1 rounded">
                                MP4
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-white line-clamp-1">
                              {asset?.name || `Asset #${item.assetId}`}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center space-x-2">
                              <span>{asset?.width || 1920}x{asset?.height || 1080}</span>
                              <span className="text-zinc-600">•</span>
                              <span className="capitalize text-indigo-400 font-medium">{item.transition} Transition</span>
                            </div>
                          </div>
                        </div>

                        {/* Timing and Transition Controls */}
                        <div className="flex items-center space-x-3 text-xs pl-9 sm:pl-0">
                          {/* Duration */}
                          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                            <input
                              type="number"
                              min="3"
                              max="120"
                              value={item.durationSeconds}
                              onChange={e => handleUpdateItemDuration(item.id, Number(e.target.value))}
                              disabled={!permissions.canEditContent}
                              className="w-10 bg-transparent text-center font-mono text-zinc-200 focus:outline-none"
                            />
                            <span className="text-[10px] text-zinc-500">sec</span>
                          </div>

                          {/* Transition Type */}
                          <select
                            value={item.transition}
                            onChange={e => handleUpdateItemTransition(item.id, e.target.value as any)}
                            disabled={!permissions.canEditContent}
                            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] px-2 py-1 rounded-lg focus:outline-none focus:border-indigo-500"
                          >
                            <option value="fade">Fade</option>
                            <option value="slide">Slide</option>
                            <option value="zoom">Zoom</option>
                            <option value="none">Cut</option>
                          </select>

                          {/* Reorder Buttons */}
                          {permissions.canEditContent && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleMoveItem(idx, 'left')}
                                disabled={idx === 0}
                                className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800 transition"
                                title="Move Earlier"
                              >
                                <MoveLeft className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveItem(idx, 'right')}
                                disabled={idx === activePlaylist.items.length - 1}
                                className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800 transition"
                                title="Move Later"
                              >
                                <MoveRight className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-rose-950/30 transition ml-1"
                                title="Remove from playlist"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Overlays Configuration (Ticker, Clock, Weather) */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Screen Overlays & Widgets
              </span>

              {/* Ticker Text */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 flex items-center space-x-1.5">
                  <Type className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Scrolling Headline Ticker (Bottom Screen Banner)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={activePlaylist.tickerText || ''}
                    onChange={e => onUpdatePlaylist(activePlaylist.id, { tickerText: e.target.value })}
                    placeholder="Enter breaking news or announcements to scroll across the bottom..."
                    disabled={!permissions.canEditContent}
                    className="w-full bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center space-x-2.5 bg-zinc-950 border border-zinc-800 p-3 rounded-xl cursor-pointer hover:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={activePlaylist.showClock}
                    onChange={e => onUpdatePlaylist(activePlaylist.id, { showClock: e.target.checked })}
                    disabled={!permissions.canEditContent}
                    className="accent-indigo-600 rounded h-4 w-4"
                  />
                  <div className="flex items-center space-x-2 text-zinc-300">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    <span>Display Digital Time & Date in Corner</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 bg-zinc-950 border border-zinc-800 p-3 rounded-xl cursor-pointer hover:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={activePlaylist.showWeather}
                    onChange={e => onUpdatePlaylist(activePlaylist.id, { showWeather: e.target.checked })}
                    disabled={!permissions.canEditContent}
                    className="accent-indigo-600 rounded h-4 w-4"
                  />
                  <div className="flex items-center space-x-2 text-zinc-300">
                    <CloudSun className="h-4 w-4 text-amber-400" />
                    <span>Display Campus Weather Widget</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Asset Picker Modal */}
      {isAssetPickerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Select Asset to Add to Loop</h3>
              <button
                onClick={() => setIsAssetPickerOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {assets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => handleAddItem(asset)}
                  className="bg-zinc-950 border border-zinc-800 hover:border-indigo-500 rounded-xl p-2.5 flex items-center space-x-3 cursor-pointer transition group"
                >
                  <div className="h-12 w-20 bg-zinc-900 rounded-lg overflow-hidden shrink-0">
                    <img src={asset.thumbnailUrl || asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-indigo-400">
                      {asset.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {asset.type.toUpperCase()} • {asset.durationSeconds}s
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsAssetPickerOpen(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Signage Playlist</h3>

            <form onSubmit={handleCreatePlaylist} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Cafeteria Promo"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Description / Location Purpose</label>
                <textarea
                  placeholder="e.g. Broadcasted on all 2nd floor displays during lunch rush"
                  value={newPlaylistDesc}
                  onChange={e => setNewPlaylistDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Default Ticker Message</label>
                <input
                  type="text"
                  value={newTickerText}
                  onChange={e => setNewTickerText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
