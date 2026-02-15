/**
 * Spaced repetition scheduling for revision items.
 * Simple: +1d, +3d, +7d, +14d, +30d by revision count.
 * Adaptive: Easy → jump forward, Okay → normal, Hard → shorten (e.g. tomorrow).
 */

const SIMPLE_INTERVALS_DAYS = [1, 3, 7, 14, 30];

export function getNextDueSimple(revisionCount) {
  const index = Math.min(revisionCount, SIMPLE_INTERVALS_DAYS.length - 1);
  const days = SIMPLE_INTERVALS_DAYS[index];
  const next = new Date();
  next.setDate(next.getDate() + days);
  next.setHours(23, 59, 59, 999);
  return next;
}

/**
 * Adaptive: Easy = next bigger interval, Okay = same step, Hard = +1 day.
 * revisionCount is the count BEFORE this session (so after session it becomes revisionCount + 1).
 */
export function getNextDueAdaptive(revisionCount, rating) {
  const fromToday = new Date();
  fromToday.setHours(0, 0, 0, 0);

  if (rating === "hard") {
    const next = new Date(fromToday);
    next.setDate(next.getDate() + 1);
    next.setHours(23, 59, 59, 999);
    return next;
  }

  if (rating === "okay") {
    return getNextDueSimple(revisionCount);
  }

  // easy: jump to next bigger interval (as if we did one more revision)
  return getNextDueSimple(revisionCount + 1);
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Snooze: move next due by 1d, 3d, or 7d from today (or from current nextDue if later). */
export function snoozeNextDue(currentNextDue, option) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const base = currentNextDue && new Date(currentNextDue) > today ? new Date(currentNextDue) : today;
  const days = option === "1d" ? 1 : option === "3d" ? 3 : 7;
  const next = addDays(base, days);
  next.setHours(23, 59, 59, 999);
  return next;
}
