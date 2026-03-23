import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket as TicketIcon, LineChart, Zap, LogOut, Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import clsx from 'clsx';

const AgentLayout = () => {
  const navigate = useNavigate();
  const [agent, setAgent] = React.useState({ name: 'Agent', role: 'Technical', initials: 'AG' });
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    const data = localStorage.getItem('agent_auth');
    if (data) setAgent(JSON.parse(data));

    const socket = io('http://localhost:5000');
    socket.on('newTicket', (ticket) => {
      const id = Date.now();
      setNotifications(prev => [{ id, ticket }, ...prev]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    });

    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agent_auth');
    navigate('/agent/login');
  };

  const navLinks = [
    { name: 'Overview', to: '/agent/overview', icon: LayoutDashboard },
    { name: 'All Tickets', to: '/agent/tickets', icon: TicketIcon },
    { name: 'Analytics', to: '/agent/analytics', icon: LineChart },
    { name: 'Auto Routing', to: '/agent/routing', icon: Zap },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              PD
            </div>
            <div>
              <div className="text-sm font-bold text-white">PowerDesk</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">Agent Portal</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold">
              {agent.initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{agent.name}</div>
              <div className="text-xs text-slate-400">{agent.role}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60'
              )}
            >
              <link.icon size={16} />
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Agent Dashboard</h1>
            <p className="text-xs text-slate-500">Real-time ticket operations</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="w-80 bg-white border border-slate-200 shadow-lg rounded-lg p-4 flex gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">New Ticket</div>
              <div className="text-xs text-slate-500">#{n.ticket._id}</div>
              <div className="text-sm text-slate-700 mt-1 line-clamp-2">
                {n.ticket.issueDescription}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentLayout;
