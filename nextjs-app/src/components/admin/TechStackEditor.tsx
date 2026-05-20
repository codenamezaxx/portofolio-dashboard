/**
 * Tech Stack Editor Component
 * 
 * Allows admins to manage tech stack items including:
 * - View list of tech stack items with name and icon
 * - Add new tech stack items
 * - Edit existing tech stack items
 * - Delete tech stack items with confirmation
 * - Drag-and-drop reordering
 * - Icon preview
 * 
 * Features:
 * - Form validation with Zod
 * - Drag-and-drop reordering
 * - Icon preview
 * - Confirmation dialog for deletion
 * - Error handling and user feedback
 * - Accessibility features (ARIA labels, semantic HTML)
 * - Dark mode support via ThemeContext
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import type { TechItem } from '@/types';
import { techItemSchema } from '@/lib/validation';
import { z } from 'zod';

type TechItemFormData = z.infer<typeof techItemSchema>;

interface TechStackEditorProps {
  initialData?: TechItem[];
}

interface EditingItem extends TechItemFormData {
  id?: string;
}

export function TechStackEditor({ initialData }: TechStackEditorProps) {
  const router = useRouter();
  const [techItems, setTechItems] = useState<TechItem[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!initialData);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Form state
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  // Fetch tech stack items on mount if not provided
  useEffect(() => {
    if (!initialData) {
      fetchTechStack();
    }
  }, [initialData]);

  const fetchTechStack = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/content/tech-stack', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tech stack items');
      }

      const data = await response.json();
      setTechItems(data.data || []);
    } catch (error) {
      console.error('Error fetching tech stack:', error);
      setErrorMessage('Failed to load tech stack items. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const validateForm = (data: TechItemFormData): boolean => {
    try {
      techItemSchema.parse(data);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        const flattened = error.flatten().fieldErrors;
        Object.entries(flattened).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            newErrors[key] = messages[0];
          }
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  const handleAddNew = () => {
    setEditingItem({ name: '', icon: '' });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEdit = (item: TechItem) => {
    setEditingItem({
      name: item.name,
      icon: item.icon,
      displayOrder: item.displayOrder,
      id: item.id,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingItem || !validateForm({ name: editingItem.name, icon: editingItem.icon })) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        name: editingItem.name,
        icon: editingItem.icon,
        displayOrder: editingItem.displayOrder,
        ...(editingItem.id && { id: editingItem.id }),
      };

      const method = editingItem.id ? 'PUT' : 'POST';
      const response = await fetch('/api/content/tech-stack', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingItem.id ? 'update' : 'create'} tech stack item`);
      }

      const data = await response.json();

      if (editingItem.id) {
        // Update existing item
        setTechItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  name: data.data.name,
                  icon: data.data.icon,
                  displayOrder: data.data.displayOrder,
                }
              : item
          )
        );
        setSuccessMessage('Tech stack item updated successfully!');
      } else {
        // Add new item
        setTechItems((prev) => [
          ...prev,
          {
            id: data.data.id,
            name: data.data.name,
            icon: data.data.icon,
            displayOrder: data.data.displayOrder,
            createdAt: new Date(data.data.createdAt),
            updatedAt: new Date(data.data.updatedAt),
          },
        ]);
        setSuccessMessage('Tech stack item added successfully!');
      }

      setIsFormOpen(false);
      setEditingItem(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      console.error('Error saving tech stack item:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save tech stack item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (item: TechItem) => {
    setDeleteConfirm({ id: item.id || '', name: item.name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/content/tech-stack?id=${deleteConfirm.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete tech stack item');
      }

      setTechItems((prev) => prev.filter((item) => item.id !== deleteConfirm.id));
      setSuccessMessage('Tech stack item deleted successfully!');
      setDeleteConfirm(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      console.error('Error deleting tech stack item:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete tech stack item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverItem(id);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverItem(null);

    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    // Reorder items locally
    const draggedIndex = techItems.findIndex((item) => item.id === draggedItem);
    const targetIndex = techItems.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const newItems = [...techItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    // Update display order
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      displayOrder: index,
    }));

    setTechItems(reorderedItems);
    setDraggedItem(null);

    // Save reordering to server
    try {
      const response = await fetch('/api/content/tech-stack', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(
          reorderedItems.map((item) => ({
            id: item.id,
            displayOrder: item.displayOrder,
          }))
        ),
      });

      if (!response.ok) {
        throw new Error('Failed to save reordering');
      }

      setSuccessMessage('Tech stack reordered successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (error) {
      console.error('Error saving reordering:', error);
      setErrorMessage('Failed to save reordering. Please try again.');
      // Revert to original order
      fetchTechStack();
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-ink">Tech Stack Manager</h1>
          <p className="text-body dark:text-body mt-2">
            Manage your technology skills and tools. Drag to reorder.
          </p>
        </div>
        <Button onClick={handleAddNew} disabled={isLoading}>
          + Add Tech
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && <FormSuccess message={successMessage} />}

      {/* Error Message */}
      {errorMessage && <FormError message={errorMessage} />}

      {/* Tech Stack List */}
      <div className="bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md overflow-hidden">
        {techItems.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-mute dark:text-mute mb-4">No tech stack items yet.</p>
            <Button onClick={handleAddNew}>Add Your First Tech</Button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {techItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id || '')}
                onDragOver={(e) => handleDragOver(e, item.id || '')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.id || '')}
                className={`p-4 flex items-center gap-4 cursor-move transition-colors ${
                  dragOverItem === item.id ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--card)]'
                } ${draggedItem === item.id ? 'opacity-50' : ''}`}
              >
                {/* Drag Handle */}
                <div className="text-mute dark:text-mute text-xl">⋮⋮</div>

                {/* Icon Preview */}
                <div className="w-12 h-12 flex items-center justify-center bg-[var(--card)] rounded-lg border border-[var(--border)]">
                  {item.icon ? (
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-mute dark:text-mute">?</span>
                  )}
                </div>

                {/* Tech Name */}
                <div className="flex-1">
                  <h3 className="font-medium text-ink dark:text-ink">{item.name}</h3>
                  <p className="text-xs text-mute dark:text-mute truncate">{item.icon}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(item)}
                    disabled={isLoading}
                    variant="secondary"
                    className="text-sm"
                    aria-label={`Edit ${item.name}`}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(item)}
                    disabled={isLoading}
                    variant="secondary"
                    className="text-sm text-red-400 hover:text-red-500"
                    aria-label={`Delete ${item.name}`}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
          setFormErrors({});
        }}
        title={editingItem?.id ? 'Edit Tech Stack Item' : 'Add New Tech Stack Item'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <TextInput
              label="Technology Name"
              placeholder="e.g., React, TypeScript, Tailwind CSS"
              value={editingItem?.name || ''}
              onChange={(e) =>
                setEditingItem((prev) => prev ? { ...prev, name: e.target.value } : null)
              }
              error={formErrors.name}
              disabled={isLoading}
              required
              aria-label="Technology name"
              aria-describedby={formErrors.name ? 'name-error' : undefined}
            />
            {formErrors.name && (
              <p id="name-error" className="text-sm text-red-400 mt-1">
                {formErrors.name}
              </p>
            )}
          </div>

          {/* Icon URL Field */}
          <div>
            <TextInput
              label="Icon URL"
              placeholder="https://example.com/icon.svg"
              value={editingItem?.icon || ''}
              onChange={(e) =>
                setEditingItem((prev) => prev ? { ...prev, icon: e.target.value } : null)
              }
              error={formErrors.icon}
              disabled={isLoading}
              required
              aria-label="Icon URL"
              aria-describedby={formErrors.icon ? 'icon-error' : undefined}
            />
            {formErrors.icon && (
              <p id="icon-error" className="text-sm text-red-400 mt-1">
                {formErrors.icon}
              </p>
            )}

            {/* Icon Preview */}
            {editingItem?.icon && (
              <div className="mt-3 p-3 bg-surface-soft dark:bg-surface-soft border border-hairline dark:border-hairline rounded-md flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-surface-card dark:bg-surface-card rounded border border-hairline dark:border-hairline">
                  <Image
                    src={editingItem.icon}
                    alt="Icon preview"
                    width={32}
                    height={32}
                    className="object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-xs text-mute dark:text-mute">Icon preview</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingItem(null);
                setFormErrors({});
              }}
              disabled={isLoading}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editingItem?.id ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Tech Stack Item"
      >
        <div className="space-y-4">
          <p className="text-ink dark:text-ink">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Info Box */}
      <div className="bg-accent-blue-soft dark:bg-accent-blue-soft border border-accent-blue/30 dark:border-accent-blue/30 rounded-md p-4">
        <p className="text-xs text-body dark:text-body leading-relaxed">
          <span className="font-semibold text-accent-blue dark:text-accent-blue">💡 Tip:</span> Drag items to reorder them. The order will be saved automatically. Use icon URLs from CDNs like Simpleicons or Devicon for best results.
        </p>
      </div>
    </div>
  );
}
