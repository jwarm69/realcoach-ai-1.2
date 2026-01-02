import { createClient } from '@/lib/supabase/server';

/**
 * Consistency Score System
 *
 * Gamified 5-contacts/day goal tracking with:
 * - Daily target tracking (5 contacts)
 * - Rolling 7-day average
 * - Streak tracking
 * - Zero-day penalties
 * - Visual feedback (green/yellow/red)
 *
 * Rating System:
 * - Excellent: 90%+ (on track to hit 5/day consistently)
 * - Good: 70-89% (mostly on track)
 * - Needs Improvement: 50-69% (inconsistent)
 * - Critical: <50% (significant effort needed)
 */

export interface ConsistencyScore {
  score: number;
  streak: number;
  last7Days: DayScore[];
  rating: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical';
  todayProgress: {
    completed: number;
    target: number;
    percentage: number;
  };
}

export interface DayScore {
  date: string;
  count: number;
  target: number;
  metTarget: boolean;
}

const DAILY_TARGET = 5;

/**
 * Calculate consistency score for a user
 */
export async function calculateConsistencyScore(userId: string): Promise<ConsistencyScore> {
  const supabase = await createClient();

  // Get last 7 days of activity
  const last7Days = getLast7DaysDates();

  // Get completed actions for each day (conversations logged with user's contacts)
  const dailyCounts = await Promise.all(
    last7Days.map(async (date) => {
      // First get all contact IDs for this user
      const { data: userContacts } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', userId);

      if (!userContacts || userContacts.length === 0) {
        return 0;
      }

      const contactIds = userContacts.map((c) => (c as { id: string }).id);

      // Then count conversations for those contacts on this date
      const { count, error } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .in('contact_id', contactIds)
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      if (error) {
        console.error(`Error fetching count for ${date}:`, error);
        return 0;
      }

      return count || 0;
    })
  );

  // Build day scores
  const dayScores: DayScore[] = last7Days.map((date, index) => ({
    date,
    count: dailyCounts[index] || 0,
    target: DAILY_TARGET,
    metTarget: (dailyCounts[index] || 0) >= DAILY_TARGET,
  }));

  // Calculate base score
  const totalContacts = dailyCounts.reduce((sum, count) => sum + count, 0);
  const targetTotal = DAILY_TARGET * 7;
  let score = Math.min((totalContacts / targetTotal) * 100, 100);

  // Calculate streak
  const streak = await calculateCurrentStreak(userId, last7Days);

  // Apply streak bonuses
  if (streak >= 7) score += 15;
  else if (streak >= 5) score += 10;
  else if (streak >= 3) score += 5;

  // Apply zero-day penalties
  const zeroDays = dailyCounts.filter((count) => count === 0).length;
  score -= zeroDays * 5;

  // Ensure score is between 0-100
  score = Math.max(Math.round(score), 0);

  // Determine rating
  const rating = getRating(score);

  // Get today's progress
  const todayProgress = await getTodayProgress(userId);

  return {
    score,
    streak,
    last7Days: dayScores,
    rating,
    todayProgress,
  };
}

/**
 * Calculate current streak (consecutive days meeting target)
 */
async function calculateCurrentStreak(
  userId: string,
  last7Days: string[]
): Promise<number> {
  const supabase = await createClient();
  let streak = 0;

  // Get all contact IDs for this user once
  const { data: userContacts } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', userId);

  if (!userContacts || userContacts.length === 0) {
    return 0;
  }

  const contactIds = userContacts.map((c) => (c as { id: string }).id);

  // Check backwards from today
  for (let i = 0; i < last7Days.length; i++) {
    const date = last7Days[i];

    const { count, error } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .in('contact_id', contactIds)
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`);

    if (error || !count || count < DAILY_TARGET) {
      break;
    }

    streak++;
  }

  return streak;
}

/**
 * Get today's progress toward daily target
 */
async function getTodayProgress(userId: string): Promise<{
  completed: number;
  target: number;
  percentage: number;
}> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Get all contact IDs for this user
  const { data: userContacts } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', userId);

  if (!userContacts || userContacts.length === 0) {
    return { completed: 0, target: DAILY_TARGET, percentage: 0 };
  }

  const contactIds = userContacts.map((c) => (c as { id: string }).id);

  const { count, error } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .in('contact_id', contactIds)
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`);

  const completed = error ? 0 : (count || 0);
  const percentage = Math.min(Math.round((completed / DAILY_TARGET) * 100), 100);

  return {
    completed,
    target: DAILY_TARGET,
    percentage,
  };
}

/**
 * Get rating category based on score
 */
function getRating(score: number): 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical' {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Critical';
}

/**
 * Get last 7 days of dates (including today)
 */
function getLast7DaysDates(): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Get color class for score display
 */
export function getConsistencyColor(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-50';
  if (score >= 70) return 'text-blue-600 bg-blue-50';
  if (score >= 50) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

/**
 * Get emoji for score display
 */
export function getConsistencyEmoji(score: number): string {
  if (score >= 90) return '🔥';
  if (score >= 70) return '💪';
  if (score >= 50) return '📈';
  return '⚠️';
}

/**
 * Get motivational message based on score
 */
export function getConsistencyMessage(score: number, streak: number): string {
  if (score >= 90) {
    return streak >= 7
      ? `Amazing! ${streak}-day streak and crushing it!`
      : "Excellent work! You're on fire!";
  }
  if (score >= 70) {
    return streak >= 3
      ? `Great consistency with a ${streak}-day streak!`
      : "Good progress! Keep up the momentum.";
  }
  if (score >= 50) {
    return "You're getting there. A bit more consistency and you'll be unstoppable!";
  }
  return "Every contact counts. Start your streak today!";
}

/**
 * Get recommended daily actions to improve consistency score
 */
export function getConsistencyRecommendations(score: number, streak: number): string[] {
  const recommendations: string[] = [];

  if (streak === 0) {
    recommendations.push('Start your streak today - contact just 5 people!');
  } else if (streak < 3) {
    recommendations.push(`You have a ${streak}-day streak. Keep it going to hit 3 days!`);
  } else if (streak < 7) {
    recommendations.push(`${streak}-day streak! Only ${7 - streak} more days to unlock the 7-day bonus!`);
  } else {
    recommendations.push(`Incredible ${streak}-day streak! Maintain this excellence.`);
  }

  if (score < 70) {
    recommendations.push('Focus on your top 5 priority contacts each day.');
    recommendations.push('Set a reminder to make your contacts at the same time daily.');
  }

  if (score < 50) {
    recommendations.push('Review your pipeline and identify your hottest leads.');
    recommendations.push('Consider blocking time on your calendar for contacts.');
  }

  return recommendations;
}
