import React, { useState } from 'react';
import {
  Layers,
  Upload,
  Video,
  Image as ImageIcon,
  Trash2,
  Play,
  CheckCircle2,
  HardDrive,
  Eye,
  Plus,
  Tag,
  Clock,
  Filter,
  Search,
  Film
} from 'lucide-react';
import { MediaAsset, UserPermission } from '../types';

interface AssetManagerViewProps {
  assets: MediaAsset[];
  onAddAsset: (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteAsset: (id: string) => Promise<void>;
  permissions: UserPermission;
}

export const AssetManagerView: React.FC<AssetManagerViewProps> = ({
  assets,
  onAddAsset,
  onDeleteAsset,
  permissions,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload Form State
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState<'video' | 'image'>('image');
  const [assetUrl, setAssetUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState(10);
  const [tagsInput, setTagsInput] = useState('Lobby, Promo');
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // All unique tags across assets
  const allTags = Array.from(new Set(assets.flatMap(a => a.tags)));

  const filteredAssets = assets.filter(a => {
    const matchType = activeTab === 'all' || a.type === activeTab;
    const matchTag = selectedTag === 'all' || a.tags.includes(selectedTag);
    const matchSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchType && matchTag && matchSearch;
  });

  // Handle local file drop or selection
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    let file: File | null = null;
    if ('dataTransfer' in e) {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        file = e.dataTransfer.files[0];
      }
    } else if (e.target.files && e.target.files[0]) {
      file = e.target.files[0];
    }

    if (!file) return;

    const isVid = file.type.startsWith('video/');
    setAssetType(isVid ? 'video' : 'image');
    setAssetName(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAssetUrl(dataUrl);
      setThumbnailUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetUrl) return;

    setUploading(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      await onAddAsset({
        name: assetName || (assetType === 'video' ? 'Signage Video Clip' : 'Signage Visual Banner'),
        type: assetType,
        url: assetUrl,
        thumbnailUrl: thumbnailUrl || assetUrl,
        durationSeconds: Number(duration) || 10,
        sizeBytes: assetType === 'video' ? 12500000 : 2100000,
        width: 1920,
        height: 1080,
        tags: tags.length ? tags : ['General'],
      });

      setUploadFeedback('Asset uploaded and distributed to media edge repository.');
      setTimeout(() => setUploadFeedback(null), 3000);
      setIsUploadModalOpen(false);
      // Reset form
      setAssetName('');
      setAssetUrl('');
      setThumbnailUrl('');
    } catch (err: any) {
      alert(err.message || 'Failed to upload asset');
    } finally {
      setUploading(false);
    }
  };

  // Pre-configured signage templates for 1-click addition
  const samplePresets = [
    {
      name: 'Dynamic Cyber Waves Video Loop (1080p)',
      type: 'video' as const,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
      duration: 15,
      tags: 'Ambient, High-Tech, Video',
    },
    {
      name: 'Mountain Sunrise 4K Scenic Loop',
      type: 'video' as const,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      duration: 15,
      tags: 'Scenic, Nature, Relaxing',
    },
    {
      name: 'Modern Executive Workspace Poster',
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
      duration: 10,
      tags: 'Lobby, Corporate',
    },
    {
      name: 'Artisan Bistro Menu Board',
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
      duration: 12,
      tags: 'Menu, Cafeteria, Dining',
    },
  ];

  const handleApplyPreset = (preset: typeof samplePresets[0]) => {
    setAssetName(preset.name);
    setAssetType(preset.type);
    setAssetUrl(preset.url);
    setThumbnailUrl(preset.thumbnailUrl);
    setDuration(preset.duration);
    setTagsInput(preset.tags);
  };

  const totalStorageBytes = assets.reduce((acc, a) => acc + (a.sizeBytes || 0), 0);
  const totalStorageMb = (totalStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Upload Feedback */}
      {uploadFeedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{uploadFeedback}</span>
          </div>
          <button onClick={() => setUploadFeedback(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              <span>Cloud Asset Management</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              High-resolution video loops, image billboards, and interactive signage assets stored and synchronized across network displays.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Storage Quota */}
            <div className="bg-zinc-950 border border-zinc-800 px-3.5 py-2 rounded-xl flex items-center space-x-3 text-xs">
              <HardDrive className="h-4 w-4 text-indigo-400" />
              <div>
                <div className="text-[11px] text-zinc-400">Media Storage Used</div>
                <div className="font-semibold text-zinc-200 font-mono">{totalStorageMb} MB / 5 GB</div>
              </div>
            </div>

            {permissions.canEditContent && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload New Asset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Media ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
              activeTab === 'video' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="h-3.5 w-3.5 text-blue-400" />
            <span>Videos ({assets.filter(a => a.type === 'video').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
              activeTab === 'image' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
            <span>Images ({assets.filter(a => a.type === 'image').length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredAssets.map(asset => {
          const isVideo = asset.type === 'video';

          return (
            <div
              key={asset.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-md transition group flex flex-col justify-between"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => setPreviewAsset(asset)}>
                {isVideo ? (
                  <div className="w-full h-full relative">
                    <img
                      src={asset.thumbnailUrl || asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition">
                        <Play className="h-4 w-4 ml-0.5 fill-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                )}

                {/* Badge Overlay */}
                <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                    isVideo ? 'bg-blue-600/90 text-white' : 'bg-emerald-600/90 text-white'
                  }`}>
                    {isVideo ? <Video className="h-2.5 w-2.5 mr-1" /> : <ImageIcon className="h-2.5 w-2.5 mr-1" />}
                    <span>{isVideo ? 'MP4 VIDEO' : 'IMAGE'}</span>
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-zinc-200 px-1.5 py-0.5 rounded">
                  {asset.durationSeconds}s
                </div>
              </div>

              {/* Asset Meta Info */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-tight line-clamp-1" title={asset.name}>
                    {asset.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {asset.tags.map(t => (
                      <span key={t} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-mono">{asset.width}x{asset.height}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
                      title="Preview Media"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {permissions.canEditContent && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete media asset "${asset.name}"?`)) {
                            onDeleteAsset(asset.id);
                          }
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-rose-950/30 transition"
                        title="Delete Asset"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{previewAsset.name}</h3>
                <span className="text-xs text-zinc-400 font-mono">ID: {previewAsset.id}</span>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-zinc-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Media Player Container */}
            <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              {previewAsset.type === 'video' ? (
                <video
                  src={previewAsset.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Diagnostics Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 block text-[10px]">MEDIA TYPE</span>
                <span className="font-semibold text-zinc-200 uppercase">{previewAsset.type}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">RESOLUTION</span>
                <span className="font-mono text-zinc-200">{previewAsset.width} x {previewAsset.height}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">SLIDE DURATION</span>
                <span className="font-mono text-zinc-200">{previewAsset.durationSeconds} seconds</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">TAGS</span>
                <span className="text-zinc-200">{previewAsset.tags.join(', ')}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewAsset(null)}
                className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Asset Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Upload Cloud Asset</h2>
                  <p className="text-xs text-zinc-400">Add videos (MP4/WebM) or images (JPEG, PNG, WebP) to the digital signage network.</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-zinc-950/50 transition relative group"
              >
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileDrop}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="space-y-2">
                  <div className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-400 group-hover:text-indigo-400 border border-zinc-800 group-hover:border-indigo-500 transition">
                    <Film className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Drag & drop your video or image file here</span>
                    <span className="text-zinc-400"> or click to browse</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Supports 4K MP4, WebM, PNG, JPG, and GIF up to 50MB
                  </p>
                </div>
              </div>

              {/* Sample Presets for Quick Testing */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Or choose from 4K Signage Presets:</label>
                <div className="grid grid-cols-2 gap-2">
                  {samplePresets.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-left p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 transition text-[11px]"
                    >
                      <div className="font-medium text-zinc-200 truncate">{preset.name}</div>
                      <div className="text-[10px] text-indigo-400">{preset.type.toUpperCase()} • {preset.duration}s</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Asset Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Promo 4K Loop"
                    value={assetName}
                    onChange={e => setAssetName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Media Type</label>
                  <select
                    value={assetType}
                    onChange={e => setAssetType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="video">MP4 Video Loop</option>
                    <option value="image">Still Image / Graphic Slide</option>
                  </select>
                </div>
              </div>

              {/* Media URL */}
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Media URL / Data Source</label>
                <input
                  type="text"
                  required
                  placeholder="https://... or base64 file preview"
                  value={assetUrl}
                  onChange={e => setAssetUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:border-indigo-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              {/* Duration and Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Display Duration (Seconds)</label>
                  <input
                    type="number"
                    min="3"
                    max="300"
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Categorization Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Lobby, Menu, Promo"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg disabled:opacity-50"
                >
                  {uploading ? 'Processing Asset...' : 'Save & Publish Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
