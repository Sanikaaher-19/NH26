import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, Bot, User, LogOut, AlertCircle, Clock } from 'lucide-react';

const ChatWidget = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Bot', text: 'Hi! I am your support assistant. How can I help today?', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const username = user?.username || 'Guest';
  const [isEscalating, setIsEscalating] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [awaitingFeedback, setAwaitingFeedback] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, ticketDetails, isEscalating, awaitingFeedback]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('ticketUpdated', (updatedTicket) => {
      setTicketDetails(prev => {
        if (prev && prev._id === updatedTicket._id) {
          setMessages(msgs => [...msgs, {
            id: Date.now() + Math.random(),
            sender: 'Bot',
            text: `Ticket #${updatedTicket._id.substring(0, 8)} status is now ${updatedTicket.status}.`,
            time: new Date(),
            isSystem: true
          }]);
          return updatedTicket;
        }
        return prev;
      });
    });
    return () => socket.disconnect();
  }, []);

  const executeChat = async (textToSend) => {
    if (!textToSend.trim()) return;
    const userMsg = { id: Date.now(), sender: username, text: textToSend, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAwaitingFeedback(false);
    setIsEscalating(true);

    try {
      const transcript = [...messages, userMsg].map(m => ({ sender: m.sender, text: m.text }));
      const response = await axios.post('http://localhost:5000/api/chat', { username, transcript });

      if (response.data.action === 'recommend') {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'Bot',
          text: response.data.message,
          time: new Date()
        }]);
        setAwaitingFeedback(true);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'Bot',
          text: 'Your issue was escalated. A support ticket has been created for you.',
          time: new Date()
        }]);
        setTicketDetails(response.data.ticket);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 2, sender: 'Bot', text: 'Something went wrong. Please try again.', time: new Date() }]);
    } finally {
      setIsEscalating(false);
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    executeChat(input);
  };

  const handleResolved = () => {
    setAwaitingFeedback(false);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 3,
        sender: 'Bot',
        text: 'Glad that solved it! If you need anything else, just message me.',
        time: new Date()
      }
    ]);
  };

  const handleEscalate = () => {
    executeChat('Resolution failed. Escalate.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Support Chat</h2>
          <p className="text-xs text-slate-500">Signed in as {username}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0">
        <main className="flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'Bot' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm shadow-sm border ${
                  msg.isSystem ? 'bg-blue-50 border-blue-100 text-blue-700' :
                  msg.sender === 'Bot' ? 'bg-white border-slate-200 text-slate-800' :
                  'bg-slate-900 border-slate-900 text-white'
                }`}>
                  <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold text-slate-400">
                    {msg.sender === 'Bot' ? <Bot size={12} /> : <User size={12} />}
                    <span>{msg.sender}</span>
                    <span className="ml-auto">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            ))}

            {awaitingFeedback && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full max-w-sm">
                  <p className="text-xs font-semibold text-slate-600 mb-3">Did the suggestion solve your problem?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResolved}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                    >
                      Yes, resolved
                    </button>
                    <button
                      onClick={handleEscalate}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold"
                    >
                      No, escalate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isEscalating && (
              <div className="text-xs text-slate-500">Working on your request...</div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={ticketDetails !== null || isEscalating}
                placeholder={ticketDetails ? 'Ticket active. An agent will follow up.' : 'Type your message...'}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              <button
                type="submit"
                disabled={!input.trim() || ticketDetails !== null || isEscalating}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </main>

        <aside className="border-l border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Ticket Status</h3>
          {ticketDetails ? (
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <p className="text-xs text-slate-500">Ticket ID</p>
                <p className="font-semibold">#{ticketDetails._id}</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500">Category</p>
                <p className="font-semibold">{ticketDetails.category}</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500">Severity</p>
                <p className="font-semibold">{ticketDetails.severity}</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 flex items-center gap-2">
                <Clock size={14} className="text-orange-500" />
                <div>
                  <p className="text-xs text-slate-500">SLA</p>
                  <p className="font-semibold">{ticketDetails.slaTimerHours} hours</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 flex items-center gap-2">
                <AlertCircle size={14} className="text-blue-500" />
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-semibold">{ticketDetails.status}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              No ticket yet. Chat with the assistant to get help. If needed, your issue will be escalated to a human agent.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ChatWidget;
