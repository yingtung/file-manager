'use client';

interface UploadProgressProps {
  progress: number;
  stage: 'uploading' | 'saving' | 'complete' | null;
}

const stageLabels = {
  uploading: '上傳到 Supabase Storage',
  saving: '儲存檔案資訊',
  complete: '上傳完成',
};

export function UploadProgress({ progress, stage }: UploadProgressProps) {
  if (!stage || progress === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{stageLabels[stage]}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

