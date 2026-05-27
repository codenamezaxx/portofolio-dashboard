/**
 * Journey Editor Component
 * 
 * Allows admins to manage journey timeline items:
 * - View list of items sorted by display order
 * - Add/Edit/Delete journey items
 * - Drag-and-drop reordering
 */

'use client';

import { useState, useEffect } from 'react';
import { TextInput } from '@/components/ui/TextInput';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import type { JourneyItem } from '@/types';
import { journeyItemSchema } from '@/lib/validation';
import { z } from 'zod';

type JourneyFormData = z.infer<typeof journeyItemSchema>;

export function JourneyEditor() {
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(JourneyFormData & { id?: string | number }) | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState<JourneyItem | null>(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/content/journey');
      if (!response.ok) throw new Error('Failed to fetch journey items');
      const data = await response.json();
      setItems(data.data || []);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to load journey items.');
    } finally {
      setIsFetching(false);
    }
  };

  const validateForm = (data: JourneyFormData): boolean => {
    try {
      journeyItemSchema.parse(data);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        const fieldErrors = error.flatten().fieldErrors as Record<string, string[] | undefined>;
        if (fieldErrors.year) newErrors.year = fieldErrors.year[0];
        if (fieldErrors.title) newErrors.title = fieldErrors.title[0];
        if (fieldErrors.description) newErrors.description = fieldErrors.description[0];
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  const handleAddNew = () => {
    setEditingItem({ year: '', title: '', description: '' });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEdit = (item: JourneyItem) => {
    setEditingItem({
      id: item.id,
      year: item.year,
      title: item.title,
      description: item.description,
      displayOrder: item.displayOrder,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !validateForm(editingItem)) return;

    setIsLoading(true);
    try {
      const method = editingItem.id ? 'PUT' : 'POST';
      const response = await fetch('/api/content/journey', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (!response.ok) throw new Error('Failed to save item');
      
      setSuccessMessage(`Journey item ${editingItem.id ? 'updated' : 'added'} successfully!`);
      setIsFormOpen(false);
      fetchItems();
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to save journey item.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/content/journey?id=${deleteConfirm.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setSuccessMessage('Journey item deleted.');
      setDeleteConfirm(null);
      fetchItems();
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to delete item.');
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (id: string | number) => setDraggedItem(id);
  const handleDragOver = (e: React.DragEvent, id: string | number) => {
    e.preventDefault();
    setDragOverItem(id);
  };
  const handleDrop = async (e: React.DragEvent, targetId: string | number) => {
    e.preventDefault();
    setDragOverItem(null);
    if (!draggedItem || draggedItem === targetId) return;

    const newItems = [...items];
    const draggedIdx = newItems.findIndex(i => i.id === draggedItem);
    const targetIdx = newItems.findIndex(i => i.id === targetId);
    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, removed);

    const reordered = newItems.map((item, idx) => ({ ...item, displayOrder: idx }));
    setItems(reordered);

    try {
      await fetch('/api/content/journey', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered.map(i => ({ id: i.id, displayOrder: i.displayOrder }))),
      });
    } catch (error) {
      setErrorMessage('Failed to save new order.');
      fetchItems();
    }
  };

  if (isFetching) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient-gold">Journey Manager</h1>
        <Button onClick={handleAddNew}>+ Add Milestone</Button>
      </div>

      {successMessage && <FormSuccess message={successMessage} />}
      {errorMessage && <FormError message={errorMessage} />}

      <div className="bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md divide-y divide-hairline dark:divide-hairline">
        {items.length === 0 ? (
          <p className="p-8 text-center text-mute dark:text-mute">No journey milestones yet.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`p-4 flex items-start gap-4 cursor-move transition-colors ${
                dragOverItem === item.id ? 'bg-blue-500/10' : 'hover:bg-[var(--card)]'
              } ${draggedItem === item.id ? 'opacity-50' : ''}`}
            >
              <div className="text-[var(--muted)] mt-1">⋮⋮</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">
                    {item.year}
                  </span>
                  <h3 className="font-semibold text-[var(--foreground)]">{item.title}</h3>
                </div>
                <p className="text-sm text-[var(--muted)] line-clamp-2">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="secondary"
                  className="text-sm" 
                  onClick={() => handleEdit(item)}
                  >
                    Edit
                </Button>
                <Button 
                  variant="secondary" 
                  className="text-sm text-red-400 hover:text-red-500"  
                  onClick={() => setDeleteConfirm(item)}
                  >
                    Delete
                  </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingItem?.id ? 'Edit Milestone' : 'Add Milestone'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <TextInput 
            label="Year / Period" 
            name="year"
            placeholder="e.g. 2023 or 2021 - Present" 
            value={editingItem?.year || ''} 
            onChange={e => setEditingItem(prev => prev ? { ...prev, year: e.target.value } : null)}
            error={formErrors.year}
            disabled={isLoading}
          />
          <TextInput 
            label="Title" 
            name="title"
            placeholder="e.g. Software Engineer at Google" 
            value={editingItem?.title || ''} 
            onChange={e => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
            error={formErrors.title}
            disabled={isLoading}
          />
          <TextArea 
            label="Description" 
            name="description"
            placeholder="Describe your achievements or responsibilities" 
            value={editingItem?.description || ''} 
            onChange={e => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
            error={formErrors.description}
            rows={4}
            disabled={isLoading}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <p className="mb-6">Are you sure you want to delete <strong>{deleteConfirm?.title}</strong>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
