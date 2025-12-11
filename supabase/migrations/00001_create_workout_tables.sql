/*
# Create Workout Tracking Tables

## 1. New Tables

### `workouts` table
- `id` (uuid, primary key, default: gen_random_uuid())
- `user_id` (uuid, not null) - Anonymous user identifier stored in localStorage
- `exercise_name` (text, not null) - Name of the exercise
- `muscle_group` (text, not null) - Target muscle group
- `sets` (integer, not null) - Number of sets performed
- `reps` (integer) - Number of repetitions per set
- `weight` (numeric) - Weight used in kg
- `duration` (integer) - Duration in minutes
- `calories_burned` (numeric) - Estimated calories burned
- `notes` (text) - User notes about the workout
- `created_at` (timestamptz, default: now())

### `exercise_templates` table
- `id` (uuid, primary key, default: gen_random_uuid())
- `name` (text, not null, unique) - Exercise name
- `muscle_group` (text, not null) - Target muscle group
- `icon` (text) - Icon identifier
- `default_sets` (integer, default: 3) - Default number of sets
- `default_reps` (integer, default: 10) - Default number of reps
- `default_rest_time` (integer, default: 60) - Default rest time in seconds
- `created_at` (timestamptz, default: now())

## 2. Security
- No RLS enabled - public access for all users
- All users can read and write their own workout data based on user_id
- Exercise templates are publicly readable

## 3. Initial Data
- Pre-populated exercise templates with common exercises for different muscle groups

## 4. Notes
- Using UUID-based anonymous user identification
- No authentication required
- Data persists across sessions using localStorage user_id
*/

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_name text NOT NULL,
  muscle_group text NOT NULL,
  sets integer NOT NULL,
  reps integer,
  weight numeric,
  duration integer,
  calories_burned numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries by user_id and date
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_created_at ON workouts(created_at DESC);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, created_at DESC);

-- Create exercise_templates table
CREATE TABLE IF NOT EXISTS exercise_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  muscle_group text NOT NULL,
  icon text,
  default_sets integer DEFAULT 3,
  default_reps integer DEFAULT 10,
  default_rest_time integer DEFAULT 60,
  created_at timestamptz DEFAULT now()
);

-- Insert initial exercise templates
INSERT INTO exercise_templates (name, muscle_group, icon, default_sets, default_reps, default_rest_time) VALUES
  ('ضغط البنش', 'صدر', 'dumbbell', 4, 10, 90),
  ('تفتيح دمبل', 'صدر', 'dumbbell', 3, 12, 60),
  ('ضغط علوي', 'أكتاف', 'dumbbell', 4, 10, 90),
  ('رفرفة جانبي', 'أكتاف', 'dumbbell', 3, 15, 45),
  ('سحب أمامي', 'ظهر', 'dumbbell', 4, 10, 90),
  ('سحب أرضي', 'ظهر', 'dumbbell', 4, 8, 120),
  ('باي بار', 'باي', 'dumbbell', 3, 12, 60),
  ('باي دمبل', 'باي', 'dumbbell', 3, 12, 60),
  ('تراي بار', 'تراي', 'dumbbell', 3, 12, 60),
  ('تراي كابل', 'تراي', 'dumbbell', 3, 15, 45),
  ('سكوات', 'أرجل', 'dumbbell', 4, 10, 120),
  ('ليج برس', 'أرجل', 'dumbbell', 4, 12, 90),
  ('ليج كيرل', 'أرجل', 'dumbbell', 3, 15, 60),
  ('سمانة واقف', 'أرجل', 'dumbbell', 4, 20, 45),
  ('بطن علوي', 'بطن', 'dumbbell', 3, 20, 30),
  ('بطن سفلي', 'بطن', 'dumbbell', 3, 20, 30),
  ('بلانك', 'بطن', 'dumbbell', 3, 60, 30),
  ('جري', 'كارديو', 'dumbbell', 1, 0, 0),
  ('دراجة', 'كارديو', 'dumbbell', 1, 0, 0),
  ('حبل القفز', 'كارديو', 'dumbbell', 3, 100, 60)
ON CONFLICT (name) DO NOTHING;