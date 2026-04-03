/**
 * TimeSystem.js — Helper to convert level phase and progress into a 24-hour clock.
 * 
 * Game Timeline:
 * - Level 1 (Day/Evening): 6:00 PM -> 9:00 PM
 * - Level 2 (Dusk): 9:00 PM -> 12:00 AM
 * - Level 3 (Night): 12:00 AM -> 6:00 AM (Escape at Dawn)
 */

export const formatInGameTime = (phase, progress) => {
  let startHour, endHour;
  
  // Phase mapping to hour blocks
  if (phase === 'day') {
    startHour = 18; // 6:00 PM
    endHour = 21;   // 9:00 PM
  } else if (phase === 'dusk') {
    startHour = 21; // 9:00 PM
    endHour = 24;   // 12:00 AM
  } else {
    startHour = 0;  // 12:00 AM
    endHour = 6;    // 6:00 AM
  }

  // Calculate duration in hours
  const duration = endHour - startHour; // always positive in this specific mapping
  const totalMinutes = duration * 60;
  const currentMinutes = (progress / 100) * totalMinutes;
  
  let h = (startHour + Math.floor(currentMinutes / 60)) % 24;
  let m = Math.floor(currentMinutes % 60);
  
  const ampm = (h >= 12 && h < 24) ? 'PM' : 'AM';
  let displayH = h % 12;
  if (displayH === 0) displayH = 12;
  
  const minuteStr = m < 10 ? `0${m}` : `${m}`;
  
  return `${displayH}:${minuteStr} ${ampm}`;
};
