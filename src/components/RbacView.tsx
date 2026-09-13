import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  KeyRound,
  Lock,
  Search,
  Sliders,
  Check
} from 'lucide-react';
import { AuditLogEntry, UserAccount, UserPermission, UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../../server/store';

interface RbacViewProps {
  users: UserAccount[];
  auditLogs: AuditLogEntry[];
  currentUser: UserAccount;
  onUpdateUserRole: (userId: string, role: UserRole) => Promise<void>;
  onCreateUser: (data: Partial<UserAccount>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  permissions: UserPermission;
}

export const RbacView: React.FC<RbacViewProps> = ({
  users,
  auditLogs,
  currentUser,
  onUpdateUserRole,
  onCreateUser,
  onDeleteUser,
  permissions,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'audit'>('users');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('content_manager');
  const [newUserDept, setNewUserDept] = useState('Marketing & Communications');
  const [searchLog, setSearchLog] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    await onCreateUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserDept,
    });

    setIsInviteModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">Super Admin</span>;
      case 'content_manager':
        return <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">Content Manager</span>;
      case 'screen_operator':
        return <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">Screen Operator</span>;
      case 'viewer':
        return <span className="bg-zinc-700/40 text-zinc-300 border border-zinc-600/30 px-2 py-0.5 rounded text-[11px] font-semibold">Auditor / Viewer</span>;
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.details.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.userName.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              <span>Admin Panel & Role-Based Access Control (RBAC)</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Multi-user team management, granular permission matrices, and real-time security audit trails for network operators.
            </p>
          </div>

          {permissions.canManageUsers && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Team Operator</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
            activeTab === 'users' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
            activeTab === 'matrix' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
            activeTab === 'audit' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* 1. USERS DIRECTORY TAB */}
      {activeTab === 'users' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Operator Name</th>
                  <th className="px-5 py-3">Assigned Role</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Last Active</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[11px] text-zinc-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {permissions.canManageUsers ? (
                        <select
                          value={u.role}
                          onChange={e => onUpdateUserRole(u.id, e.target.value as UserRole)}
                          className="bg-zinc-950 border border-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="content_manager">Content Manager</option>
                          <option value="screen_operator">Screen Operator</option>
                          <option value="viewer">Auditor / Viewer</option>
                        </select>
                      ) : (
                        getRoleBadge(u.role)
                      )}
                    </td>
                    <td className="px-5 py-4 text-zinc-300">
                      {u.department}
                    </td>
                    <td className="px-5 py-4 text-zinc-400 font-mono text-[11px]">
                      {new Date(u.lastActive).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {permissions.canManageUsers && u.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove operator "${u.name}"?`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded transition"
                          title="Revoke User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PERMISSION MATRIX TAB */}
      {activeTab === 'matrix' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Role-Based Access Permissions Matrix</h3>
            <span className="text-xs text-zinc-400">Strictly enforced across API routes and client UI</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase font-semibold">
                  <th className="p-3">Platform Capability</th>
                  <th className="p-3 text-center">Super Admin</th>
                  <th className="p-3 text-center">Content Manager</th>
                  <th className="p-3 text-center">Screen Operator</th>
                  <th className="p-3 text-center">Auditor / Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr>
                  <td className="p-3 font-medium text-white">Enroll & Pair Screens, Remote Reboot / Reload</td>
                  <td className="p-3 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                  <td className="p-3 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">Upload Media Assets & Compose Playlists</td>
                  <td className="p-3 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  <td className="p-3 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">Publish Timeparting Content Schedules</td>
                  <td className="p-3 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  <td className="p-3 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">Dispatch High-Priority Emergency Broadcasts</td>
                  <td className="p-3 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                  <td className="p-3 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">User Administration & Role Assignment</td>
                  <td className="p-3 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                  <td className="p-3 text-center text-zinc-600">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. AUDIT TRAIL LOG TAB */}
      {activeTab === 'audit' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Security & Operational Audit Log</h3>
              <p className="text-xs text-zinc-400">Immutable ledger of administrative actions across the signage network.</p>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search audit actions..."
                value={searchLog}
                onChange={e => setSearchLog(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 w-60"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-start sm:items-center space-x-3">
                  <div className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-[10px] text-indigo-400 shrink-0">
                    LOG
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white font-mono text-[11px]">{log.action}</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-300 font-medium">{log.userName}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">({log.userRole})</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] mt-0.5">{log.details}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Enroll Team Operator</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-zinc-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="jordan.m@network.local"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. IT Operations, Corporate Comms"
                  value={newUserDept}
                  onChange={e => setNewUserDept(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Role Assignment</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="super_admin">Super Admin (Full Access)</option>
                  <option value="content_manager">Content Manager (Assets & Playlists)</option>
                  <option value="screen_operator">Screen Operator (Hardware & Pairing)</option>
                  <option value="viewer">Auditor / Viewer (Read-only)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
                >
                  Create Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
