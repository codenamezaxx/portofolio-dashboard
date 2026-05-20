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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAchievements.length === 0 ? (
          <p className="col-span-full p-8 text-center text-[var(--muted)] bg-surface-card border border-[var(--border)] rounded-lg">
            No achievements found matching your criteria.
          </p>
        ) : (
          filteredAchievements.map((item) => (
            <div key={item.id} className={`bg-surface-card border border-[var(--border)] rounded-lg p-5 flex flex-col gap-4 transition-all ${selectedIds.has(item.id) ? 'ring-2 ring-blue-500/50' : 'hover:border-blue-500/30'}`}>
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start">
                  <input 
                    type="checkbox" 
                    className="mt-1.5 rounded border-[var(--border)] bg-[var(--card)]"
                    checked={selectedIds.has(item.id)}
                    onChange={() => handleSelectOne(item.id)}
                  />
                  <div>
                    <span className="px-2 py-0.5 bg-gold/10 text-gold text-xs font-bold rounded mb-2 inline-block">
                      {item.year}
                    </span>
                    <h3 className="font-bold text-[var(--foreground)] text-lg">{item.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{item.issuer}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-400" onClick={() => setDeleteConfirm({ type: 'single', item })}>Delete</Button>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-[var(--border)] flex justify-between items-center">
                <span className="text-xs text-[var(--muted)] uppercase tracking-wider">{item.category}</span>
                <div className="flex gap-3">
                  {item.pdfUrl && (
                    <button 
                      onClick={() => setPreviewUrl(item.pdfUrl || null)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Preview PDF
                    </button>
                  )}
                  {item.externalLink && (
                    <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
                      Link ↗
                    </a>
                  )}
                </div>
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
              placeholder="e.g. Meta Front-End Developer" 
              value={editingAchievement?.title || ''} 
              onChange={e => setEditingAchievement(prev => ({ ...prev!, title: e.target.value }))}
              error={formErrors.title}
              required
            />
            <TextInput 
              label="Issuer" 
              placeholder="e.g. Coursera" 
              value={editingAchievement?.issuer || ''} 
              onChange={e => setEditingAchievement(prev => ({ ...prev!, issuer: e.target.value }))}
              error={formErrors.issuer}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput 
              label="Category" 
              placeholder="e.g. Certification" 
              value={editingAchievement?.category || ''} 
              onChange={e => setEditingAchievement(prev => ({ ...prev!, category: e.target.value }))}
              error={formErrors.category}
              required
            />
            <TextInput 
              label="Year" 
              type="number"
              value={editingAchievement?.year?.toString() || ''} 
              onChange={e => setEditingAchievement(prev => ({ ...prev!, year: parseInt(e.target.value) }))}
              error={formErrors.year}
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
