'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, FileText, Image as ImageIcon, File } from 'lucide-react';

interface File {
  id: string;
  name: string;
  size: number | null;
  mime_type: string | null;
  created_at: string;
  storage_path: string | null;
}

type SortField = 'name' | 'created_at' | 'size';
type SortDirection = 'asc' | 'desc';

interface FileTableProps {
  files: File[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
  sortField: SortField;
  sortDirection: SortDirection;
  onPageChange: (page: number) => void;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}

export function FileTable({
  files,
  loading,
  error,
  total,
  currentPage,
  pageSize,
  sortField,
  sortDirection,
  onPageChange,
  onSortChange,
}: FileTableProps) {
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default direction
      onSortChange(field, 'desc');
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="w-4 h-4" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const getFileTypeBadge = (mimeType: string | null): string => {
    if (!mimeType) return 'UNKNOWN';
    const parts = mimeType.split('/');
    if (parts.length > 1 && parts[1]) {
      return parts[1].toUpperCase();
    }
    return parts[0] ? parts[0].toUpperCase() : 'UNKNOWN';
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-1 font-semibold hover:bg-gray-100 transition-colors"
    >
      <span className="flex items-center gap-2">
        {children}
          <span className="text-gray-600">
            {sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        
      </span>
    </Button>
  );

  const TableSkeleton = () => (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[40%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
            <TableHead className="w-[20%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
            <TableHead className="w-[20%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
            <TableHead className="w-[20%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: pageSize }).map((_, index) => (
            <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div></TableCell>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div></TableCell>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div></TableCell>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center">
            <span className="text-red-600 text-xs">!</span>
          </div>
          <span className="text-red-800">錯誤: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">檔案列表</h2>
        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          共 {total} 個檔案
        </div>
      </div>
      
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[40%]">
                  <SortButton field="name">檔案名稱</SortButton>
                </TableHead>
                <TableHead className="w-[20%]">
                  <SortButton field="size">檔案大小</SortButton>
                </TableHead>
                <TableHead className="w-[20%]">
                  <SortButton field="created_at">上傳時間</SortButton>
                </TableHead>
                <TableHead className="w-[20%]">類型</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <span className="text-gray-500 font-medium">尚無檔案</span>
                      <span className="text-gray-400 text-sm">上傳您的第一個檔案開始使用</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file, index) => (
                  <TableRow key={file.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.mime_type)}
                        <span className="text-gray-900">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{formatFileSize(file.size)}</TableCell>
                    <TableCell className="text-gray-600">{formatDate(file.created_at)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getFileTypeBadge(file.mime_type)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600">
            顯示 {startItem} - {endItem}，共 {total} 個檔案
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              上一頁
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      disabled={loading}
                      className="min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              下一頁
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

