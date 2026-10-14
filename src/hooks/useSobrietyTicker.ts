import { useState, useEffect, useMemo } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';

export interface FormattedTime {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: string;
  totalSeconds: number;
  elapsedSeconds: number;
}

export function useSobrietyTicker() {
  const activeTrackerId = useTrackerStore((state) => state.activeTrackerId);
  const trackers = useTrackerStore((state) => state.trackers);
  const activeTracker = trackers.find((t) => t.id === activeTrackerId);

  const startDateTimestamp = useMemo(() => {
    if (!activeTracker?.start_date) return Date.now();
    return new Date(activeTracker.start_date).getTime();
  }, [activeTracker?.start_date]);

  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    let animationFrameId: number;
    let lastTick = 0;

    const tick = (time: number) => {
      if (time - lastTick >= 1000) {
        setNow(Date.now());
        lastTick = time;
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    // Sync on tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setNow(Date.now());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const elapsedSeconds = Math.max(0, Math.floor((now - startDateTimestamp) / 1000));

  const timeFormatted: FormattedTime = useMemo(() => {
    const totalDays = Math.floor(elapsedSeconds / 86400);
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    const hours = Math.floor((elapsedSeconds % 86400) / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    const totalHours = (elapsedSeconds / 3600).toFixed(1);

    return {
      months,
      days,
      hours,
      minutes,
      seconds,
      totalHours,
      totalSeconds: elapsedSeconds,
      elapsedSeconds,
    };
  }, [elapsedSeconds]);

  // Savings metrics
  const savings = useMemo(() => {
    if (!activeTracker) return { money: 0, calories: 0, hoursGained: 0 };
    const daysElapsed = elapsedSeconds / 86400;
    const money = Number((daysElapsed * activeTracker.cost_per_day).toFixed(2));
    const calories = Math.round(daysElapsed * activeTracker.calories_per_day);
    const hoursGained = Math.round((daysElapsed * activeTracker.time_spent_minutes_per_day) / 60);

    return {
      money,
      calories,
      hoursGained,
    };
  }, [elapsedSeconds, activeTracker]);

  return {
    activeTracker,
    elapsedSeconds,
    time: timeFormatted,
    savings,
  };
}
