require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// Gemini Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

let tickets = [];
let ticketCounter = 101;

app.post('/api/chat', async (req, res) => {
  const { username, transcript } = req.body;
  const chatHistory = transcript.map(msg => `${msg.sender}: ${msg.text}`).join('\n');

  const prompt = `
    Analyze this support chat. 
    1. Try to give a 'recommendation' first.
    2. If the user is frustrated or asks for a human, set action to 'escalate'.
    3. Categorize into: Outage, Billing, Meter, or General.
    4. Set severity: Low, Medium, High.
    
    Return JSON ONLY:
    {
      "action": "recommend" | "escalate",
      "recommendation": "string",
      "category": "string",
      "severity": "Low" | "Medium" | "High",
      "issueDescription": "short summary"
    }`;

  try {
    const result = await model.generateContent(prompt + "\n\nTranscript:\n" + chatHistory);
    const aiData = JSON.parse(result.response.text());

    if (aiData.action === 'recommend') {
      return res.json({ action: 'recommend', message: aiData.recommendation });
    }

    // --- Automated Routing Logic ---
    const routingMap = { 'Outage': 'Dev Kumar', 'Billing': 'Rahul Agarwal', 'Meter': 'Rahul Agarwal', 'General': 'Priya Sharma' };

    const newTicket = {
      id: `TKT-${ticketCounter++}`,
      user: username || 'Guest',
      description: aiData.issueDescription,
      category: aiData.category,
      severity: aiData.severity,
      assignedTo: routingMap[aiData.category] || 'Priya Sharma',
      status: 'Open',
      createdAt: new Date().toLocaleTimeString()
    };

    tickets.unshift(newTicket);
    io.emit('newTicket', newTicket); // Real-time push to Agent UI

    res.json({ action: 'escalate', message: 'Connecting to agent...', ticket: newTicket });
  } catch (error) {
    res.status(500).json({ error: "AI Error", details: error.message });
  }
});

app.get('/api/tickets', (req, res) => res.json(tickets));

server.listen(5000, () => console.log('🚀 Server spinning on port 5000'));