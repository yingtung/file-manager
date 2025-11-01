'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import { Button } from '@/components/ui/button';
import { requireAccessToken } from '@/utils/auth';
import { UploadProgress } from '@/components/UploadProgress';
import { Upload, FileText } from 'lucide-react'; 

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || '';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FileUploaderProps {
  onFileUploaded?: () => void;
}

export function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'uploading' | 'saving' | 'complete' | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
    } else {
      setFiles([]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    try {
      if (files.length === 0) {
        throw new Error('請選擇至少一個檔案。');
      }

      // Check file sizes (50MB limit)
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
      const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(', ');
        throw new Error(`以下檔案超過 50MB 限制: ${fileNames}`);
        
      }

      setIsUploading(true);
      setCurrentFileIndex(0);
      const totalFiles = files.length;
      const accessToken = await requireAccessToken();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        
        setCurrentFileIndex(i + 1);

        setUploadProgress((10 +i *100)/totalFiles);
        setUploadStage('uploading');
        const fileExtension = file.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

        // 🚀 步驟 1: 上傳檔案到 Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`上傳 ${file.name} 至 Supabase 失敗: ${uploadError.message}`);
        }

        setUploadProgress((50+i*100)/totalFiles);
        setUploadStage('saving');

        // 🚀 步驟 2: 呼叫 FastAPI 後端寫入元資料
        const fastapiResponse = await fetch(`${API_URL}/api/file`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
          throw new Error(`${file.name}: ${errorDetail.detail || `FastAPI 處理失敗 (狀態碼: ${fastapiResponse.status})`}`);
        }

        // Update progress based on current file index
        setUploadProgress((100+i*100)/totalFiles);
      }

      setUploadStage('complete');

      
      // Trigger callback to refresh file list
      onFileUploaded?.();
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStage(null);
        setCurrentFileIndex(0);
      }, 1000);
    } catch (error: any) {
      setUploadProgress(0);
      setUploadStage(null);
      setCurrentFileIndex(0);
      alert(error.message);
    } finally {
      setFiles([]); // 清空欄位
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <span className="text-blue-600 font-medium">點擊選擇檔案</span>
              <span className="text-gray-500"> 或拖放檔案到此處</span>
            </div>
            <p className="text-sm text-gray-400">支援多檔案上傳</p>
          </div>
        </button>
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-sm font-medium text-gray-700">
              已選擇 {files.length} 個檔案
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Button 
        onClick={handleUpload} 
        disabled={files.length === 0 || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {uploadStage === 'uploading' && `上傳中 (${currentFileIndex}/${files.length})...`}
            {uploadStage === 'saving' && `儲存中 (${currentFileIndex}/${files.length})...`}
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