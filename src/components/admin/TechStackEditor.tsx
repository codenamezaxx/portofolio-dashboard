/**
 * Tech Stack Editor Component
 * 
 * Allows admins to manage tech stack items including:
 * - View list of tech stack items with name and icon
 * - Add/Edit/Delete tech stack items
 * - Drag-and-drop reordering
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
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  GripHorizontal,
  Info,
  Layers
} from 'lucide-react';

type TechItemFormData = z.infer<typeof techItemSchema>;

interface TechStackEditorProps {
  initialData?: TechItem[];
}

interface EditingItem extends TechItemFormData {
  id?: string;
}

export function TechStackEditor({ initialData }: TechStackEditorProps) {
  const [techItems, setTechItems] = useState<TechItem[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!initialData);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

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
      if (!response.ok) throw new Error('Failed to fetch tech stack items');
      const data = await response.json();
      setTechItems(data.data || []);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to load tech stack items.');
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
          if (Array.isArray(messages) && messages.length > 0) newErrors[key] = messages[0];
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
    if (!editingItem || !validateForm({ name: editingItem.name, icon: editingItem.icon })) return;

    setIsLoading(true);
    try {
      const payload = { ...editingItem };
      const method = editingItem.id ? 'PUT' : 'POST';
      const response = await fetch('/api/content/tech-stack', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save tech item');
      
      setSuccessMessage(`Tech "${editingItem.name}" ${editingItem.id ? 'updated' : 'added'}!`);
      setIsFormOpen(false);
      fetchTechStack();
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to save tech stack item.');
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
    try {
      const response = await fetch(`/api/content/tech-stack?id=${deleteConfirm.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete');
      setTechItems(prev => prev.filter(i => i.id !== deleteConfirm.id));
      setSuccessMessage('Tech item deleted.');
      setDeleteConfirm(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to delete item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (id: string) => setDraggedItem(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverItem(id);
  };
  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverItem(null);
    if (!draggedItem || draggedItem === targetId) return;

    const newItems = [...techItems];
    const draggedIdx = newItems.findIndex(i => i.id === draggedItem);
    const targetIdx = newItems.findIndex(i => i.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, removed);

    const reordered = newItems.map((item, index) => ({ ...item, displayOrder: index }));
    setTechItems(reordered);

    try {
      await fetch('/api/content/tech-stack', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered.map(i => ({ id: i.id, displayOrder: i.displayOrder }))),
      });
    } catch (error) {
      setErrorMessage('Failed to save order.');
      fetchTechStack();
    }
  };

  if (isFetching) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-ink tracking-tight">Tech Stack</h1>
            <p className="text-body dark:text-body font-medium mt-1">Manage technologies and tools in your arsenal</p>
          </div>
        </div>
        <Button onClick={handleAddNew} disabled={isLoading} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Add Technology
        </Button>
      </div>

      {successMessage && <FormSuccess message={successMessage} />}
      {errorMessage && <FormError message={errorMessage} />}

      {techItems.length === 0 ? (
        <div className="bg-surface-card dark:bg-surface-card border-2 border-dashed border-hairline rounded-2xl p-12 text-center">
          <p className="text-mute dark:text-mute font-medium mb-4">No technologies added yet.</p>
          <Button variant="ghost" onClick={handleAddNew}>Add your first tech</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {techItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id || '')}
              onDragOver={(e) => handleDragOver(e, item.id || '')}
              onDrop={(e) => handleDrop(e, item.id || '')}
              className={`group relative bg-[var(--surface-card)] border border-hairline dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-move hover:shadow-xl hover:border-primary/30 hover:-translate-y-1
                ${dragOverItem === item.id ? 'ring-2 ring-primary border-transparent' : ''} 
                ${draggedItem === item.id ? 'opacity-50 scale-95' : ''}`}
            >
              {/* Drag Handle Overlay */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripHorizontal className="w-3.5 h-3.5 text-mute" />
              </div>

              {/* Action Buttons Overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                  className="p-1.5 rounded-lg bg-surface-soft dark:bg-surface-dark border border-hairline hover:text-primary transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
                  className="p-1.5 rounded-lg bg-surface-soft dark:bg-surface-dark border border-hairline hover:text-accent-red transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Icon Container */}
              <div className="w-16 h-16 flex items-center justify-center bg-[var(--surface-soft)] rounded-xl border border-hairline transition-transform duration-500 group-hover:scale-110">
                {item.icon ? (
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-xl">
                    {item.name.charAt(0)}
                  </div>
                )}
              </div>

              <h3 className="font-bold text-center text-ink dark:text-ink text-sm group-hover:text-primary transition-colors">
                {item.name}
              </h3>
            </div>
          ))}
        </div>
      )}

      {/* Info Tip */}
      <div className="p-5 rounded-2xl bg-accent-blue-soft/20 border border-accent-blue/10 flex gap-4">
        <Info className="w-6 h-6 text-accent-blue flex-shrink-0" />
        <p className="text-xs text-body leading-relaxed">
          <span className="font-black text-accent-blue uppercase tracking-wider block mb-1">Grid Management</span>
          Drag and drop cards to reorder your tech stack. Use clear, high-quality SVG or PNG icons for the best visual representation.
        </p>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem?.id ? 'Edit Technology' : 'Add New Technology'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <TextInput
            label="Technology Name"
            name="tech-name"
            placeholder="e.g., React, TypeScript, Node.js"
            value={editingItem?.name || ''}
            onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
            error={formErrors.name}
            disabled={isLoading}
            required
            className="h-11 focus:ring-primary/50 focus:border-primary"
          />

          <TextInput
            label="Icon URL"
            name="tech-icon"
            placeholder="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/..."
            value={editingItem?.icon || ''}
            onChange={(e) => setEditingItem(prev => prev ? { ...prev, icon: e.target.value } : null)}
            error={formErrors.icon}
            disabled={isLoading}
            required
            className="h-11 focus:ring-primary/50 focus:border-primary"
          />

          {editingItem?.icon && (
            <div className="p-4 bg-surface-soft dark:bg-surface-dark border border-hairline rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-surface-card dark:bg-surface-card rounded-lg border border-hairline">
                <Image src={editingItem.icon} alt="Preview" width={32} height={32} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div>
                <p className="text-xs font-black text-mute uppercase tracking-widest">Icon Preview</p>
                <p className="text-[10px] text-mute truncate max-w-[200px]">{editingItem.icon}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-hairline">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="px-8 shadow-lg shadow-primary/20">
              {isLoading ? 'Saving...' : editingItem?.id ? 'Update Technology' : 'Add Technology'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Technology">
        <div className="space-y-4">
          <p className="text-body">Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?</p>
          <p className="text-xs text-accent-red font-bold uppercase tracking-wider">This technology will be removed from your portfolio.</p>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete} isLoading={isDeleting}>Delete Permanently</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
