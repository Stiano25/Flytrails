/** True when nextDeparture is in the past (or now). Missing dates are not expired. */
export function isTripExpired(nextDeparture) {
  if (!nextDeparture) return false;
  return new Date(nextDeparture).getTime() <= Date.now();
}
