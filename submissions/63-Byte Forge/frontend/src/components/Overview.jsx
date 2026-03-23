import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Ticket, Clock, CheckCircle2, Flame, User, AlertCircle } from 'lucide-react';

const Overview = () => {
  const [tickets, setTickets] = useState([]);
  const [agent, setAgent] = useState({ name: 'Agent', role: 'Technical System Admin' });

  useEffect(() => {
    fetchTickets();
    const data = localStorage.getItem('agent_auth');
    if (data) setAgent(JSON.parse(data));

    const socket = io('http://localhost:5000');
    socket.on('newTicket', ticket => setTickets(prev => [...prev, ticket]));
    socket.on('ticketUpdated', updatedTicket => setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t)));
    return () => socket.disconnect();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const highPriority = tickets.filter(t => t.severity === 'High' && t.status !== 'Resolved').length;
  const myAssigned = tickets.filter(t => t.assignedTo === agent.name && t.status !== 'Resolved').length;

  const buildMonthlyTrend = (items, monthsBack = 5) => {
    const now = new Date();
    const buckets = [];
    for (let i = monthsBack; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const name = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      buckets.push({ key, name, issues: 0, resolved: 0 });
    }
    const bucketMap = new Map(buckets.map(b => [b.key, b]));
    items.forEach(t => {
      const d = new Date(t.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = bucketMap.get(key);
      if (!bucket) return;
      bucket.issues += 1;
      if (t.status === 'Resolved') bucket.resolved += 1;
    });
    return buckets.map(({ key, ...rest }) => rest);
  };

  const trendData = buildMonthlyTrend(tickets, 5);

  const catCount = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(catCount).map(k => ({ name: k, value: catCount[k] }));
  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#64748b'];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
          <p className="text-sm text-slate-500">Welcome back, {agent.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="TOTAL" value={total} sub="All tickets" icon={<Ticket size={18} className="text-slate-400" />} />
        <KpiCard title="OPEN" value={open} sub="Needs action" icon={<AlertCircle size={18} className="text-slate-400" />} />
        <KpiCard title="IN PROGRESS" value={inProgress} sub="Being resolved" icon={<Clock size={18} className="text-slate-400" />} />
        <KpiCard title="RESOLVED" value={resolved} sub="Closed" icon={<CheckCircle2 size={18} className="text-slate-400" />} />
        <KpiCard title="HIGH PRIORITY" value={highPriority} sub="Urgent" icon={<Flame size={18} className="text-red-500" />} />
        <KpiCard title="MY ASSIGNED" value={myAssigned} sub="Your queue" icon={<User size={18} className="text-indigo-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Trend</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="issues" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">By Category</h3>
          <div className="h-48 w-full flex items-center justify-center relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData.length ? categoryData : [{ name: 'No data', value: 1 }]} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {categoryData.length ? categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )) : <Cell fill="#e2e8f0" />}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-800">{total}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Tickets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, sub, icon }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
    <div className="flex justify-between items-start mb-2">
      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{title}</p>
      <div className="bg-slate-50 p-1.5 rounded-lg">
        {icon}
      </div>
    </div>
    <p className="text-3xl font-extrabold text-slate-800 mb-1">{value || 0}</p>
    <p className="text-xs font-medium text-slate-400">{sub}</p>
  </div>
);

export default Overview;
