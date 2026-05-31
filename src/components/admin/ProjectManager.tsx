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
import { GithubIcon } from '@/components/ui/Icons';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  GripVertical,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';

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

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)));
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
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (error) {
      setErrorMessage('Failed to delete project(s).');
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
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-ink tracking-tight">Project Manager</h1>
            <p className="text-body dark:text-body font-medium mt-1">Showcase your best engineering work</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {selectedIds.size > 0 && (
            <Button variant="danger" onClick={() => setDeleteConfirm({ type: 'bulk' })} className="flex-1 md:flex-none">
              <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedIds.size})
            </Button>
          )}
          <Button onClick={handleAddNew} className="flex-1 md:flex-none shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-primary/5 dark:bg-white/5 backdrop-blur-md border border-primary/10 dark:border-white/10 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <TextInput 
            placeholder="Search projects..." 
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
          {selectedIds.size === filteredProjects.length && filteredProjects.length > 0 ? <CheckSquare className="w-5 h-5 mr-2" /> : <Square className="w-5 h-5 mr-2" />}
          {selectedIds.size === filteredProjects.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      {successMessage && <FormSuccess message={successMessage} />}
      {errorMessage && <FormError message={errorMessage} />}

      <div className="grid grid-cols-1 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="bg-surface-card dark:bg-surface-card border-2 border-dashed border-hairline rounded-2xl p-16 text-center">
            <p className="text-mute dark:text-mute font-medium">No projects found matching your criteria.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div 
              key={project.id} 
              draggable
              onDragStart={() => handleDragStart(project.id)}
              onDragOver={(e) => handleDragOver(e, project.id)}
              onDrop={(e) => handleDrop(e, project.id)}
              className={`group flex flex-col lg:flex-row items-stretch gap-6 bg-surface-card dark:bg-white/5 border border-hairline dark:border-white/10 rounded-2xl p-4 md:p-5 transition-all duration-300 cursor-move hover:shadow-xl hover:border-primary/30
                ${selectedIds.has(project.id) ? 'ring-2 ring-primary/40 bg-primary/5' : ''} 
                ${dragOverItem === project.id ? 'translate-y-2' : ''} 
                ${draggedItem === project.id ? 'opacity-50' : ''}`}
            >
              {/* Drag & Select Handles */}
              <div className="hidden md:flex flex-col items-center justify-center gap-4 px-2 border-r border-hairline/30">
                <GripVertical className="text-mute w-5 h-5" />
                <button 
                  onClick={(e) => { e.stopPropagation(); handleSelectOne(project.id); }}
                  className={`transition-colors ${selectedIds.has(project.id) ? 'text-primary' : 'text-stone hover:text-mute'}`}
                >
                  {selectedIds.has(project.id) ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                </button>
              </div>

              {/* Project Image */}
              <div className="relative w-full lg:w-64 aspect-video lg:aspect-square rounded-xl overflow-hidden border border-hairline shadow-inner shrink-0 bg-surface-soft">
                {project.imageUrl ? (
                  <Image 
                    src={project.imageUrl} 
                    alt={project.title} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 1024px) 100vw, 256px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-mute italic text-xs">No image</div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Project Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-2">
                <div>
                  <h3 className="text-2xl font-black text-ink dark:text-ink group-hover:text-primary transition-colors truncate">
                    {project.title}
                  </h3>
                  <p className="text-sm text-body dark:text-body/70 mt-2 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                  
                  {/* Tech Tags */}
                  {(project.tech || project.technologies) && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {(project.tech || project.technologies)?.slice(0, 5).map((t, idx) => (
                        <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-surface-soft dark:bg-surface-dark text-mute border border-hairline rounded-md">
                          {t}
                        </span>
                      ))}
                      {(project.tech || project.technologies || []).length > 5 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 text-mute">
                          +{(project.tech || project.technologies || []).length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Project Footer Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-hairline/30">
                  <div className="flex items-center gap-3">
                    {project.links?.github && (
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-surface-soft dark:bg-surface-dark hover:text-primary transition-colors">
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                    {project.links?.live && (
                      <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-surface-soft dark:bg-surface-dark hover:text-primary transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleEdit(project)}
                      className="h-9 px-4 hover:bg-primary/5 hover:text-primary"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setDeleteConfirm({ type: 'single', item: project })}
                      className="h-9 px-4 hover:bg-accent-red-soft hover:text-accent-red"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </Button>
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
        title={editingProject ? 'Edit Portfolio Project' : 'Launch New Project'}
        size="lg"
      >
        <ProjectForm 
          initialData={editingProject || undefined} 
          onSubmit={handleFormSubmit} 
          isLoading={isLoading} 
        />
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={!!deleteConfirm} 
        onClose={() => setDeleteConfirm(null)} 
        title="Confirm Removal"
      >
        <div className="space-y-4">
          <p className="text-body font-medium">
            {deleteConfirm?.type === 'single' 
              ? <>Are you sure you want to delete <strong>{deleteConfirm.item?.title}</strong> from your portfolio?</>
              : <>Are you sure you want to delete <strong>{selectedIds.size}</strong> selected projects?</>
            }
          </p>
          <div className="p-4 bg-accent-red-soft/20 rounded-xl border border-accent-red/20 flex gap-3">
             <Info className="w-5 h-5 text-accent-red shrink-0" />
             <p className="text-xs text-accent-red leading-relaxed font-bold uppercase tracking-wider">
               Warning: This action is permanent and cannot be reversed.
             </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
              {deleteConfirm?.type === 'single' ? 'Confirm Deletion' : 'Delete Selected Work'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
