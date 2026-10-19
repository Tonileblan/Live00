import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  Tracker,
  TrackerStreak,
  DailyPledge,
  DailyReview,
  MotivationAnchor,
  UrgeLog,
} from '../types/database.types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ensureUuid(id?: string | null): string {
  if (id && UUID_REGEX.test(id)) {
    return id;
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface CloudUserDataResult {
  hasData: boolean;
  trackers: Tracker[];
  streaks: TrackerStreak[];
  pledges: DailyPledge[];
  reviews: DailyReview[];
  anchors: MotivationAnchor[];
  urgeLogs: UrgeLog[];
}

export const syncService = {
  /**
   * Obtiene todos los datos asociados al usuario desde Supabase
   */
  async fetchCloudUserData(userId: string): Promise<CloudUserDataResult> {
    if (!isSupabaseConfigured || !userId) {
      return {
        hasData: false,
        trackers: [],
        streaks: [],
        pledges: [],
        reviews: [],
        anchors: [],
        urgeLogs: [],
      };
    }

    try {
      // 1. Cargar Trackers activos
      const { data: trackers, error: tErr } = await supabase
        .from('trackers')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (tErr) throw tErr;

      if (!trackers || trackers.length === 0) {
        return {
          hasData: false,
          trackers: [],
          streaks: [],
          pledges: [],
          reviews: [],
          anchors: [],
          urgeLogs: [],
        };
      }

      const trackerIds = trackers.map((t) => t.id);

      // 2. Cargar en paralelo rachas, compromisos, revisiones, anclas e impulsos
      const [streaksRes, pledgesRes, reviewsRes, anchorsRes, urgeRes] = await Promise.all([
        supabase.from('tracker_streaks').select('*').in('tracker_id', trackerIds),
        supabase.from('daily_pledges').select('*').eq('user_id', userId),
        supabase.from('daily_reviews').select('*').eq('user_id', userId),
        supabase
          .from('motivation_anchors')
          .select('*')
          .eq('user_id', userId)
          .order('display_order', { ascending: true }),
        supabase.from('urge_logs').select('*').eq('user_id', userId),
      ]);

      return {
        hasData: true,
        trackers: (trackers as Tracker[]) || [],
        streaks: (streaksRes.data as TrackerStreak[]) || [],
        pledges: (pledgesRes.data as DailyPledge[]) || [],
        reviews: (reviewsRes.data as DailyReview[]) || [],
        anchors: (anchorsRes.data as MotivationAnchor[]) || [],
        urgeLogs: (urgeRes.data as UrgeLog[]) || [],
      };
    } catch (err) {
      console.error('Error al descargar datos de Supabase:', err);
      return {
        hasData: false,
        trackers: [],
        streaks: [],
        pledges: [],
        reviews: [],
        anchors: [],
        urgeLogs: [],
      };
    }
  },

  /**
   * Sube todos los datos locales del usuario hacia Supabase asegurando UUIDs válidos
   */
  async uploadLocalDataToCloud(
    userId: string,
    data: {
      trackers: Tracker[];
      streaks: TrackerStreak[];
      pledges: DailyPledge[];
      reviews: DailyReview[];
      anchors: MotivationAnchor[];
      urgeLogs: UrgeLog[];
    }
  ): Promise<{
    trackers: Tracker[];
    streaks: TrackerStreak[];
    pledges: DailyPledge[];
    reviews: DailyReview[];
    anchors: MotivationAnchor[];
    urgeLogs: UrgeLog[];
  }> {
    if (!isSupabaseConfigured || !userId || data.trackers.length === 0) {
      return data;
    }

    try {
      // Mapeo de IDs anteriores a UUIDs de Postgres
      const trackerIdMap = new Map<string, string>();

      const normalizedTrackers = data.trackers.map((t) => {
        const validId = ensureUuid(t.id);
        trackerIdMap.set(t.id, validId);
        return {
          ...t,
          id: validId,
          user_id: userId,
          cost_per_day: Number(t.cost_per_day) || 10,
          time_spent_minutes_per_day: Number(t.time_spent_minutes_per_day) || 60,
          calories_per_day: Number(t.calories_per_day) || 500,
          is_active: t.is_active ?? true,
        };
      });

      // Upsert Trackers
      const { error: tErr } = await supabase.from('trackers').upsert(normalizedTrackers);
      if (tErr) console.warn('Error al subir trackers a Supabase:', tErr);

      // Normalizar Streaks
      const normalizedStreaks = data.streaks.map((s) => ({
        ...s,
        id: ensureUuid(s.id),
        tracker_id: trackerIdMap.get(s.tracker_id) || ensureUuid(s.tracker_id),
      }));
      if (normalizedStreaks.length > 0) {
        await supabase.from('tracker_streaks').upsert(normalizedStreaks);
      }

      // Normalizar Pledges
      const normalizedPledges = data.pledges.map((p) => ({
        ...p,
        id: ensureUuid(p.id),
        tracker_id: trackerIdMap.get(p.tracker_id) || ensureUuid(p.tracker_id),
        user_id: userId,
      }));
      if (normalizedPledges.length > 0) {
        await supabase
          .from('daily_pledges')
          .upsert(normalizedPledges, { onConflict: 'tracker_id,pledge_date' });
      }

      // Normalizar Reviews
      const normalizedReviews = data.reviews.map((r) => ({
        ...r,
        id: ensureUuid(r.id),
        tracker_id: trackerIdMap.get(r.tracker_id) || ensureUuid(r.tracker_id),
        user_id: userId,
      }));
      if (normalizedReviews.length > 0) {
        await supabase
          .from('daily_reviews')
          .upsert(normalizedReviews, { onConflict: 'tracker_id,review_date' });
      }

      // Normalizar Anchors
      const normalizedAnchors = data.anchors.map((a) => ({
        ...a,
        id: ensureUuid(a.id),
        tracker_id: trackerIdMap.get(a.tracker_id) || ensureUuid(a.tracker_id),
        user_id: userId,
      }));
      if (normalizedAnchors.length > 0) {
        await supabase.from('motivation_anchors').upsert(normalizedAnchors);
      }

      // Normalizar Urge Logs
      const normalizedUrgeLogs = data.urgeLogs.map((u) => ({
        ...u,
        id: ensureUuid(u.id),
        tracker_id: trackerIdMap.get(u.tracker_id) || ensureUuid(u.tracker_id),
        user_id: userId,
      }));
      if (normalizedUrgeLogs.length > 0) {
        await supabase.from('urge_logs').upsert(normalizedUrgeLogs);
      }

      return {
        trackers: normalizedTrackers,
        streaks: normalizedStreaks,
        pledges: normalizedPledges,
        reviews: normalizedReviews,
        anchors: normalizedAnchors,
        urgeLogs: normalizedUrgeLogs,
      };
    } catch (err) {
      console.error('Error durante la sincronización a la nube:', err);
      return data;
    }
  },

  /**
   * Sincroniza un tracker individual a Supabase
   */
  async syncTracker(tracker: Tracker): Promise<void> {
    if (!isSupabaseConfigured || !tracker.user_id) return;
    try {
      await supabase.from('trackers').upsert({
        ...tracker,
        id: ensureUuid(tracker.id),
        user_id: tracker.user_id,
        cost_per_day: Number(tracker.cost_per_day) || 10,
        time_spent_minutes_per_day: Number(tracker.time_spent_minutes_per_day) || 60,
        calories_per_day: Number(tracker.calories_per_day) || 500,
      });
    } catch (err) {
      console.warn('Error al sincronizar tracker individual:', err);
    }
  },

  /**
   * Sincroniza una racha individual a Supabase
   */
  async syncStreak(streak: TrackerStreak): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('tracker_streaks').upsert({
        ...streak,
        id: ensureUuid(streak.id),
        tracker_id: ensureUuid(streak.tracker_id),
      });
    } catch (err) {
      console.warn('Error al sincronizar racha individual:', err);
    }
  },

  /**
   * Sincroniza un compromiso matutino a Supabase
   */
  async syncPledge(pledge: DailyPledge): Promise<void> {
    if (!isSupabaseConfigured || !pledge.user_id) return;
    try {
      await supabase.from('daily_pledges').upsert({
        ...pledge,
        id: ensureUuid(pledge.id),
        tracker_id: ensureUuid(pledge.tracker_id),
        user_id: pledge.user_id,
      }, { onConflict: 'tracker_id,pledge_date' });
    } catch (err) {
      console.warn('Error al sincronizar compromiso:', err);
    }
  },

  /**
   * Sincroniza una evaluación nocturna a Supabase
   */
  async syncReview(review: DailyReview): Promise<void> {
    if (!isSupabaseConfigured || !review.user_id) return;
    try {
      await supabase.from('daily_reviews').upsert({
        ...review,
        id: ensureUuid(review.id),
        tracker_id: ensureUuid(review.tracker_id),
        user_id: review.user_id,
      }, { onConflict: 'tracker_id,review_date' });
    } catch (err) {
      console.warn('Error al sincronizar evaluación:', err);
    }
  },

  /**
   * Sincroniza un ancla motivacional a Supabase
   */
  async syncAnchor(anchor: MotivationAnchor): Promise<void> {
    if (!isSupabaseConfigured || !anchor.user_id) return;
    try {
      await supabase.from('motivation_anchors').upsert({
        ...anchor,
        id: ensureUuid(anchor.id),
        tracker_id: ensureUuid(anchor.tracker_id),
        user_id: anchor.user_id,
      });
    } catch (err) {
      console.warn('Error al sincronizar ancla motivacional:', err);
    }
  },

  /**
   * Elimina un ancla motivacional de Supabase
   */
  async deleteAnchor(anchorId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('motivation_anchors').delete().eq('id', anchorId);
    } catch (err) {
      console.warn('Error al eliminar ancla motivacional:', err);
    }
  },

  /**
   * Sincroniza un registro de impulso superado a Supabase
   */
  async syncUrgeLog(log: UrgeLog): Promise<void> {
    if (!isSupabaseConfigured || !log.user_id) return;
    try {
      await supabase.from('urge_logs').upsert({
        ...log,
        id: ensureUuid(log.id),
        tracker_id: ensureUuid(log.tracker_id),
        user_id: log.user_id,
      });
    } catch (err) {
      console.warn('Error al sincronizar impulso:', err);
    }
  },
};
