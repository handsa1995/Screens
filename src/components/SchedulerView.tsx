import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  Tag,
  Monitor,
  AlertCircle,
  Layers,
  ArrowRight,
  Filter,
  Play
} from 'lucide-react';
import { Playlist, ScheduleEvent, ScreenDevice, UserPermission } from '../types';

interface SchedulerViewProps {
  schedules: ScheduleEvent[];
  playlists: Playlist[];
  screens: ScreenDevice[];
  onCreateSchedule: (data: Partial<ScheduleEvent>) => Promise<void>;
  onUpdateSchedule: (id: string, data: Partial<ScheduleEvent>) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  permissions: UserPermission;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  schedules,
  playlists,
  screens,
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  permissions,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [playlistId, setPlaylistId] = useState(playlists[0]?.id || '');
  const [targetType, setTargetType] = useState<'all' | 'tag' | 'screen'>('all');
  const [targetValue, setTargetValue] = useState('all');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [priority, setPriority] = useState(10);

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const allTags = Array.from(new Set(screens.map(s => s.groupTag).filter(Boolean)));

  const handleToggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onCreateSchedule({
      name,
      playlistId,
      targetType,
      targetValue: targetType === 'all' ? 'all' : targetValue,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      startTime,
      endTime,
      daysOfWeek: selectedDays,
      priority,
      isActive: true,
    });

    setIsModalOpen(false);
    setName('');
  };

  const getTargetDescription = (sched: ScheduleEvent) => {
    if (sched.targetType === 'all') return 'All Network Screens';
    if (sched.targetType === 'tag') return `Screens tagged "${sched.targetValue}"`;
    const targetScreen = screens.find(s => s.id === sched.targetValue);
    return `Screen: ${targetScreen?.name || sched.targetValue}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              <span>Remote Content Scheduling</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automate dayparting playlists: morning notices, afternoon menus, and evening showcase broadcasts by time window and target screens.
            </p>
          </div>

          {permissions.canPublishSchedules && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Content Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* 24-Hour Day Timeline Visualizer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>24-Hour Broadcast Dayparting Coverage</span>
          </h3>
          <span className="text-[11px] text-zinc-500">Active Time-Slots</span>
        </div>

        {/* Timeline Bar */}
        <div className="relative bg-zinc-950 rounded-xl p-3 border border-zinc-800">
          <div className="grid grid-cols-24 gap-1 text-[9px] font-mono text-zinc-500 mb-2">
            {Array.from({ length: 24 }).map((_, hour) => (
              <span key={hour} className="text-center">
                {hour % 3 === 0 ? `${hour}:00` : ''}
              </span>
            ))}
          </div>

          {/* Schedule Bars */}
          <div className="space-y-2">
            {schedules.map((sched, idx) => {
              const startH = parseInt(sched.startTime.split(':')[0]) + parseInt(sched.startTime.split(':')[1]) / 60;
              const endH = parseInt(sched.endTime.split(':')[0]) + parseInt(sched.endTime.split(':')[1]) / 60;
              const leftPercent = (startH / 24) * 100;
              const widthPercent = Math.max(((endH - startH) / 24) * 100, 4);

              const colors = [
                'bg-indigo-600/80 border-indigo-400 text-indigo-100',
                'bg-emerald-600/80 border-emerald-400 text-emerald-100',
                'bg-amber-600/80 border-amber-400 text-amber-100',
                'bg-blue-600/80 border-blue-400 text-blue-100',
              ];
              const colorClass = colors[idx % colors.length];

              return (
                <div key={sched.id} className="relative h-7 bg-zinc-900/60 rounded-md overflow-hidden">
                  <div
                    className={`absolute top-0 bottom-0 border-l border-r rounded px-2 flex items-center text-[10px] font-medium truncate shadow-sm ${colorClass}`}
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                  >
                    <span className="truncate">{sched.name} ({sched.startTime} - {sched.endTime})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
          Configured Broadcast Events ({schedules.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schedules.map(sched => {
            const assignedPlaylist = playlists.find(p => p.id === sched.playlistId);

            return (
              <div
                key={sched.id}
                className={`bg-zinc-900 border rounded-2xl p-5 flex flex-col justify-between transition hover:border-zinc-700 shadow-md ${
                  sched.isActive ? 'border-zinc-800' : 'border-zinc-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded">
                        Priority {sched.priority}
                      </span>
                      <h3 className="font-semibold text-sm text-white tracking-tight mt-1.5">{sched.name}</h3>
                    </div>

                    {permissions.canPublishSchedules && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sched.isActive}
                          onChange={e => onUpdateSchedule(sched.id, { isActive: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500" />
                      </label>
                    )}
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-zinc-400 border-t border-zinc-800/80 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Daily Broadcast:</span>
                      </span>
                      <span className="font-mono text-zinc-200">{sched.startTime} - {sched.endTime}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Monitor className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Target Audience:</span>
                      </span>
                      <span className="text-zinc-200 text-right truncate max-w-[150px]">
                        {getTargetDescription(sched)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Play className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Broadcast Loop:</span>
                      </span>
                      <span className="font-medium text-indigo-300 truncate max-w-[150px]">
                        {assignedPlaylist?.name || 'Assigned Loop'}
                      </span>
                    </div>

                    {/* Recurring Days */}
                    <div className="pt-2">
                      <div className="text-[10px] text-zinc-500 mb-1">RECURRENCE DAYS</div>
                      <div className="flex space-x-1">
                        {daysLabels.map((d, i) => {
                          const active = sched.daysOfWeek.includes(i);
                          return (
                            <span
                              key={d}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                active ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-800 text-zinc-500'
                              }`}
                            >
                              {d}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                {permissions.canPublishSchedules && (
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-500">
                      {sched.isActive ? 'Active on Edge Players' : 'Schedule Paused'}
                    </span>

                    <button
                      onClick={() => {
                        if (confirm(`Remove schedule "${sched.name}"?`)) {
                          onDeleteSchedule(sched.id);
                        }
                      }}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded transition"
                      title="Delete Schedule"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Scheduled Content Slot</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Schedule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Visitor Greeting"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Content Playlist</label>
                <select
                  value={playlistId}
                  onChange={e => setPlaylistId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  {playlists.map(pl => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} ({pl.items.length} items)
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Screens */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Target Screen Scope</label>
                  <select
                    value={targetType}
                    onChange={e => setTargetType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Screens</option>
                    <option value="tag">Group by Location Tag</option>
                    <option value="screen">Specific Screen</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Target Selection</label>
                  {targetType === 'all' ? (
                    <input
                      type="text"
                      disabled
                      value="Broadcasts to all devices"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-500"
                    />
                  ) : targetType === 'tag' ? (
                    <select
                      value={targetValue}
                      onChange={e => setTargetValue(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    >
                      {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={targetValue}
                      onChange={e => setTargetValue(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    >
                      {screens.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Time Window */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Daily Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Daily End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Recurring Days */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Active Days of Week</label>
                <div className="flex space-x-2">
                  {daysLabels.map((d, i) => {
                    const isSelected = selectedDays.includes(i);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleToggleDay(i)}
                        className={`flex-1 py-1.5 rounded-lg font-mono text-center font-semibold transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-zinc-300 font-medium">Priority Override</label>
                  <span className="text-zinc-400 font-mono">Level {priority}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <p className="text-[10px] text-zinc-500">Higher priority schedules override normal day loops.</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg"
                >
                  Publish Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
