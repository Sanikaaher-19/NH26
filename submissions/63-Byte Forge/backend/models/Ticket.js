const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  issueDescription: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'Other'
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  status: {
    type: String,
    enum: ['Open', 'Resolved'],
    default: 'Open'
  },
  transcript: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
