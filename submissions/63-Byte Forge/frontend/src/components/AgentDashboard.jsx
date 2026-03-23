import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Server, CheckCircle2, AlertTriangle, AlertCircle, Clock, Search, Filter } from 'lucide-react';

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    axios.get('http://localhost:5000/api/tickets')
      .then(res => {
        setTickets(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching tickets', err);
        setLoading(false);
      });

    // Socket configuration
    const socket = io('http://localhost:5000');
    
    socket.on('newTicket', (ticket) => {
      setTickets(prev => [ticket, ...prev]);
    });

    socket.on('ticketUpdated', (updatedTicket) => {
      setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
    });

    return () => socket.disconnect();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${id}/status`, { status: newStatus });
    } catch (error) {
       console.error("Failed to update ticket", error);
    }
  };

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'High': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 w-fit"><AlertCircle size={12}/> High</span>;
      case 'Medium': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Medium</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit"><Server size={12}/> Low</span>;
    }
  };

  const getStatusBadge = (status) => {
     if (status === 'Resolved') return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Resolved</span>;
     if (status === 'In Progress') return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1 w-fit"><Clock size={12}/> In Progress</span>;
     return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 flex items-center gap-1 w-fit"><Clock size={12}/> Open</span>;
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Agent Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage and resolve escalated tickets in real-time.</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 text-sm">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </span>
               <span className="font-medium text-slate-700">Live Connection Active</span>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
         {/* Toolbar */}
         <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input type="text" placeholder="Search tickets..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
               <Filter size={16} />
               Filter
            </button>
         </div>

         {/* Table */}
         <div className="overflow-auto flex-1">
            <table className="w-full text-left bg-white text-sm">
               <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 border-b border-slate-200">
                  <tr>
                     <th className="px-6 py-4 whitespace-nowrap">Ticket ID</th>
                     <th className="px-6 py-4">User</th>
                     <th className="px-6 py-4">Issue Description</th>
                     <th className="px-6 py-4 whitespace-nowrap">Category</th>
                     <th className="px-6 py-4 whitespace-nowrap">Severity</th>
                     <th className="px-6 py-4 whitespace-nowrap">Status</th>
                     <th className="px-6 py-4 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                     <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                           <Clock className="animate-spin" size={16} /> Loading tickets...
                        </td>
                     </tr>
                  ) : tickets.length === 0 ? (
                     <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                           No tickets available at the moment.
                        </td>
                     </tr>
                  ) : tickets.map((ticket) => (
                     <tr key={ticket._id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">#{ticket._id.substring(0, 8)}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{ticket.username}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={ticket.issueDescription}>
                           {ticket.issueDescription}
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                              {ticket.category}
                           </span>
                        </td>
                        <td className="px-6 py-4">{getSeverityBadge(ticket.severity)}</td>
                        <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                        <td className="px-6 py-4 text-right">
                           <select 
                              value={ticket.status} 
                              onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
                           >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                           </select>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
