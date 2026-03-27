import React from 'react';
import { 
  User, 
  ShieldCheck, 
  ShieldAlert,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Calendar,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminService } from '../services/adminService';

export const Users = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRole, setFilterRole] = React.useState('all');

  React.useEffect(() => {
    const unsubscribe = adminService.getUsers(
      (data) => {
        setUsers(data);
        setIsLoading(false);
      },
      (err) => {
        console.error('Failed to load users:', err);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (uid: string, newRole: string) => {
    try {
      await adminService.updateUserRole(uid, newRole);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update user role. You may not have permission.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Team</h1>
          <p className="text-zinc-400 mt-1">Manage administrative access and user roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:border-black outline-none transition-all w-64"
            />
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:border-black outline-none transition-all"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-zinc-100 p-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <div className="w-8 h-8 border-4 border-zinc-100 border-t-black rounded-full animate-spin" />
              <p className="text-sm font-bold uppercase tracking-widest">Loading Team...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
              <User className="mx-auto text-zinc-200 mb-4" size={48} />
              <h3 className="text-lg font-bold">No users found</h3>
              <p className="text-zinc-400 text-sm mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">User</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Role</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Joined</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User size={18} className="text-zinc-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{user.displayName || 'Anonymous'}</p>
                            <p className="text-xs text-zinc-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-black text-white' 
                            : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {user.role === 'admin' ? <ShieldCheck size={10} /> : <User size={10} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Calendar size={14} />
                          <span className="text-xs font-medium">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {user.role === 'admin' ? (
                            <button 
                              onClick={() => handleUpdateRole(user.id, 'user')}
                              className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            >
                              Demote
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateRole(user.id, 'admin')}
                              className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                            >
                              Promote
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-black text-white rounded-2xl p-6 shadow-xl shadow-black/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={20} />
              Access Control
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Administrative roles grant full access to the Vionne dashboard, including product management, order processing, and store settings.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="p-2 bg-white/10 rounded-lg">
                  <ShieldCheck size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">Admin Role</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Full system access and user management.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="p-2 bg-white/10 rounded-lg">
                  <User size={16} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">User Role</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Restricted access. Cannot access admin panel.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-zinc-400" />
              Invite New Admin
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Ask your team member to sign up at the login page. Once they have an account, you can promote them to Admin here.
            </p>
            <button 
              onClick={() => {
                const url = `${window.location.origin}/admin/login`;
                navigator.clipboard.writeText(url);
                alert('Login URL copied to clipboard! Share this with your team.');
              }}
              className="w-full py-3 bg-zinc-50 text-zinc-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors border border-zinc-100"
            >
              Copy Login URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
