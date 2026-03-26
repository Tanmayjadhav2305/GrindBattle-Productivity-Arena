/**
 * Momentum Engine
 * Determines status based on avg hours of last 3 logs
 */
const calculateMomentum = (last3Logs) => {
  if (!last3Logs || last3Logs.length < 2) return 'Stable';
  
  const avgHours = last3Logs.reduce((acc, log) => acc + log.hours, 0) / last3Logs.length;
  
  if (avgHours >= 6) return 'On Fire';
  if (avgHours >= 4) return 'Rising';
  if (avgHours <= 1.5) return 'Dropping';
  
  return 'Stable';
};

module.exports = { calculateMomentum };
