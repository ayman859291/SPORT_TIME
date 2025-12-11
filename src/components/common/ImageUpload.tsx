import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadWorkoutImage } from '@/lib/imageUpload';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadWorkoutImage(file, (p) => setProgress(p));

      onChange(result.url);

      const sizeInKB = (result.finalSize / 1024).toFixed(0);
      const message = result.compressed
        ? `تم رفع الصورة بنجاح بعد الضغط. الحجم النهائي: ${sizeInKB} كيلوبايت`
        : `تم رفع الصورة بنجاح. الحجم: ${sizeInKB} كيلوبايت`;

      toast({
        title: 'نجح الرفع',
        description: message,
      });
    } catch (error) {
      toast({
        title: 'خطأ في الرفع',
        description: error instanceof Error ? error.message : 'فشل في رفع الصورة',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      {value ? (
        <div className="relative">
          <img src={value} alt="صورة التمرين" className="w-full h-48 object-cover rounded-lg border border-border" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 left-2"
            onClick={handleRemove}
            disabled={disabled || uploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">انقر لإضافة صورة للتمرين (اختياري)</p>
          <p className="text-xs text-muted-foreground">JPEG, PNG, GIF, WEBP - حد أقصى 1 ميجابايت</p>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">جاري رفع الصورة... {progress}%</p>
        </div>
      )}

      {!value && !uploading && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="w-4 h-4 ml-2" />
          اختر صورة
        </Button>
      )}
    </div>
  );
}
