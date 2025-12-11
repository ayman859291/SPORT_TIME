import { supabase } from '@/db/supabase';

const BUCKET_NAME = 'app-854zbfquogld_workout_images';
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

// Compress image to WEBP format
const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Resize to max 1080p while maintaining aspect ratio
      const maxDimension = 1080;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('فشل في إنشاء سياق الرسم'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try different quality levels until file size is under 1MB
      let quality = 0.8;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('فشل في ضغط الصورة'));
              return;
            }

            if (blob.size <= MAX_FILE_SIZE || quality <= 0.1) {
              resolve(blob);
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          'image/webp',
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      reject(new Error('فشل في تحميل الصورة'));
    };

    reader.onerror = () => {
      reject(new Error('فشل في قراءة الملف'));
    };

    reader.readAsDataURL(file);
  });
};

// Validate file name (only English letters and numbers)
const sanitizeFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop() || '';
  const nameWithoutExt = fileName.replace(`.${extension}`, '');
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  return `${sanitized}_${timestamp}.${extension}`;
};

// Upload image to Supabase Storage
export const uploadWorkoutImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; compressed: boolean; finalSize: number }> => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('نوع الملف غير مدعوم. يرجى استخدام JPEG أو PNG أو GIF أو WEBP');
  }

  // Validate file name
  if (/[\u0600-\u06FF]/.test(file.name)) {
    throw new Error('اسم الملف يجب أن يحتوي على أحرف إنجليزية وأرقام فقط');
  }

  let fileToUpload: File | Blob = file;
  let compressed = false;
  let finalSize = file.size;

  // Compress if file is too large
  if (file.size > MAX_FILE_SIZE) {
    if (onProgress) onProgress(10);
    try {
      const compressedBlob = await compressImage(file);
      fileToUpload = compressedBlob;
      compressed = true;
      finalSize = compressedBlob.size;
      if (onProgress) onProgress(50);
    } catch (error) {
      throw new Error('فشل في ضغط الصورة. يرجى اختيار صورة أصغر');
    }
  }

  // Sanitize file name
  const sanitizedFileName = sanitizeFileName(file.name);

  // Upload to Supabase
  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(sanitizedFileName, fileToUpload, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('فشل في رفع الصورة. يرجى المحاولة مرة أخرى');
  }

  if (onProgress) onProgress(100);

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return {
    url: publicUrl,
    compressed,
    finalSize,
  };
};

// Delete image from Supabase Storage
export const deleteWorkoutImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
