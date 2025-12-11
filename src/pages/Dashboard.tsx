import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTodayWorkouts, getWeeklyWorkouts } from '@/db/api';
import type { Workout } from '@/types/types';
import { Dumbbell, TrendingUp, Flame, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([]);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [today, weekly] = await Promise.all([
        getTodayWorkouts(),
        getWeeklyWorkouts(),
      ]);
      setTodayWorkouts(today);
      setWeeklyWorkouts(weekly);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayStats = {
    totalSets: todayWorkouts.reduce((sum, w) => sum + w.sets, 0),
    totalWeight: todayWorkouts.reduce((sum, w) => sum + (w.weight || 0) * w.sets, 0),
    totalCalories: todayWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
    exerciseCount: todayWorkouts.length,
  };

  const weeklyStats = {
    totalWorkouts: weeklyWorkouts.length,
    totalSets: weeklyWorkouts.reduce((sum, w) => sum + w.sets, 0),
    totalWeight: weeklyWorkouts.reduce((sum, w) => sum + (w.weight || 0) * w.sets, 0),
    totalCalories: weeklyWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2">وقت الرياضة</h1>
        <p className="text-sm opacity-90">تابع تقدمك وحقق أهدافك</p>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            إحصائيات اليوم
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-card border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  التمارين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{todayStats.exerciseCount}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  المجموعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{todayStats.totalSets}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-secondary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  الوزن الكلي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-secondary">{todayStats.totalWeight.toFixed(0)} كجم</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-secondary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  السعرات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-secondary">{todayStats.totalCalories.toFixed(0)}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              إحصائيات الأسبوع
            </h2>
          </div>
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">التمارين</p>
                  <p className="text-3xl font-bold text-primary">{weeklyStats.totalWorkouts}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">المجموعات</p>
                  <p className="text-3xl font-bold text-primary">{weeklyStats.totalSets}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">الوزن الكلي</p>
                  <p className="text-2xl font-bold text-secondary">{weeklyStats.totalWeight.toFixed(0)} كجم</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">السعرات</p>
                  <p className="text-2xl font-bold text-secondary">{weeklyStats.totalCalories.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">تمارين اليوم</h2>
            <Link to="/add-workout">
              <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                إضافة تمرين
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : todayWorkouts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">لم تسجل أي تمارين اليوم</p>
                <Link to="/add-workout">
                  <Button className="bg-primary hover:bg-primary/90">
                    ابدأ التمرين الآن
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayWorkouts.map((workout) => (
                <Card key={workout.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {workout.image_url && (
                      <img
                        src={workout.image_url}
                        alt={workout.exercise_name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{workout.exercise_name}</h3>
                        <p className="text-sm text-muted-foreground">{workout.muscle_group}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(workout.created_at)}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-primary font-medium">{workout.sets} مجموعات</span>
                      {workout.reps && <span>{workout.reps} تكرار</span>}
                      {workout.weight && <span className="text-secondary font-medium">{workout.weight} كجم</span>}
                    </div>
                    {workout.notes && (
                      <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{workout.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
