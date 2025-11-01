'use client';

import { useState, useEffect } from "react";
import { requireAccessToken } from "@/utils/auth";
import { FileUploader } from "@/components/FileUploader";
import { FileTable } from "@/components/FileTable";
import { Navbar } from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface File {
  id: string;
  name: string;
  size: number | null;
  mime_type: string | null;
  created_at: string;
  storage_path: string | null;
}

interface FileListResponse {
  data: File[];
  total: number;
  page: number;
  page_size: number;
}

type SortField = 'name' | 'created_at' | 'size';
type SortDirection = 'asc' | 'desc';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField[]>(['created_at']);
  const [sortOrder, setSortOrder] = useState<SortDirection[]>(['desc']);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5 ;
  
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const accessToken = await requireAccessToken();
      
      // Build query string for multiple sort fields
      const params = new URLSearchParams();
      sortBy.forEach(field => params.append('sort_by', field));
      sortOrder.forEach(order => params.append('sort_order', order));
      params.append('page', currentPage.toString());
      params.append('page_size', pageSize.toString());
      
      const response = await fetch(
        `${API_URL}/api/file?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || `載入失敗 (狀態碼: ${response.status})`);
      }
      
      const data: FileListResponse = await response.json();
      setFiles(data.data);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, currentPage]);
  
  const handleFileUploaded = () => {
    // Refresh file list after upload
    fetchFiles();
  };

  const handleFileUpdate = async (fileId: string, newName: string) => {
    try {
      const accessToken = await requireAccessToken();
      
      const response = await fetch(`${API_URL}/api/file/${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || `更新失敗 (狀態碼: ${response.status})`);
      }

      // Refresh file list after update
      fetchFiles();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const accessToken = await requireAccessToken();
      
      const response = await fetch(`${API_URL}/api/file/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || `刪除失敗 (狀態碼: ${response.status})`);
      }

      // Refresh file list after delete
      fetchFiles();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const handleFileDeleteSelected = async (selectedIds: string[]) => {
    try {
      const accessToken = await requireAccessToken();
      const response = await fetch(`${API_URL}/api/file/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ file_ids: selectedIds }),
      });
      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || `刪除失敗 (狀態碼: ${response.status})`);
      }

      // Refresh file list after delete
      fetchFiles();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <FileUploader onFileUploaded={handleFileUploaded} />

        <FileTable 
        files={files}
        loading={loading}
        error={error}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        sortField={sortBy[0] || 'created_at'}
        sortDirection={sortOrder[0] || 'desc'}
        onPageChange={setCurrentPage}
        onSortChange={(field: SortField, direction: SortDirection) => {
          setSortBy([field]);
          setSortOrder([direction]);
          setCurrentPage(1);
        }}
        onFileUpdate={handleFileUpdate}
        onFileDelete={handleFileDelete}
        onFileDeleteSelected={handleFileDeleteSelected}
        />
      </div>
    </>
  );
}
