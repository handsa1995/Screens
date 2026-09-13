import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  X,
  CheckCircle,
  ShieldAlert,
  Flame,
  CloudRain,
  Megaphone
} from 'lucide-react';
import { ScreenDevice } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  screens: ScreenDevice[];
  onDispatchEmergency: (payload: {
    screenIds?: string[] | 'all';
    active: boolean;
    title?: string;
    message?: string;
    severity?: 'warning' | 'danger' | 'info';
  }) => Promise<void>;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  screens,
  onDispatchEmergency,
}) => {
  const [title, setTitle] = useState('BUILDING EVACUATION NOTICE');
  const [message, setMessage] = useState('An emergency has been reported. Please proceed to the nearest emergency exit immediately.');
  const [severity, setSeverity] = useState<'danger' | 'warning' | 'info'>('danger');
  const [targetScope, setTargetScope] = useState<'all' | 'specific'>('all');
  const [selectedScreenIds, setSelectedScreenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const hasActiveAlarms = screens.some(s => s.emergencyAlert?.active);

  const presets = [
    {
      title: 'FIRE EVACUATION NOTICE',
      message: 'Alarm sounding in sector 2. Proceed calm and orderly to designated assembly point.',
      severity: 'danger' as const,
      icon: Flame,
    },
    {
      title: 'SEVERE WEATHER ADVISORY',
      message: 'Severe thunderstorms & high winds detected in region. Remain indoors away from exterior windows.',
      severity: 'warning' as const,
      icon: CloudRain,
    },
    {
      title: 'CAMPUS DRILL ANNOUNCEMENT',
      message: 'Routine emergency preparedness exercise in progress. Normal operations will resume at 11:30 AM.',
      severity: 'info' as const,
      icon: Megaphone,
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTitle(p.title);
    setMessage(p.message);
    setSeverity(p.severity);
  };

  const handleBroadcast = async (active: boolean) => {
    setLoading(true);
    try {
      await onDispatchEmergency({
        screenIds: targetScope === 'all' ? 'all' : selectedScreenIds,
        active,
        title,
        message,
        severity,
      });
      onClose();
    } catch (e: any) {
      alert(e.message || 'Failed to dispatch broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-rose-600/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Emergency Broadcast Command</h2>
              <p className="text-xs text-zinc-400">Push high-priority emergency alerts immediately across network displays.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
        </div>

        {/* Clear existing alarms if any are active */}
        {hasActiveAlarms && (
          <div className="bg-rose-950/60 border border-rose-500/50 p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-300 text-xs font-semibold">
              <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
              <span>Emergency Broadcast Currently Active Across Displays</span>
            </div>
            <button
              onClick={() => handleBroadcast(false)}
              disabled={loading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
            >
              Clear Alarms
            </button>
          </div>
        )}

        {/* Presets */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
            Emergency Templates
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="bg-zinc-950 border border-zinc-800 hover:border-rose-500/50 p-2.5 rounded-xl text-left transition text-xs group"
                >
                  <Icon className="h-4 w-4 text-rose-400 mb-1" />
                  <div className="font-semibold text-zinc-200 line-clamp-1">{p.title}</div>
                  <div className="text-[10px] text-zinc-500 uppercase mt-0.5">{p.severity}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Details */}
        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium">Broadcast Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 uppercase font-bold focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-300 font-medium">Alert Instructions & Message</label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Severity Level</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 focus:border-rose-500 focus:outline-none"
              >
                <option value="danger">Danger (High Priority Evacuation)</option>
                <option value="warning">Warning (Weather / Advisory)</option>
                <option value="info">Information (Drill Notice)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Target Broadcast Scope</label>
              <select
                value={targetScope}
                onChange={e => setTargetScope(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 focus:border-rose-500 focus:outline-none"
              >
                <option value="all">All Connected Screens ({screens.length})</option>
                <option value="specific">Select Specific Displays</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleBroadcast(true)}
            disabled={loading}
            className="px-6 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition disabled:opacity-50"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{loading ? 'Transmitting...' : 'Dispatch Alert to Displays'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
