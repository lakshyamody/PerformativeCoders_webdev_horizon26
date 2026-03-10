import React, { useState, useEffect } from 'react';
import { UserPlus, MoreVertical, Trash2, Mail, ShieldAlert } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      const newUser = await apiClient.inviteUser({ email: inviteEmail, role: inviteRole });
      setUsers([...users, newUser]);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('Viewer');
    } catch (err) {
      console.error('Failed to invite user', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Team Management</h2>
          <p className="text-gray-400 text-sm">Manage who has access to the OpsPulse dashboard.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium text-sm shadow-sm shadow-indigo-500/20"
        >
          <UserPlus size={18} />
          Invite User
        </button>
      </div>

      <div className="bg-[#1a2236] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#1a2236]/50">
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-medium text-indigo-400">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-200">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        user.role === 'Analyst' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {user.lastActive}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Remove user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a2236] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Invite New User</h3>
            <form onSubmit={handleInvite}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="colleague@company.com"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Role / Permissions</label>
                <div className="relative">
                  <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6366f1] hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-500/20"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
