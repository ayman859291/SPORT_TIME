import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getWorkouts, deleteWorkout } from '@/db/api';
import type { Workout } from '@/types/types';
import { History as HistoryIcon, Trash2, Dumbbell, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const muscleGroups = ['الكل', 'صدر', 'ظهر', 'أكتاف', 'باي', 'تراي', 'أرجل', 'بطن', 'كارديو'];

export default function History() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('الكل');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    filterWorkouts();
  }, [workouts, selectedMuscleGroup]);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const data = await getWorkouts(100);
      setWorkouts(data);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWorkouts = () => {
    if (selectedMuscleGroup === 'الكل') {
      setFilteredWorkouts(workouts);
    } else {
      setFilteredWorkouts(workouts.filter((w) => w.muscle_group === selectedMuscleGroup));
    }
  };

  const handleDeleteClick = (id: string) => {
    setWorkoutToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workoutToDelete) return;

    try {
      await deleteWorkout(workoutToDelete);
      setWorkouts(workouts.filter((w) => w.id !== workoutToDelete));
      toast({
        title: 'تم الحذف',
        description: 'تم حذف التمرين بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في حذف التمرين',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setWorkoutToDelete(null);
    }
  };

  const groupWorkoutsByDate = (workouts: Workout[]) => {
    const grouped: Record<string, Workout[]> = {};
    workouts.forEach((workout) => {
      const date = new Date(workout.created_at).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(workout);
    });
    return grouped;
  };

  const groupedWorkouts = groupWorkoutsByDate(filteredWorkouts);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <HistoryIcon className="w-6 h-6" />
          سجل التمارين
        </h1>
        <p className="text-sm opacity-90">جميع تمارينك السابقة</p>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">تصفية حسب المجموعة العضلية</span>
            </div>
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(groupedWorkouts).length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">لا توجد تمارين مسجلة</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedWorkouts).map(([date, workouts]) => (
              <div key={date} className="space-y-3">
                <h3 className="text-lg font-bold text-primary sticky top-0 bg-background py-2">{date}</h3>
                <div className="space-y-3">
                  {workouts.map((workout) => (
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
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{workout.exercise_name}</h4>
                            <p className="text-sm text-muted-foreground">{workout.muscle_group}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(workout.created_at).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(workout.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm flex-wrap">
                          <span className="text-primary font-medium">{workout.sets} مجموعات</span>
                          {workout.reps && <span>{workout.reps} تكرار</span>}
                          {workout.weight && <span className="text-secondary font-medium">{workout.weight} كجم</span>}
                          {workout.duration && <span>{workout.duration} دقيقة</span>}
                          {workout.calories_burned && <span>{workout.calories_burned} سعرة</span>}
                        </div>
                        {workout.notes && (
                          <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{workout.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا التمرين؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
