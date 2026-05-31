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
import { 
  Trophy, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  GripVertical,
  CheckSquare,
  Square,
  FileText,
  ExternalLink,
  Info
} from 'lucide-react';

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

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAchievements.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAchievements.map(a => a.id)));
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
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-ink tracking-tight">Achievements</h1>
            <p className="text-body dark:text-body font-medium mt-1">Manage certifications and professional milestones</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {selectedIds.size > 0 && (
            <Button variant="danger" onClick={() => setDeleteConfirm({ type: 'bulk' })} className="flex-1 md:flex-none">
              <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedIds.size})
            </Button>
          )}
          <Button onClick={handleAddNew} className="flex-1 md:flex-none shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Add Achievement
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-primary/5 dark:bg-white/5 backdrop-blur-md border border-primary/10 dark:border-white/10 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <TextInput 
            placeholder="Search certificates..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-surface-card dark:bg-surface-dark focus:ring-primary/50"
          />
        </div>
        <div className="w-full md:w-56 flex items-center gap-2">
          <Filter className="w-4 h-4 text-mute shrink-0" />
          <Select 
            options={categories}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-11 bg-surface-card dark:bg-surface-dark focus:ring-primary/50"
          />
        </div>
        <Button 
          variant="ghost" 
          onClick={handleSelectAll}
          className={`h-11 px-4 ${selectedIds.size > 0 ? 'text-primary' : 'text-mute'}`}
        >
          {selectedIds.size === filteredAchievements.length && filteredAchievements.length > 0 ? <CheckSquare className="w-5 h-5 mr-2" /> : <Square className="w-5 h-5 mr-2" />}
          {selectedIds.size === filteredAchievements.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      {successMessage && <FormSuccess message={successMessage} />}
      {errorMessage && <FormError message={errorMessage} />}

      <div className="space-y-4">
        {filteredAchievements.length === 0 ? (
          <div className="bg-surface-card dark:bg-surface-card border-2 border-dashed border-hairline rounded-2xl p-16 text-center">
            <p className="text-mute dark:text-mute font-medium">No achievements found matching your criteria.</p>
          </div>
        ) : (
          filteredAchievements.map((item) => (
            <div 
              key={item.id} 
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`group flex flex-col md:flex-row items-center gap-6 bg-surface-card dark:bg-white/5 border border-hairline dark:border-white/10 rounded-2xl p-4 md:p-5 transition-all duration-300 cursor-move hover:shadow-xl hover:border-primary/30
                ${selectedIds.has(item.id) ? 'ring-2 ring-primary/40 bg-primary/5' : ''} 
                ${dragOverItem === item.id ? 'translate-y-2' : ''} 
                ${draggedItem === item.id ? 'opacity-50 grayscale' : ''}`}
            >
              {/* Drag & Select */}
              <div className="hidden md:flex flex-col items-center justify-center gap-4 px-2 border-r border-hairline/30 shrink-0">
                <GripVertical className="text-mute w-5 h-5" />
                <button 
                  onClick={(e) => { e.stopPropagation(); handleSelectOne(item.id); }}
                  className={`transition-colors ${selectedIds.has(item.id) ? 'text-primary' : 'text-stone hover:text-mute'}`}
                >
                  {selectedIds.has(item.id) ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                </button>
              </div>
              
              {/* Year Badge */}
              <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0">
                <span className="text-primary font-black text-sm">{item.year}</span>
                <span className="text-[8px] font-black text-primary/50 uppercase tracking-widest">Year</span>
              </div>

              {/* Achievement Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-ink dark:text-ink group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-mute font-medium mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                      Issuer: <span className="text-body font-bold">{item.issuer}</span>
                    </p>
                  </div>
                  
                  {/* Category & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 min-w-0 md:min-w-[280px]">
                    {/* Category Badge - Fixed Overflow */}
                    <div className="shrink-0">
                      <span className="px-3 py-1 bg-accent-blue-soft text-accent-blue text-[10px] font-black uppercase tracking-widest rounded-full border border-accent-blue/10">
                        {item.category}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.pdfUrl && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPreviewUrl(item.pdfUrl || null); }}
                          className="p-2 rounded-lg bg-surface-soft dark:bg-surface-dark border border-hairline hover:text-primary transition-all shadow-sm"
                          title="Preview Certificate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        className="p-2 rounded-lg bg-surface-soft dark:bg-surface-dark border border-hairline hover:text-primary transition-all shadow-sm"
                        title="Edit Achievement"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'single', item }); }}
                        className="p-2 rounded-lg bg-surface-soft dark:bg-surface-dark border border-hairline hover:text-accent-red transition-all shadow-sm"
                        title="Delete Achievement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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
        title={editingAchievement?.id ? 'Edit Achievement' : 'Record New Achievement'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextInput 
              label="Achievement Title" 
              name="achievement-title"
              placeholder="e.g. Meta Front-End Developer" 
              value={editingAchievement?.title || ''} 
              onChange={e => setEditingAchievement(prev => prev ? { ...prev, title: e.target.value } : null)}
              error={formErrors.title}
              disabled={isLoading}
              required
              className="h-11 focus:ring-primary/50"
            />
            <TextInput 
              label="Issuing Organization" 
              name="achievement-issuer"
              placeholder="e.g. Coursera, Google, Microsoft" 
              value={editingAchievement?.issuer || ''} 
              onChange={e => setEditingAchievement(prev => prev ? { ...prev, issuer: e.target.value } : null)}
              error={formErrors.issuer}
              disabled={isLoading}
              required
              className="h-11 focus:ring-primary/50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextInput 
              label="Category" 
              name="achievement-category"
              placeholder="e.g. Certification, Award" 
              value={editingAchievement?.category || ''} 
              onChange={e => setEditingAchievement(prev => prev ? { ...prev, category: e.target.value } : null)}
              error={formErrors.category}
              disabled={isLoading}
              required
              className="h-11 focus:ring-primary/50"
            />
            <TextInput 
              label="Year of Completion" 
              name="achievement-year"
              type="number"
              value={editingAchievement?.year?.toString() || ''} 
              onChange={e => setEditingAchievement(prev => prev ? { ...prev, year: parseInt(e.target.value) || 0 } : null)}
              error={formErrors.year}
              disabled={isLoading}
              required
              className="h-11 focus:ring-primary/50"
            />
          </div>
          
          <div className="space-y-3 pt-2">
            <label className="text-xs font-black text-mute uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Certificate Document (PDF)
            </label>
            {editingAchievement?.pdfUrl ? (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                   </div>
                   <span className="text-sm font-bold truncate max-w-[240px]">{editingAchievement.pdfUrl.split('/').pop()}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-accent-red hover:bg-accent-red/10"
                  onClick={() => setEditingAchievement(prev => ({ ...prev!, pdfUrl: '' }))}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Remove
                </Button>
              </div>
            ) : (
              <div className="bg-surface-soft dark:bg-surface-dark border-2 border-dashed border-hairline rounded-2xl p-2">
                <PDFUpload 
                  onUpload={res => setEditingAchievement(prev => ({ ...prev!, pdfUrl: res.url }))}
                  onError={err => setErrorMessage(err.message)}
                  folder="achievements"
                />
              </div>
            )}
          </div>

          <TextInput 
            label="External Credential Link (Optional)" 
            placeholder="https://www.coursera.org/verify/..." 
            value={editingAchievement?.externalLink || ''} 
            onChange={e => setEditingAchievement(prev => ({ ...prev!, externalLink: e.target.value }))}
            error={formErrors.externalLink}
            className="h-11 focus:ring-primary/50"
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-hairline">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isLoading} className="px-8 shadow-lg shadow-primary/20">
              Save Achievement
            </Button>
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
        title="Confirm Removal"
      >
        <div className="space-y-4">
          <p className="text-body font-medium">
            {deleteConfirm?.type === 'single' 
              ? <>Are you sure you want to delete <strong>{deleteConfirm.item?.title}</strong> from your records?</>
              : <>Are you sure you want to delete <strong>{selectedIds.size}</strong> selected achievements?</>
            }
          </p>
          <div className="p-4 bg-accent-red-soft/20 rounded-xl border border-accent-red/20 flex gap-3">
             <Info className="w-5 h-5 text-accent-red shrink-0" />
             <p className="text-xs text-accent-red leading-relaxed font-bold uppercase tracking-wider">
               Permanently deleting these records will remove them from your public portfolio.
             </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
              {deleteConfirm?.type === 'single' ? 'Delete Record' : 'Delete All Selected'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
