import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Ticket, Flame, AlertTriangle, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const AllTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [sevFilter, setSevFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchTickets();
    const socket = io('http://localhost:5000');

    socket.on('newTicket', (ticket) => {
      setTickets(prev => [ticket, ...prev]);
    });

    socket.on('ticketUpdated', (updatedTicket) => {
      setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
    });

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (sevFilter !== 'All' && t.severity !== sevFilter) return false;
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    return true;
  });

  const selectedTicket = tickets.find(t => t._id === selectedTicketId);

  return (
    <div className="h-[calc(100vh-180px)] flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Left Pane - Ticket List */}
      <div className="w-[380px] border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Ticket size={16} className="text-blue-500" />
            All Tickets ({filteredTickets.length})
          </h2>

          <div className="space-y-3">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['All', 'High', 'Medium', 'Low'].map(f => (
                <button
                  key={f}
                  onClick={() => setSevFilter(f)}
                  className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${sevFilter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${statusFilter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTickets.map(ticket => (
            <div
              key={ticket._id}
              onClick={() => setSelectedTicketId(ticket._id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-colors relative ${selectedTicketId === ticket._id ? 'bg-blue-50/50 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500' : 'hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-slate-400">{ticket._id}</span>
                <span className="text-[10px] text-slate-400 font-medium">{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>

              <h3 className="text-sm font-semibold text-slate-800 leading-tight mb-3 line-clamp-2">
                {ticket.issueDescription}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${ticket.severity === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : ticket.severity === 'Medium' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {ticket.severity === 'High' && <Flame size={12} />}
                  {ticket.severity === 'Medium' && <AlertTriangle size={12} />}
                  {ticket.severity === 'Low' && <CheckCircle2 size={12} />}
                  {ticket.severity}
                </span>

                <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                  <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-500' : ticket.status === 'In Progress' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                  {ticket.status}
                </span>
              </div>

              {ticket.status !== 'Resolved' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">SLA</span>
                    <span className={ticket.slaTimerHours < 5 ? 'text-red-500' : 'text-orange-500'}>{ticket.slaTimerHours}h 00m left</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${ticket.slaTimerHours < 5 ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: '40%' }}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">
              No tickets match these filters.
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Details */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center relative">
        {!selectedTicket ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Ticket className="text-slate-500" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Select a ticket</h3>
            <p className="text-sm text-slate-500">Click a ticket to view details.</p>
          </div>
        ) : (
          <div className="absolute inset-0 bg-white flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-800">#{selectedTicket._id}</h2>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200">
                    {selectedTicket.category}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Reported by <span className="text-blue-600 font-semibold">{selectedTicket.username}</span> on {new Date(selectedTicket.createdAt).toLocaleString()}</p>
              </div>
              <select
                value={selectedTicket.status}
                onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertCircle size={14} /> Ticket Summary
                </h4>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {selectedTicket.issueDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SLA Deadline</p>
                  <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Clock size={18} className="text-orange-500" />
                    {selectedTicket.slaTimerHours} Hours
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">AI Diagnostic Transcript</h4>
                <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                  {selectedTicket.transcript.split('\n').map((line, i) => (
                    <div key={i} className="mb-2 opacity-90">{line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTickets;
