import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/common/ImageUpload';
import { createWorkout, getExerciseTemplates } from '@/db/api';
import type { ExerciseTemplate, WorkoutFormData } from '@/types/types';
import { ArrowRight, Dumbbell, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const muscleGroups = [
  'صدر',
  'ظهر',
  'أكتاف',
  'باي',
  'تراي',
  'أرجل',
  'بطن',
  'كارديو',
];

export default function AddWorkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [formData, setFormData] = useState<WorkoutFormData>({
    exercise_name: '',
    muscle_group: '',
    sets: 3,
    reps: 10,
    weight: undefined,
    duration: undefined,
    calories_burned: undefined,
    notes: '',
    image_url: undefined,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const data = await getExerciseTemplates();
    setTemplates(data);
  };

  const filteredTemplates = selectedMuscleGroup
    ? templates.filter((t) => t.muscle_group === selectedMuscleGroup)
    : templates;

  const handleTemplateSelect = (templateName: string) => {
    const template = templates.find((t) => t.name === templateName);
    if (template) {
      setFormData({
        ...formData,
        exercise_name: template.name,
        muscle_group: template.muscle_group,
        sets: template.default_sets,
        reps: template.default_reps,
      });
      setSelectedMuscleGroup(template.muscle_group);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.exercise_name || !formData.muscle_group) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم التمرين والمجموعة العضلية',
        variant: 'destructive',
      });
      return;
    }

    if (formData.sets <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال عدد مجموعات صحيح',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createWorkout(formData);
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة التمرين بنجاح',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في إضافة التمرين',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">إضافة تمرين جديد</h1>
        </div>
        <p className="text-sm opacity-90 mr-12">سجل تمرينك اليومي</p>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                اختر من القوالب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>المجموعة العضلية</Label>
                <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المجموعة العضلية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التمارين</SelectItem>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMuscleGroup && (
                <div className="space-y-2">
                  <Label>التمرين</Label>
                  <Select value={formData.exercise_name} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التمرين" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل التمرين</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exercise_name">اسم التمرين *</Label>
                <Input
                  id="exercise_name"
                  value={formData.exercise_name}
                  onChange={(e) => setFormData({ ...formData, exercise_name: e.target.value })}
                  placeholder="مثال: ضغط البنش"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="muscle_group">المجموعة العضلية *</Label>
                <Select
                  value={formData.muscle_group}
                  onValueChange={(value) => setFormData({ ...formData, muscle_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المجموعة العضلية" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sets">عدد المجموعات *</Label>
                  <Input
                    id="sets"
                    type="number"
                    min="1"
                    value={formData.sets}
                    onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reps">عدد التكرارات</Label>
                  <Input
                    id="reps"
                    type="number"
                    min="0"
                    value={formData.reps || ''}
                    onChange={(e) => setFormData({ ...formData, reps: parseInt(e.target.value) || undefined })}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">الوزن (كجم)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || undefined })}
                    placeholder="20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">المدة (دقيقة)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calories">السعرات المحروقة</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  value={formData.calories_burned || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, calories_burned: parseFloat(e.target.value) || undefined })
                  }
                  placeholder="150"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أضف ملاحظاتك حول التمرين..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>صورة التمرين (اختياري)</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg" disabled={loading}>
            <Save className="w-5 h-5 ml-2" />
            {loading ? 'جاري الحفظ...' : 'حفظ التمرين'}
          </Button>
        </form>
      </div>
    </div>
  );
}
