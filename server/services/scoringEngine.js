/**
 * Scoring Engine
 * points = (hours * 10) + streakBonus + consistencyBonus
 */
const calculatePoints = (hours, currentStreak) => {
  let basePoints = hours * 10;
  
  // Streak Bonus: 2 points per streak day (capped at 20)
  let streakBonus = Math.min(currentStreak * 2, 20);
  
  // Consistency Bonus: +10 if hours > 5 (deep work session)
  let consistencyBonus = hours >= 5 ? 10 : 0;
  
  return basePoints + streakBonus + consistencyBonus;
};

module.exports = { calculatePoints };
