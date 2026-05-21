/**
 * Achievement Manager Component
 * 
 * Allows admins to manage certifications and achievements with:
 * - Search functionality
 * - Category filtering
 * - PDF Preview in modal
 * - Bulk delete
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { TextInput } from '@/components/ui/TextInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { PDFUpload } from '@/components/ui/PDFUpload';
import { PDFPreview } from '@/components/ui/PDFPreview';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import type { Achievement } from '@/types';
import { achievementSchema } from '@/lib/validation';
import { z } from 'zod';

type AchievementFormData = z.infer<typeof achievementSchema>;

export function AchievementManager() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Selection state for bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<(AchievementFormData & { id?: string | number }) | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; item?: Achievement } | null>(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | number | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/content/achievements');
      if (!response.ok) throw new Error('Failed to fetch achievements');
      const data = await response.json();
      setAchievements(data.data || []);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to load achievements.');
    } finally {
      setIsFetching(false);
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

    const newItems = [...achievements];
    const draggedIdx = newItems.findIndex(i => i.id === draggedItem);
    const targetIdx = newItems.findIndex(i => i.id === targetId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;

    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, removed);

    const reordered = newItems.map((item, idx) => ({ ...item, displayOrder: idx }));
    setAchievements(reordered);

    try {
      const response = await fetch('/api/content/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered.map(i => ({ id: i.id, displayOrder: i.displayOrder }))),
      });

      if (!response.ok) throw new Error('Failed to save order');
      
      setSuccessMessage('Achievement order updated!');
      setTimeout(() => setSuccessMessage(null), 2000);
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to save new order.');
      fetchAchievements();
    }
  };

  // Filter logic
  const filteredAchievements = useMemo(() => {
    return achievements.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.issuer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [achievements, searchTerm, categoryFilter]);

  // Category options derived from data
  const categories = useMemo(() => {
    const cats = new Set(achievements.map(a => a.category));
    return [
      { label: 'All Categories', value: 'all' },
      ...Array.from(cats).map(c => ({ label: c, value: c }))
    ];
  }, [achievements]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredAchievements.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string | number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const validateForm = (data: AchievementFormData): boolean => {
    try {
      achievementSchema.parse(data);
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
    setEditingAchievement({ title: '', category: '', issuer: '', year: new Date().getFullYear(), pdfUrl: '' });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEdit = (item: Achievement) => {
    setEditingAchievement({
      id: item.id,
      title: item.title,
      category: item.category,
      issuer: item.issuer,
      year: Number(item.year),
      pdfUrl: item.pdfUrl || '',
      externalLink: item.externalLink || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAchievement || !validateForm(editingAchievement)) return;

    setIsLoading(true);
    try {
      const method = editingAchievement.id ? 'PUT' : 'POST';
      const response = await fetch('/api/content/achievements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAchievement),
      });

      if (!response.ok) throw new Error('Failed to save achievement');
      
      setSuccessMessage(`Achievement ${editingAchievement.id ? 'updated' : 'added'} successfully!`);
      setIsFormOpen(false);
      fetchAchievements();
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to save achievement.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setIsLoading(true);
    try {
      let response;
      if (deleteConfirm.type === 'single' && deleteConfirm.item) {
        response = await fetch(`/api/content/achievements?id=${deleteConfirm.item.id}`, { method: 'DELETE' });
      } else {
        response = await fetch('/api/content/achievements', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: Array.from(selectedIds) }),
        });
      }

      if (!response.ok) throw new Error('Delete failed');
      
      setSuccessMessage(deleteConfirm.type === 'single' ? 'Achievement deleted.' : `${selectedIds.size} achievements deleted.`);
      setDeleteConfirm(null);
      setSelectedIds(new Set());
      fetchAchievements();
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to delete achievement(s).');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gradient-gold">Achievements</h1>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button variant="danger" onClick={() => setDeleteConfirm({ type: 'bulk' })}>
              Delete Selected ({selectedIds.size})
            </Button>
          )}
          <Button onClick={handleAddNew}>+ Add Achievement</Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface-card p-4 border border-[var(--border)] rounded-lg flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <TextInput 
            placeholder="Search by title or issuer..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            options={categories}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          />
        </div>
      </div>

      {successMessage && <FormSuccess message={successMessage} />}
      {errorMessage && <FormError message={errorMessage} />}

      {/* List Header / Bulk Action */}
      <div className="flex items-center gap-4 px-4 py-3 bg-surface-soft border border-hairline rounded-t-md text-xs font-bold text-mute uppercase tracking-wider">
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-hairline bg-surface-card text-primary focus:ring-accent-blue/50"
          checked={filteredAchievements.length > 0 && selectedIds.size === filteredAchievements.length}
          onChange={handleSelectAll}
        />
        <span className="flex-1">Achievement Details</span>
        <span className="w-24 hidden md:block">Category</span>
        <span className="w-32 text-right">Actions</span>
      </div>

      <div className="flex flex-col border-x border-b border-hairline rounded-b-md divide-y divide-hairline bg-surface-card overflow-hidden">
        {filteredAchievements.length === 0 ? (
          <p className="p-12 text-center text-mute bg-surface-doc">
            No achievements found matching your criteria.
          </p>
        ) : (
          filteredAchievements.map((item) => (
            <div 
              key={item.id} 
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`flex items-center gap-4 p-4 transition-colors cursor-move ${
                selectedIds.has(item.id) ? 'bg-accent-blue-soft/30' : 'hover:bg-surface-doc'
              } ${dragOverItem === item.id ? 'bg-accent-blue/10 border-y border-accent-blue/30' : ''} ${
                draggedItem === item.id ? 'opacity-50' : ''
              }`}
            >
              <div className="text-mute dark:text-mute text-xl select-none">⋮⋮</div>

              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-hairline bg-surface-card text-primary focus:ring-accent-blue/50"
                checked={selectedIds.has(item.id)}
                onChange={() => handleSelectOne(item.id)}
              />
              
              <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold text-[10px]">{item.year}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground truncate">{item.title}</h3>
                  <p className="text-xs text-mute truncate">{item.issuer}</p>
                </div>
              </div>

              <div className="w-24 hidden md:block">
                <span className="px-2 py-0.5 bg-accent-blue-soft text-accent-blue text-[10px] font-bold uppercase rounded-full">
                  {item.category}
                </span>
              </div>

              <div className="w-32 flex justify-end gap-2">
                {item.pdfUrl && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(item.pdfUrl || null);
                    }}
                    className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                    title="Preview PDF"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                )}
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(item);
                }}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-accent-red hover:text-accent-red" onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm({ type: 'single', item });
                }}>Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingAchievement?.id ? 'Edit Achievement' : 'Add Achievement'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput 
              label="Title" 
              name="achievement-title"
              placeholder="e.g. Meta Front-End Developer" 
              value={editingAchievement?.title || ''} 
              onChange={e => setEditingAchievement(prev => prev ? { ...prev, title: e.target.value } : null)}
              error={formErrors.title}
              disabled={isLoading}
              required
            />
            <TextInput 
              label="Issuer" 
              name="achievement-issuer"
              placeholder="e.g. Coursera" 
              value={editingAchievement?.issuer || ''} 
              onChange={e => setEditingAchievement(prev => prev ? { ...prev, issuer: e.target.value } : null)}
              error={formErrors.issuer}
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput 
              label="Category" 
              name="achievement-category"
              placeholder="e.g. Certification" 
              value={editingAchievement?.category || ''} 
              onChange={e => setEditingAchievement(prev => prev ? { ...prev, category: e.target.value } : null)}
              error={formErrors.category}
              disabled={isLoading}
              required
            />
            <TextInput 
              label="Year" 
              name="achievement-year"
              type="number"
              value={editingAchievement?.year?.toString() || ''} 
              onChange={e => setEditingAchievement(prev => prev ? { ...prev, year: parseInt(e.target.value) || 0 } : null)}
              error={formErrors.year}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium">Certificate (PDF)</label>
            {editingAchievement?.pdfUrl ? (
              <div className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg flex items-center justify-between">
                <span className="text-sm truncate max-w-[200px]">{editingAchievement.pdfUrl.split('/').pop()}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400"
                  onClick={() => setEditingAchievement(prev => ({ ...prev!, pdfUrl: '' }))}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <PDFUpload 
                onUpload={res => setEditingAchievement(prev => ({ ...prev!, pdfUrl: res.url }))}
                onError={err => setErrorMessage(err.message)}
                folder="achievements"
              />
            )}
            {formErrors.pdfUrl && <p className="text-xs text-red-400">{formErrors.pdfUrl}</p>}
          </div>

          <TextInput 
            label="External Link (Optional)" 
            placeholder="https://..." 
            value={editingAchievement?.externalLink || ''} 
            onChange={e => setEditingAchievement(prev => ({ ...prev!, externalLink: e.target.value }))}
            error={formErrors.externalLink}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Save Achievement</Button>
          </div>
        </form>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal 
        isOpen={!!previewUrl} 
        onClose={() => setPreviewUrl(null)} 
        title="Certificate Preview"
        size="lg"
      >
        {previewUrl && <PDFPreview url={previewUrl} maxHeight="70vh" />}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deleteConfirm} 
        onClose={() => setDeleteConfirm(null)} 
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-[var(--foreground)]">
            {deleteConfirm?.type === 'single' 
              ? <>Are you sure you want to delete achievement <strong>{deleteConfirm.item?.title}</strong>?</>
              : <>Are you sure you want to delete <strong>{selectedIds.size}</strong> selected achievements?</>
            }
          </p>
          <p className="text-xs text-red-400">This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
              {deleteConfirm?.type === 'single' ? 'Delete Achievement' : 'Delete Selected'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
