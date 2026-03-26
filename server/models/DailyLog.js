const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  hours: { type: Number, default: 0 },
  tasks: [{ type: String }],
  category: { type: String },
  pointsEarned: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure one log per user per day
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
