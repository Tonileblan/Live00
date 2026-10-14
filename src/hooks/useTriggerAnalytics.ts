import { useMemo } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';

export function useTriggerAnalytics() {
  const reviews = useTrackerStore((state) => state.reviews);
  const urgeLogs = useTrackerStore((state) => state.urgeLogs);

  return useMemo(() => {
    // 1. DOW Analysis (Day of Week Risk)
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dowDifficulty: { count: number; totalDifficulty: number; hardDays: number }[] = Array.from(
      { length: 7 },
      () => ({ count: 0, totalDifficulty: 0, hardDays: 0 })
    );

    reviews.forEach((rev) => {
      const d = new Date(rev.review_date);
      const dow = d.getDay();
      dowDifficulty[dow].count += 1;
      dowDifficulty[dow].totalDifficulty += rev.difficulty_rating;
      if (rev.difficulty_rating >= 4) {
        dowDifficulty[dow].hardDays += 1;
      }
    });

    let highestRiskDow = 5; // Default Friday
    let maxHardCount = -1;

    dowDifficulty.forEach((stat, index) => {
      if (stat.hardDays > maxHardCount && stat.count > 0) {
        maxHardCount = stat.hardDays;
        highestRiskDow = index;
      }
    });

    // 2. Frequency of Triggers
    const triggerCounts: Record<string, number> = {};

    reviews.forEach((rev) => {
      rev.triggers.forEach((t) => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
    });

    urgeLogs.forEach((log) => {
      if (log.trigger_detected) {
        triggerCounts[log.trigger_detected] = (triggerCounts[log.trigger_detected] || 0) + 1;
      }
    });

    const sortedTriggers = Object.entries(triggerCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const topTriggers = sortedTriggers.slice(0, 3);

    // Crisis superadas
    const totalUrgesOvercome = urgeLogs.filter((u) => u.overcame_urge).length;

    // Preventive Insight
    const riskDayName = dayNames[highestRiskDow];
    const preventiveAlert = `Tus registros indican que los ${riskDayName}s tu nivel de dificultad suele elevarse. Te recomendamos tener activas tus anclas motivacionales y un plan de respiración preparado.`;

    return {
      highestRiskDay: riskDayName,
      dowStats: dowDifficulty.map((stat, i) => ({
        day: dayNames[i],
        shortDay: dayNames[i].substring(0, 2),
        avgDifficulty: stat.count > 0 ? (stat.totalDifficulty / stat.count).toFixed(1) : '0.0',
        hardDays: stat.hardDays,
      })),
      topTriggers,
      totalUrgesOvercome,
      preventiveAlert,
    };
  }, [reviews, urgeLogs]);
}
