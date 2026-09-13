import React from 'react';
import {
  Monitor,
  Radio,
  Clock,
  Layers,
  Calendar,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  PlaySquare,
  PlusCircle,
  Tv,
  Wifi,
  Users
} from 'lucide-react';
import { SystemStats, UserAccount, UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  stats: SystemStats | null;
  currentUser: UserAccount;
  onSwitchUser: (user: UserAccount) => void;
  allUsers: UserAccount[];
  onOpenPairing: () => void;
  onOpenEmergencyModal: () => void;
  onOpenPlayer: (screenId?: string) => void;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  currentUser,
  onSwitchUser,
  allUsers,
  onOpenPairing,
  onOpenEmergencyModal,
  onOpenPlayer,
  isConnected,
}) => {
  const navItems = [
    { id: 'screens', label: 'Displays & Monitoring', icon: Monitor, badge: stats?.onlineScreens ? `${stats.onlineScreens}/${stats.totalScreens}` : undefined },
    { id: 'pairing', label: 'Device Pairing', icon: KeyRound },
    { id: 'assets', label: 'Asset Library', icon: Layers, badge: stats?.totalAssets ? `${stats.totalAssets}` : undefined },
    { id: 'playlists', label: 'Playlists', icon: PlaySquare, badge: stats?.activePlaylists ? `${stats.activePlaylists}` : undefined },
    { id: 'schedules', label: 'Remote Schedules', icon: Calendar },
    { id: 'simulator', label: 'Multi-Screen Bench', icon: Tv },
    { id: 'rbac', label: 'RBAC & Audit', icon: ShieldCheck },
  ];

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'content_manager': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'screen_operator': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'viewer': return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'content_manager': return 'Content Manager';
      case 'screen_operator': return 'Screen Operator';
      case 'viewer': return 'Auditor / Viewer';
    }
  };

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40 text-zinc-100">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Network Status */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">SIGNBOARD</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Network OS
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-400">
                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                <span>{isConnected ? 'Local Network Gateway Active' : 'Gateway Reconnecting...'}</span>
                <span className="text-zinc-600">•</span>
                <span>Port 3000 (ws://)</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center space-x-2">
              <Monitor className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-zinc-400">Displays:</span>
              <span className="font-semibold text-zinc-100">
                {stats ? `${stats.onlineScreens} / ${stats.totalScreens} Online` : '...'}
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center space-x-2">
              <PlaySquare className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-zinc-400">Active Loops:</span>
              <span className="font-semibold text-zinc-100">{stats?.activePlaylists ?? 0}</span>
            </div>

            {stats && stats.activeAlarms > 0 && (
              <div className="bg-rose-950/60 border border-rose-600/40 text-rose-300 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-semibold">{stats.activeAlarms} Emergency Active</span>
              </div>
            )}
          </div>

          {/* Top Actions & Role Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Launch Player Button */}
            <button
              id="launch-player-btn"
              onClick={() => onOpenPlayer()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
              title="Open full-screen signage player view"
            >
              <Tv className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Launch Player</span>
            </button>

            {/* Pair Screen Button */}
            <button
              id="pair-screen-btn"
              onClick={onOpenPairing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Enroll Device</span>
            </button>

            {/* Emergency Broadcast Button */}
            <button
              id="emergency-broadcast-btn"
              onClick={onOpenEmergencyModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition"
              title="Broadcast Emergency Warning across screens"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span className="hidden md:inline">Alert</span>
            </button>

            {/* Role Switcher Menu */}
            <div className="relative group">
              <div className="flex items-center space-x-2 pl-2 border-l border-zinc-800">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-zinc-200 leading-tight">{currentUser.name}</div>
                  <span className={`text-[10px] font-medium border px-1.5 py-0.2 rounded ${getRoleBadgeColor(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200 cursor-pointer group-hover:border-zinc-500 transition">
                  {currentUser.name.charAt(0)}
                </div>
              </div>

              {/* Role Switcher Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Switch Active Role (RBAC)
                </div>
                {allUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => onSwitchUser(user)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                      currentUser.id === user.id ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div>
                      <div>{user.name}</div>
                      <div className="text-[10px] text-zinc-500">{user.department}</div>
                    </div>
                    <span className={`text-[9px] border px-1 rounded ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-zinc-900/60 border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-indigo-500/30 text-indigo-300' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
