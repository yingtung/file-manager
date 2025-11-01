'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import { Button } from '@/components/ui/button';
import { requireAccessToken } from '@/utils/auth';
import { UploadProgress } from '@/components/UploadProgress'; 

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || '';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FileUploaderProps {
  onFileUploaded?: () => void;
}

export function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const supabase = createClient()
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'uploading' | 'saving' | 'complete' | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      throw new Error('請選擇一個檔案。');
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStage('uploading');
    const fileExtension = file.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    try {
      // 🚀 步驟 1: 上傳檔案到 Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`上傳至 Supabase 失敗: ${uploadError.message}`);
      }

      setUploadProgress(50);
      setUploadStage('saving');

      // 取得公開下載 URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadData.path);

      const publicUrl = publicUrlData.publicUrl;

      // 🚀 步驟 2: 呼叫 FastAPI 後端寫入元資料
      // Middleware 已驗證用戶身份，這裡直接使用 requireAccessToken 獲取 token
      const accessToken = await requireAccessToken();

      const fastapiResponse = await fetch(`${API_URL}/api/file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 📌 將 Supabase JWT 傳遞給 FastAPI 進行驗證
          'Authorization': `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({
          storage_path: filePath,
          name: file.name,
          size: file.size,
          mime_type: file.type,
          uploaded_at: new Date().toISOString(),
        }),
      });

      if (!fastapiResponse.ok) {
        const errorDetail = await fastapiResponse.json();
        // 假設 FastAPI 錯誤訊息在 detail 欄位
        throw new Error(errorDetail.detail || `FastAPI 處理失敗 (狀態碼: ${fastapiResponse.status})`);
      }

      setUploadProgress(100);
      setUploadStage('complete');

      setFile(null); // 清空欄位
      
      // Trigger callback to refresh file list
      onFileUploaded?.();
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStage(null);
      }, 1000);
    } catch (error: any) {
        setUploadProgress(0);
        setUploadStage(null);
        throw new Error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">檔案上傳</h2>
      
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      <Button 
        onClick={handleUpload} 
        disabled={!file || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {uploadStage === 'uploading' && '上傳中...'}
            {uploadStage === 'saving' && '儲存中...'}
            {uploadStage === 'complete' && '完成！'}
          </span>
        ) : (
          '確認上傳'
        )}
      </Button>
      
      {uploadProgress>0 && (
        <UploadProgress progress={uploadProgress} stage={uploadStage} />
      )}
    </div>
  );
}