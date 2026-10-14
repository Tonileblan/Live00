import { useMemo } from 'react';
import { ALCOHOL_MILESTONES } from '../store/useTrackerStore';
import { MilestoneDefinition, MilestoneProgress } from '../types/database.types';

export function getMilestoneProgress(elapsedSeconds: number): MilestoneProgress {
  const nextIndex = ALCOHOL_MILESTONES.findIndex((m) => m.target_seconds > elapsedSeconds);

  if (nextIndex === -1) {
    const last = ALCOHOL_MILESTONES[ALCOHOL_MILESTONES.length - 1];
    return {
      current: last,
      next: null,
      percentage: 100,
      secondsRemaining: 0,
    };
  }

  const prevSeconds = nextIndex === 0 ? 0 : ALCOHOL_MILESTONES[nextIndex - 1].target_seconds;
  const nextMilestone = ALCOHOL_MILESTONES[nextIndex];

  // Cálculo relativo al tramo actual (no desde cero, para no desmotivar tras hitos largos)
  const segmentTotal = nextMilestone.target_seconds - prevSeconds;
  const segmentElapsed = elapsedSeconds - prevSeconds;
  const percentage = Math.min(100, Math.max(0, (segmentElapsed / segmentTotal) * 100));
  const secondsRemaining = Math.max(0, nextMilestone.target_seconds - elapsedSeconds);

  return {
    current: nextIndex === 0 ? null : (ALCOHOL_MILESTONES[nextIndex - 1] as MilestoneDefinition),
    next: nextMilestone as MilestoneDefinition,
    percentage: Number(percentage.toFixed(1)),
    secondsRemaining,
  };
}

export function useMilestoneEngine(elapsedSeconds: number) {
  return useMemo(() => {
    const progress = getMilestoneProgress(elapsedSeconds);
    const daysRemaining = Math.ceil(progress.secondsRemaining / 86400);

    return {
      ...progress,
      daysRemaining,
      allMilestones: ALCOHOL_MILESTONES,
    };
  }, [elapsedSeconds]);
}
