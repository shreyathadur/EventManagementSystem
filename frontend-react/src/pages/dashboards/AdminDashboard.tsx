import React, { useState, useEffect } from 'react';
import { statsService, approvalService, adminService } from '../../services/otherServices';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlaceIcon from '@mui/icons-material/Place';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssessmentIcon from '@mui/icons-material/Assessment';

const COLORS = ['#818cf8', '#38bdf8', '#34d399', '#facc15', '#f472b6', '#a78bfa'];

type TabType = 'overview' | 'approvals' | 'users';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [actionFeedback, setActionFeedback] = useState<{ id: string; msg: string } | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [statsData, approvalsData] = await Promise.all([
        statsService.getDashboard(),
        approvalService.getPending().catch(() => []),
      ]);
      setStats(statsData);
      setPendingApprovals(Array.isArray(approvalsData) ? approvalsData : []);
    } catch (err) { console.error(err); }
  };

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data.content || []);
    } catch (err) { console.error(err); }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'users' && users.length === 0) loadUsers();
  };

  const handleApprove = async (id: string) => {
    try {
      await approvalService.approve(id, 'Approved by admin');
      setActionFeedback({ id, msg: 'approved' });
      setPendingApprovals(prev => prev.filter(a => a.id !== id));
      setStats((prev: any) => ({ ...prev, pendingEvents: Math.max(0, (prev.pendingEvents || 1) - 1) }));
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id: string) => {
    try {
      await approvalService.reject(id, 'Rejected by admin');
      setActionFeedback({ id, msg: 'rejected' });
      setPendingApprovals(prev => prev.filter(a => a.id !== id));
      setStats((prev: any) => ({ ...prev, pendingEvents: Math.max(0, (prev.pendingEvents || 1) - 1) }));
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) { console.error(err); }
  };

  const categoryData = stats.categoryBreakdown
    ? Object.entries(stats.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const metrics = [
    { label: 'Total Events', value: stats.totalEvents || 0, icon: <EventIcon />, color: 'rgba(79, 70, 229, 0.15)', text: '#818cf8' },
    { label: 'Active Events', value: stats.activeEvents || 0, icon: <EventIcon />, color: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
    { label: 'Pending Approval', value: stats.pendingEvents || pendingApprovals.length || 0, icon: <PendingActionsIcon />, color: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
    { label: 'Total Users', value: stats.totalUsers || 0, icon: <PeopleIcon />, color: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa' },
    { label: 'Registrations', value: stats.totalRegistrations || 0, icon: <VerifiedUserIcon />, color: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
    { label: 'Venues', value: stats.totalVenues || 0, icon: <PlaceIcon />, color: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee' },
  ];

  const tabs: { id: TabType; label: string; badge?: number }[] = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'approvals', label: '⏳ Pending Approvals', badge: pendingApprovals.length },
    { id: 'users', label: '👥 Users' },
  ];

  return (
    <div className="animate-fade-up max-w-7xl mx-auto px-6 py-12">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Admin Control Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage the entire platform from here.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border" style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <AssessmentIcon sx={{ fontSize: 16 }} /> Global Administrator
        </div>
      </header>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {metrics.map((m, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem', background: m.color, border: `1px solid ${m.text}30` }}>
            <div style={{ color: m.text, marginBottom: '0.75rem' }}>{m.icon}</div>
            <h2 className="text-3xl font-bold mb-1">{m.value}</h2>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b" style={{ borderColor: 'var(--border-glass)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className="px-5 py-3 text-sm font-semibold transition-all relative flex items-center gap-2"
            style={{
              color: activeTab === tab.id ? '#818cf8' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid #818cf8' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.label}
            {tab.badge ? (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 className="text-xl font-bold mb-6 border-b pb-4" style={{ borderColor: 'var(--border-glass)' }}>Events by Category</h3>
            <div style={{ height: 280, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} />
                  <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 className="text-xl font-bold mb-6 border-b pb-4" style={{ borderColor: 'var(--border-glass)' }}>Category Distribution</h3>
            <div style={{ height: 280, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={5}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Pending Approvals */}
      {activeTab === 'approvals' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 className="text-xl font-bold mb-6 border-b pb-4" style={{ borderColor: 'var(--border-glass)' }}>
            Event Approval Queue
          </h3>

          {actionFeedback && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium" style={{ background: actionFeedback.msg === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${actionFeedback.msg === 'approved' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: actionFeedback.msg === 'approved' ? '#34d399' : '#f87171' }}>
              ✓ Event successfully {actionFeedback.msg}
            </div>
          )}

          {pendingApprovals.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircleIcon sx={{ fontSize: 64, color: '#334155', mb: 2 }} />
              <h3 className="text-xl font-medium mb-2">All clear!</h3>
              <p style={{ color: 'var(--text-muted)' }}>No events are pending approval right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingApprovals.map((approval: any) => (
                <div key={approval.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-xl" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <PendingActionsIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
                      <h4 className="font-bold">{approval.eventTitle || `Event #${approval.eventId}`}</h4>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Submitted by <strong className="text-white">{approval.organizerName || 'Organizer'}</strong> · {approval.requestedAt ? new Date(approval.requestedAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(approval.id)}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 16 }} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      <CancelIcon sx={{ fontSize: 16 }} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Users */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 className="text-xl font-bold mb-6 border-b pb-4" style={{ borderColor: 'var(--border-glass)' }}>
            Registered Users
          </h3>
          {users.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }} className="text-center py-12">Loading users...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    {['Name', 'Email', 'Role', 'Organization', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/2 transition-colors">
                      <td className="py-3 px-4 font-medium">{u.name}</td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.role === 'ROLE_ADMIN' ? 'bg-purple-500/20 text-purple-400' : u.role === 'ROLE_ORGANIZER' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                          {u.role?.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{u.organizationName || u.department || '—'}</td>
                      <td className="py-3 px-4">
                        <button className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium" onClick={() => adminService.deleteUser(u.id).then(loadUsers)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
