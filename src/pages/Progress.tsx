import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getWorkouts, getExerciseTemplates } from '@/db/api';
import type { Workout, ExerciseTemplate } from '@/types/types';
import { TrendingUp, Activity, Dumbbell } from 'lucide-react';

export default function Progress() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [workoutsData, templatesData] = await Promise.all([getWorkouts(100), getExerciseTemplates()]);
      setWorkouts(workoutsData);
      setTemplates(templatesData);
      if (workoutsData.length > 0) {
        setSelectedExercise(workoutsData[0].exercise_name);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exerciseWorkouts = workouts.filter((w) => w.exercise_name === selectedExercise);

  const progressData = exerciseWorkouts
    .map((w) => ({
      date: new Date(w.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
      weight: w.weight || 0,
      sets: w.sets,
      reps: w.reps || 0,
      totalVolume: (w.weight || 0) * w.sets * (w.reps || 1),
    }))
    .reverse();

  const maxWeight = Math.max(...progressData.map((d) => d.weight), 1);
  const maxVolume = Math.max(...progressData.map((d) => d.totalVolume), 1);

  const latestWorkout = exerciseWorkouts[0];
  const firstWorkout = exerciseWorkouts[exerciseWorkouts.length - 1];

  const weightImprovement = latestWorkout && firstWorkout ? latestWorkout.weight! - firstWorkout.weight! : 0;
  const setsImprovement = latestWorkout && firstWorkout ? latestWorkout.sets - firstWorkout.sets : 0;

  const uniqueExercises = Array.from(new Set(workouts.map((w) => w.exercise_name)));

  const WeightProgressChart = () => {
    if (progressData.length === 0) {
      return <p className="text-center text-muted-foreground py-8">لا توجد بيانات لعرضها</p>;
    }

    return (
      <div className="space-y-4">
        <div className="h-48 flex items-end justify-between gap-2">
          {progressData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full">
                <div
                  className="w-full bg-gradient-to-t from-primary to-primary-light rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(data.weight / maxWeight) * 160}px`, minHeight: '20px' }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap">
                    {data.weight > 0 ? `${data.weight}` : ''}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground mt-1 rotate-0 whitespace-nowrap">{data.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const VolumeProgressChart = () => {
    if (progressData.length === 0) {
      return <p className="text-center text-muted-foreground py-8">لا توجد بيانات لعرضها</p>;
    }

    return (
      <div className="space-y-4">
        <div className="h-48 flex items-end justify-between gap-2">
          {progressData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full">
                <div
                  className="w-full bg-gradient-to-t from-secondary to-secondary/70 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(data.totalVolume / maxVolume) * 160}px`, minHeight: '20px' }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-secondary whitespace-nowrap">
                    {data.totalVolume > 0 ? `${data.totalVolume.toFixed(0)}` : ''}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground mt-1">{data.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          معدلات التطور
        </h1>
        <p className="text-sm opacity-90">تابع تحسن أدائك</p>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              اختر التمرين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger>
                <SelectValue placeholder="اختر التمرين" />
              </SelectTrigger>
              <SelectContent>
                {uniqueExercises.map((exercise) => (
                  <SelectItem key={exercise} value={exercise}>
                    {exercise}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedExercise && exerciseWorkouts.length > 0 && (
          <>
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  التحسن الإجمالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">عدد المرات</p>
                    <p className="text-3xl font-bold text-primary">{exerciseWorkouts.length}</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">تحسن الوزن</p>
                    <p className="text-2xl font-bold text-secondary">
                      {weightImprovement > 0 ? '+' : ''}
                      {weightImprovement.toFixed(1)} كجم
                    </p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">آخر وزن</p>
                    <p className="text-2xl font-bold text-primary">{latestWorkout?.weight || 0} كجم</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">تحسن المجموعات</p>
                    <p className="text-2xl font-bold text-secondary">
                      {setsImprovement > 0 ? '+' : ''}
                      {setsImprovement}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تطور الوزن (كجم)</CardTitle>
              </CardHeader>
              <CardContent>
                <WeightProgressChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تطور الحجم التدريبي (كجم × مجموعات × تكرارات)</CardTitle>
              </CardHeader>
              <CardContent>
                <VolumeProgressChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>سجل التمارين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exerciseWorkouts.slice(0, 10).map((workout) => (
                    <div key={workout.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">
                          {new Date(workout.created_at).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(workout.created_at).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-primary font-medium">{workout.sets} مجموعات</span>
                        {workout.reps && <span>{workout.reps} تكرار</span>}
                        {workout.weight && <span className="text-secondary font-medium">{workout.weight} كجم</span>}
                      </div>
                      {workout.notes && (
                        <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{workout.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {selectedExercise && exerciseWorkouts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">لا توجد بيانات لهذا التمرين</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
