import { supabase } from './supabase';
import type { Workout, ExerciseTemplate, WorkoutFormData } from '@/types/types';

// Get or create user ID from localStorage
export const getUserId = (): string => {
  let userId = localStorage.getItem('workout_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('workout_user_id', userId);
  }
  return userId;
};

// Workout operations
export const createWorkout = async (workoutData: WorkoutFormData): Promise<Workout | null> => {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: userId,
      ...workoutData,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating workout:', error);
    throw new Error('فشل في إضافة التمرين');
  }
  return data;
};

export const getWorkouts = async (limit = 50): Promise<Workout[]> => {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching workouts:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getWorkoutsByDateRange = async (startDate: string, endDate: string): Promise<Workout[]> => {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workouts by date range:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getWorkoutsByMuscleGroup = async (muscleGroup: string): Promise<Workout[]> => {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('muscle_group', muscleGroup)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workouts by muscle group:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const updateWorkout = async (id: string, updates: Partial<WorkoutFormData>): Promise<Workout | null> => {
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating workout:', error);
    throw new Error('فشل في تحديث التمرين');
  }
  return data;
};

export const deleteWorkout = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting workout:', error);
    throw new Error('فشل في حذف التمرين');
  }
};

// Exercise template operations
export const getExerciseTemplates = async (): Promise<ExerciseTemplate[]> => {
  const { data, error } = await supabase
    .from('exercise_templates')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching exercise templates:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getExerciseTemplatesByMuscleGroup = async (muscleGroup: string): Promise<ExerciseTemplate[]> => {
  const { data, error } = await supabase
    .from('exercise_templates')
    .select('*')
    .eq('muscle_group', muscleGroup)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching exercise templates by muscle group:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

// Statistics operations
export const getTodayWorkouts = async (): Promise<Workout[]> => {
  const userId = getUserId();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching today workouts:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getWeeklyWorkouts = async (): Promise<Workout[]> => {
  const userId = getUserId();
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', weekAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching weekly workouts:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const getMonthlyWorkouts = async (): Promise<Workout[]> => {
  const userId = getUserId();
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', monthAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching monthly workouts:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};
