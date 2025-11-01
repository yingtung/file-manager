'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown, FileText, Image as ImageIcon, File, Edit, Trash2, ArrowUpDown, Download } from 'lucide-react';
import { EditInput } from '@/components/EditInput';
import { createClient } from '@/utils/supabase/client';
import { requireAccessToken } from '@/utils/auth';
import { formatDate } from '@/utils/formatDate';

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
  onFileUpdate?: (fileId: string, newName: string) => Promise<void>;
  onFileDelete?: (fileId: string) => Promise<void>;
  onFileDeleteSelected?: (selectedIds: string[]) => Promise<void>;
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
  onFileUpdate,
  onFileDelete,
  onFileDeleteSelected,
}: FileTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const supabase = createClient();
  const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || '';

  const handleStartEdit = (file: File) => {
    setEditingId(file.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (fileId: string, newName: string) => {
    if (!onFileUpdate) {
      handleCancelEdit();
      return;
    }

    try {
      await onFileUpdate(fileId, newName);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update file name:', error);
      throw error;
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!onFileDelete) return;
    
    if (!confirm('確定要刪除這個檔案嗎？')) {
      return;
    }

    try {
      await onFileDelete(fileId);
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('刪除失敗，請稍後再試');
    }
  };
  const handleDeleteSelected = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);
    
    if (selectedIds.length === 0) {
      alert('請至少選擇一個檔案來刪除');
      return;
    }
  
    if (!confirm(`確定要刪除 ${selectedIds.length} 個檔案嗎？`)) {
      return;
    }
    
    try {
    if (onFileDeleteSelected) {
      await onFileDeleteSelected(selectedIds);
    }
      
      setRowSelection({});
      
      
    } catch (error: any) {
      console.error('Batch delete failed:', error);
      alert(`刪除失敗: ${error.message}`);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const accessToken = await requireAccessToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_URL}/api/file/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || `下載失敗 (狀態碼: ${response.status})`);
      }

      const data = await response.json();
      const signedUrl = data.signed_url;
      
      // Open the signed URL in a new tab to trigger download
      window.open(signedUrl, '_blank');
    } catch (error: any) {
      console.error('Failed to download file:', error);
      alert(`下載失敗: ${error.message}`);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };



  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="w-16 h-16" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-16 h-16 text-gray-500" />;
  };

  const getThumbnailUrl = async (storagePath: string | null): Promise<string | null> => {
    if (!storagePath) return null;
    const { data,error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(storagePath,60*24*30,{transform:{width:100,height:100}});
    return data?.signedUrl|| null;
  };

  const ThumbnailCell = ({ thumbnailUrl, fileName, mimeType }: { thumbnailUrl: string; fileName: string; mimeType: string | null }) => {
    const [hasError, setHasError] = useState(false);
    
    if (hasError) {
      return (
        <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded">
          {getFileIcon(mimeType)}
        </div>
      );
    }
    
    return (
      <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={fileName}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  };

  // Define columns using TanStack Table
  const columns = useMemo<ColumnDef<File>[]>(() => [
    {
        id: "select", // 必須使用 'select' 作為 ID
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    {
      accessorKey: 'thumbnail',
      header: '預覽',
      cell: ({ row }) => {
        const file = row.original;
        const isImage = file.mime_type?.startsWith('image/');
        const thumbnailUrl = isImage ? getThumbnailUrl(file.storage_path) : null;
        
        if (!thumbnailUrl) {
          return (
            <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded">
              {getFileIcon(file.mime_type)}
            </div>
          );
        }
        const [url, setUrl] = useState<string | null>(null);

        useEffect(() => {
          let isUnmounted = false;
          if (thumbnailUrl instanceof Promise) {
            thumbnailUrl.then((u) => {
              if (!isUnmounted) setUrl(u);
            });
          } else {
            setUrl(thumbnailUrl);
          }
          return () => { isUnmounted = true; };
        }, [thumbnailUrl]);

        if (!url) {
          return (
            <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded">
              {getFileIcon(file.mime_type)}
            </div>
          );
        }

        return (
          <ThumbnailCell thumbnailUrl={url} fileName={file.name} mimeType={file.mime_type} />
        );
      },
    },
    {
      accessorKey: 'name',
      header: () => {
        const isSorted = sortField === 'name';
        const isAsc = sortDirection === 'asc';
        return (
          <Button
            variant="ghost"
            onClick={() => {
              onSortChange('name', isSorted && isAsc ? 'desc' : 'asc');
            }}
            className="h-auto p-1 font-semibold hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              檔案名稱
              {isSorted ? (
                isAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              ) : (
                <ArrowUpDown className="w-4 h-4" />
              )}
            </span>
          </Button>
        );
      },
      cell: ({ row }) => {
        const file = row.original;
        return (
          <div className="flex items-center">
            {editingId === file.id ? (
              <EditInput
                value={file.name}
                onSave={(newName) => handleSave(file.id, newName)}
                onCancel={handleCancelEdit}
              />
            ) : (
              <span 
                className="text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                onClick={() => onFileUpdate && handleStartEdit(file)}
                title="點擊編輯檔案名稱"
              >
                {file.name}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'size',
      header: () => {
        const isSorted = sortField === 'size';
        const isAsc = sortDirection === 'asc';
        return (
          <Button
            variant="ghost"
            onClick={() => {
              onSortChange('size', isSorted && isAsc ? 'desc' : 'asc');
            }}
            className="h-auto p-1 font-semibold hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              檔案大小
              {isSorted ? (
                isAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              ) : (
                <ArrowUpDown className="w-4 h-4" />
              )}
            </span>
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span className="text-gray-600">{formatFileSize(row.original.size)}</span>;
      },
    },
    {
      accessorKey: 'created_at',
      header: () => {
        const isSorted = sortField === 'created_at';
        const isAsc = sortDirection === 'asc';
        return (
          <Button
            variant="ghost"
            onClick={() => {
              onSortChange('created_at', isSorted && isAsc ? 'desc' : 'asc');
            }}
            className="h-auto p-1 font-semibold hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              上傳時間
              {isSorted ? (
                isAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              ) : (
                <ArrowUpDown className="w-4 h-4" />
              )}
            </span>
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span className="text-gray-600">{formatDate(row.original.created_at)}</span>;
      },
    },
    {
      accessorKey: 'mime_type',
      header: '類型',
      cell: ({ row }) => {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {row.original.mime_type}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '操作',
      enableHiding: false,
      cell: ({ row }) => {
        const file = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingId(file.id)}
              disabled={editingId !== null}
              className="h-8 w-8 p-0 hover:bg-blue-50 cursor-pointer"
              title="編輯"
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(file.id, file.name)}
              disabled={editingId !== null}
              className="h-8 w-8 p-0 hover:bg-green-50 cursor-pointer"
              title="下載"
            >
              <Download className="w-4 h-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(file.id)}
              disabled={editingId !== null}
              className="h-8 w-8 p-0 hover:bg-red-50 cursor-pointer"
              title="刪除"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        );
      },
    },
  ], [editingId, sortField, sortDirection, onSortChange, onFileUpdate, onFileDelete]);

  const table = useReactTable({
    data: files,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    
  });

  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const TableSkeleton = () => (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[5%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
            <TableHead className="w-[8%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
            <TableHead className="w-[25%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
            <TableHead className="w-[10%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
            <TableHead className="w-[10%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
            <TableHead className="w-[10%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
            <TableHead className="w-[12%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
            <TableHead className="w-[10%]"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: pageSize }).map((_, index) => (
            <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-4"></div></TableCell>
              <TableCell><div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div></TableCell>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div></TableCell>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div></TableCell>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div></TableCell>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div></TableCell>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div></TableCell>
              <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div></TableCell>
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

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">檔案列表</h2>
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="h-8"
            >
              刪除已選 {selectedCount} 個
            </Button>
          )}
        </div>
      </div>
      
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className={
                      header.column.id === 'select' ? 'w-[5%]' :
                      header.column.id === 'thumbnail' ? 'w-[8%]' :
                      header.column.id === 'name' ? 'w-[25%]' :
                      header.column.id === 'size' || header.column.id === 'created_at' || header.column.id === 'mime_type' ? 'w-[10%]' :
                      header.column.id === 'actions' ? 'w-[10%]' :
                      'w-[12%]'
                    }>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cell.column.id === 'name' ? 'font-medium' : ''}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <span className="text-gray-500 font-medium">尚無檔案</span>
                      <span className="text-gray-400 text-sm">上傳您的第一個檔案開始使用</span>
                    </div>
                  </TableCell>
                </TableRow>
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
