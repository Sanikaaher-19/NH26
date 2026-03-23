import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatWidget from './components/ChatWidget';
import UserAuth from './components/UserAuth';
import AgentLogin from './components/AgentLogin';
import AgentLayout from './components/AgentLayout';

// Agent Pages
import Overview from './components/Overview';
import AllTickets from './components/AllTickets';
import Analytics from './components/Analytics';
import AutoRouting from './components/AutoRouting';

// Protected Route wrappers
const AgentProtectedRoute = ({ children }) => {
  const agentAuth = localStorage.getItem('agent_auth');
  return agentAuth ? children : <Navigate to="/agent/login" replace />;
};

function App() {
  const [user, setUser] = useState(null);

  // Load user from localstorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('hackathon_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleUserLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('hackathon_user', JSON.stringify(userData));
  };

  const handleUserLogout = () => {
    setUser(null);
    localStorage.removeItem('hackathon_user');
  };

  return (
    <Router>
      <div className="min-h-screen font-sans text-slate-900">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={
            !user ? <UserAuth onLogin={handleUserLogin} /> : <ChatWidget user={user} onLogout={handleUserLogout} />
          } />

          {/* Agent Login */}
          <Route path="/agent/login" element={<AgentLogin />} />

          {/* Agent Dashboard Sub-routes */}
          <Route path="/agent" element={
            <AgentProtectedRoute>
              <AgentLayout />
            </AgentProtectedRoute>
          }>
            {/* Redirect /agent to /agent/overview */}
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="tickets" element={<AllTickets />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="routing" element={<AutoRouting />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
