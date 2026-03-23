import { useState, useEffect } from 'react';

function getRemaining(target) {
  const now = new Date().getTime();
  const end = new Date(target).getTime();
  const diff = Math.max(0, end - now);
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, expired: diff <= 0 };
}

/** Counts down to ISO date string `nextDeparture` */
export default function useCountdown(nextDeparture) {
  const [state, setState] = useState(() => getRemaining(nextDeparture));

  useEffect(() => {
    const id = setInterval(() => {
      setState(getRemaining(nextDeparture));
    }, 1000);
    return () => clearInterval(id);
  }, [nextDeparture]);

  return state;
}
