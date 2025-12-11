import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getWeeklyWorkouts, getMonthlyWorkouts } from '@/db/api';
import type { Workout } from '@/types/types';
import { BarChart3, TrendingUp, Calendar, Dumbbell } from 'lucide-react';

export default function Reports() {
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<Workout[]>([]);
  const [monthlyWorkouts, setMonthlyWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [weekly, monthly] = await Promise.all([getWeeklyWorkouts(), getMonthlyWorkouts()]);
      setWeeklyWorkouts(weekly);
      setMonthlyWorkouts(monthly);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (workouts: Workout[]) => {
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce((sum, w) => sum + w.sets, 0);
    const totalWeight = workouts.reduce((sum, w) => sum + (w.weight || 0) * w.sets, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

    const muscleGroupCounts: Record<string, number> = {};
    workouts.forEach((w) => {
      muscleGroupCounts[w.muscle_group] = (muscleGroupCounts[w.muscle_group] || 0) + 1;
    });

    const sortedMuscleGroups = Object.entries(muscleGroupCounts).sort((a, b) => b[1] - a[1]);
    const mostFrequentMuscleGroup = sortedMuscleGroups[0]?.[0] || '-';

    const exerciseCounts: Record<string, number> = {};
    workouts.forEach((w) => {
      exerciseCounts[w.exercise_name] = (exerciseCounts[w.exercise_name] || 0) + 1;
    });

    const sortedExercises = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1]);
    const mostFrequentExercise = sortedExercises[0]?.[0] || '-';

    return {
      totalWorkouts,
      totalSets,
      totalWeight,
      totalCalories,
      mostFrequentMuscleGroup,
      mostFrequentExercise,
      muscleGroupDistribution: sortedMuscleGroups,
      exerciseDistribution: sortedExercises.slice(0, 5),
    };
  };

  const weeklyStats = calculateStats(weeklyWorkouts);
  const monthlyStats = calculateStats(monthlyWorkouts);

  const currentStats = activeTab === 'weekly' ? weeklyStats : monthlyStats;

  const MuscleGroupChart = ({ data }: { data: [string, number][] }) => {
    const maxCount = Math.max(...data.map((d) => d[1]), 1);

    return (
      <div className="space-y-3">
        {data.map(([group, count]) => (
          <div key={group} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{group}</span>
              <span className="text-muted-foreground">{count} تمرين</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ExerciseList = ({ data }: { data: [string, number][] }) => {
    return (
      <div className="space-y-2">
        {data.map(([exercise, count], index) => (
          <div key={exercise} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium">{exercise}</p>
              <p className="text-sm text-muted-foreground">{count} مرة</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          التقارير والإحصائيات
        </h1>
        <p className="text-sm opacity-90">تابع تقدمك وأدائك</p>
      </div>

      <div className="p-4 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              أسبوعي
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              شهري
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4 mt-4">
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  ملخص الأسبوع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">التمارين</p>
                    <p className="text-3xl font-bold text-primary">{weeklyStats.totalWorkouts}</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">المجموعات</p>
                    <p className="text-3xl font-bold text-primary">{weeklyStats.totalSets}</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">الوزن الكلي</p>
                    <p className="text-2xl font-bold text-secondary">{weeklyStats.totalWeight.toFixed(0)} كجم</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">السعرات</p>
                    <p className="text-2xl font-bold text-secondary">{weeklyStats.totalCalories.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4 mt-4">
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  ملخص الشهر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">التمارين</p>
                    <p className="text-3xl font-bold text-primary">{monthlyStats.totalWorkouts}</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">المجموعات</p>
                    <p className="text-3xl font-bold text-primary">{monthlyStats.totalSets}</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">الوزن الكلي</p>
                    <p className="text-2xl font-bold text-secondary">{monthlyStats.totalWeight.toFixed(0)} كجم</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">السعرات</p>
                    <p className="text-2xl font-bold text-secondary">{monthlyStats.totalCalories.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              الأكثر تمريناً
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">المجموعة العضلية</p>
                <p className="font-bold text-primary">{currentStats.mostFrequentMuscleGroup}</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">التمرين</p>
                <p className="font-bold text-secondary truncate">{currentStats.mostFrequentExercise}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع المجموعات العضلية</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStats.muscleGroupDistribution.length > 0 ? (
              <MuscleGroupChart data={currentStats.muscleGroupDistribution} />
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد بيانات لعرضها</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أكثر التمارين تكراراً</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStats.exerciseDistribution.length > 0 ? (
              <ExerciseList data={currentStats.exerciseDistribution} />
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد بيانات لعرضها</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
