'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface EditInputProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function EditInput({ value, onSave, onCancel, disabled = false, placeholder }: EditInputProps) {
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  // Sync internal value when prop value changes (e.g., when opening edit mode)
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (!editValue.trim() || disabled || isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(editValue.trim());
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex items-center gap-2 flex-1">
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSaving}
        className="h-8 flex-1"
        placeholder={placeholder}
        autoFocus
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={disabled || isSaving}
        className="h-8 w-8 p-0"
      >
        <Check className="w-4 h-4 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        disabled={disabled || isSaving}
        className="h-8 w-8 p-0"
      >
        <X className="w-4 h-4 text-red-600" />
      </Button>
    </div>
  );
}

