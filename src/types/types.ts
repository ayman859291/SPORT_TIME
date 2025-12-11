// Database types matching SQL schema

export interface Workout {
  id: string;
  user_id: string;
  exercise_name: string;
  muscle_group: string;
  sets: number;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  calories_burned: number | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscle_group: string;
  icon: string | null;
  default_sets: number;
  default_reps: number;
  default_rest_time: number;
  created_at: string;
}

// Form types for creating new workouts
export interface WorkoutFormData {
  exercise_name: string;
  muscle_group: string;
  sets: number;
  reps?: number;
  weight?: number;
  duration?: number;
  calories_burned?: number;
  notes?: string;
  image_url?: string;
}

// Statistics types
export interface WorkoutStats {
  totalWorkouts: number;
  totalSets: number;
  totalWeight: number;
  totalCalories: number;
  mostFrequentExercise: string;
  mostFrequentMuscleGroup: string;
}

export interface ProgressData {
  date: string;
  weight: number;
  sets: number;
}

export interface MuscleGroupStats {
  muscleGroup: string;
  count: number;
  percentage: number;
}
