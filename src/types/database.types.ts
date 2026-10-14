export interface Profile {
  id: string;
  anonymous_alias: string;
  avatar_color: string;
  created_at: string;
}

export interface Tracker {
  id: string;
  user_id: string;
  category: string;
  habit_name: string;
  start_date: string; // ISO string
  cost_per_day: number;
  time_spent_minutes_per_day: number;
  calories_per_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrackerStreak {
  id: string;
  tracker_id: string;
  started_at: string;
  ended_at?: string | null;
  reset_reason?: string | null;
  triggers_noted?: string[] | null;
  created_at: string;
}

export interface DailyPledge {
  id: string;
  tracker_id: string;
  user_id: string;
  pledge_date: string; // YYYY-MM-DD
  pledged_at: string;
  created_at: string;
}

export interface DailyReview {
  id: string;
  tracker_id: string;
  user_id: string;
  review_date: string; // YYYY-MM-DD
  stayed_sober: boolean;
  difficulty_rating: number; // 1 - 5
  triggers: string[];
  notes?: string;
  created_at: string;
}

export interface MotivationAnchor {
  id: string;
  tracker_id: string;
  user_id: string;
  title: string;
  description?: string;
  image_url?: string;
  display_order: number;
  created_at: string;
}

export interface UrgeLog {
  id: string;
  tracker_id: string;
  user_id: string;
  intensity: number; // 1 - 10
  trigger_detected?: string;
  coping_tool_used: string;
  overcame_urge: boolean;
  created_at: string;
}

export interface MilestoneDefinition {
  id: string;
  category: string;
  target_seconds: number;
  title: string;
  biological_fact: string;
  badge_icon: string;
}

export interface CommunityPost {
  id: string;
  author_alias: string;
  cohort_bucket: 'day_1_to_7' | 'day_8_to_30' | 'day_31_to_90' | 'day_91_plus';
  sober_days_at_post: number;
  content: string;
  cheers_count: number;
  user_has_cheered?: boolean;
  created_at: string;
}

export type ClockViewMode = 'detailed' | 'hours' | 'seconds';

export interface MilestoneProgress {
  current: MilestoneDefinition | null;
  next: MilestoneDefinition | null;
  percentage: number;
  secondsRemaining: number;
}
