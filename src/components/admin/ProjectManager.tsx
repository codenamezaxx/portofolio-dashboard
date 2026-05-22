/**
 * Project Manager Component
 * 
 * Allows admins to manage portfolio projects with:
 * - Search functionality
 * - Category filtering
 * - Bulk delete
 * - CRUD operations
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { TextInput } from '@/components/ui/TextInput';
import { Select } from '@/components/ui/Select';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { ProjectForm } from './ProjectForm';
import type { Project } from '@/types';

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
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
  const [editingProject, setEditingProject] = useState<any>(null);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; item?: Project } | null>(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | number | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/content/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.data || []);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to load projects.');
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

    const newItems = [...projects];
    const draggedIdx = newItems.findIndex(i => i.id === draggedItem);
    const targetIdx = newItems.findIndex(i => i.id === targetId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;

    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, removed);

    const reordered = newItems.map((item, idx) => ({ ...item, displayOrder: idx }));
    setProjects(reordered);

    try {
      const response = await fetch('/api/content/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered.map(i => ({ id: i.id, displayOrder: i.displayOrder }))),
      });

      if (!response.ok) throw new Error('Failed to save order');
      
      setSuccessMessage('Project order updated!');
      setTimeout(() => setSuccessMessage(null), 2000);
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to save new order.');
      fetchProjects();
    }
  };

  // Filter logic
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || project.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchTerm, categoryFilter]);

  // Category options derived from data
  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category));
    return [
      { label: 'All Categories', value: 'all' },
      ...Array.from(cats).map(c => ({ label: c, value: c }))
    ];
  }, [projects]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)));
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

  const handleAddNew = () => {
    setEditingProject(null as any);
    setIsFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    // Transform Project to ProjectInput format for the form
    const formData = {
      title: project.title,
      description: project.description,
      category: project.category,
      imageUrl: project.image || project.imageUrl,
      technologies: project.tech || project.technologies || [],
      githubLink: project.links?.github,
      liveLink: project.links?.live,
      demoLink: project.links?.demo,
      displayOrder: project.displayOrder
    };
    setEditingProject({ ...project, ...formData } as any);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = editingProject ? { ...data, id: editingProject.id } : data;
      const method = editingProject ? 'PUT' : 'POST';
      const response = await fetch('/api/content/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save project');
      
      setSuccessMessage(`Project ${editingProject ? 'updated' : 'added'} successfully!`);
      setIsFormOpen(false);
      fetchProjects();
      setTimeout(() => setSuccessMessage(null), 3000);

      // Trigger ISR revalidation
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to save project.');
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
        response = await fetch(`/api/content/projects?id=${deleteConfirm.item.id}`, { method: 'DELETE' });
      } else {
        response = await fetch('/api/content/projects', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: Array.from(selectedIds) }),
        });
      }

      if (!response.ok) throw new Error('Delete failed');
      
      setSuccessMessage(deleteConfirm.type === 'single' ? 'Project deleted.' : `${selectedIds.size} projects deleted.`);
      setDeleteConfirm(null);
      setSelectedIds(new Set());
      fetchProjects();
      setTimeout(() => setSuccessMessage(null), 3000);

      // Trigger ISR revalidation
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to delete project(s).');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-foreground">Project Manager</h1>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button variant="danger" onClick={() => setDeleteConfirm({ type: 'bulk' })}>
              Delete Selected ({selectedIds.size})
            </Button>
          )}
          <Button onClick={handleAddNew}>+ Add Project</Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface-card p-4 border border-hairline rounded-md flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <TextInput 
            placeholder="Search by title or description..." 
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
          checked={filteredProjects.length > 0 && selectedIds.size === filteredProjects.length}
          onChange={handleSelectAll}
        />
        <span className="flex-1">Project Details</span>
        <span className="w-24 hidden md:block">Category</span>
        <span className="w-32 text-right">Actions</span>
      </div>

      <div className="flex flex-col border-x border-b border-hairline rounded-b-md divide-y divide-hairline bg-surface-card overflow-hidden">
        {filteredProjects.length === 0 ? (
          <p className="p-12 text-center text-mute bg-surface-doc">
            No projects found matching your criteria.
          </p>
        ) : (
          filteredProjects.map((project) => (
            <div 
              key={project.id} 
              draggable
              onDragStart={() => handleDragStart(project.id)}
              onDragOver={(e) => handleDragOver(e, project.id)}
              onDrop={(e) => handleDrop(e, project.id)}
              className={`flex items-center gap-4 p-4 transition-colors cursor-move ${
                selectedIds.has(project.id) ? 'bg-accent-blue-soft/30' : 'hover:bg-surface-doc'
              } ${dragOverItem === project.id ? 'bg-accent-blue/10 border-y border-accent-blue/30' : ''} ${
                draggedItem === project.id ? 'opacity-50' : ''
              }`}
            >
              <div className="text-mute dark:text-mute text-xl select-none">⋮⋮</div>

              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-hairline bg-surface-card text-primary focus:ring-accent-blue/50"
                checked={selectedIds.has(project.id)}
                onChange={() => handleSelectOne(project.id)}
              />
              
              <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-surface-soft border border-hairline flex-shrink-0 overflow-hidden relative">
                  {project.imageUrl && (
                    <Image 
                      src={project.imageUrl} 
                      alt="" 
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground truncate">{project.title}</h3>
                  <p className="text-xs text-mute truncate">{project.description}</p>
                </div>
              </div>

              <div className="w-24 hidden md:block">
                <span className="px-2 py-0.5 bg-accent-blue-soft text-accent-blue text-[10px] font-bold uppercase rounded-full">
                  {project.category}
                </span>
              </div>

              <div className="w-32 flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-accent-red hover:text-accent-red" onClick={() => setDeleteConfirm({ type: 'single', item: project })}>Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        size="lg"
      >
        <ProjectForm 
          initialData={editingProject || undefined} 
          onSubmit={handleFormSubmit} 
          isLoading={isLoading} 
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deleteConfirm} 
        onClose={() => setDeleteConfirm(null)} 
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-ink dark:text-ink">
            {deleteConfirm?.type === 'single' 
              ? <>Are you sure you want to delete project <strong>{deleteConfirm.item?.title}</strong>?</>
              : <>Are you sure you want to delete <strong>{selectedIds.size}</strong> selected projects?</>
            }
          </p>
          <p className="text-xs text-accent-red dark:text-accent-red">This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
              {deleteConfirm?.type === 'single' ? 'Delete Project' : 'Delete Selected'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
