const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roomCode: { type: String, default: null },
  totalPoints: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String }, // YYYY-MM-DD
  momentum: { 
    type: String, 
    enum: ['Stable', 'Rising', 'On Fire', 'Dropping'], 
    default: 'Stable' 
  },
  avatarSeed: { type: String, default: () => Math.random().toString(36).substring(7) },
  weeklyTrophies: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
