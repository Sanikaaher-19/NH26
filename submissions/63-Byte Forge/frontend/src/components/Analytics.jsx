import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const Analytics = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
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
  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

  const sevData = [
    { name: 'High', count: tickets.filter(t => t.severity === 'High').length, fill: '#ef4444' },
    { name: 'Medium', count: tickets.filter(t => t.severity === 'Medium').length, fill: '#f59e0b' },
    { name: 'Low', count: tickets.filter(t => t.severity === 'Low').length, fill: '#22c55e' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500">Operational insights from live tickets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Volume Trend (6 months)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="issues" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Category Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData.length ? categoryData : [{ name: 'Empty', value: 1 }]} innerRadius={0} outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.length ? categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )) : <Cell fill="#f1f5f9" />}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Severity Breakdown</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer>
            <BarChart data={sevData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                {sevData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
