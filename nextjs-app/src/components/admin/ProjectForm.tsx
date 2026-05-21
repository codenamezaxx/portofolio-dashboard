/**
 * ProjectForm Component
 * 
 * Allows admins to manage portfolio projects with validation and image upload.
 */

'use client';

import { useState, useEffect } from 'react';
import { useFormValidation } from '@/lib/useFormValidation';
import { projectSchema, type ProjectInput } from '@/lib/validation';
import { FormField, TextAreaField, SelectField, Button, FormGroup, ImageUpload } from '@/components/ui';
import { FormError, FormSuccess } from '@/components/ui';

interface ProjectFormProps {
  initialData?: ProjectInput;
  onSubmit: (data: ProjectInput) => Promise<void>;
  isLoading?: boolean;
}

const defaultValues: ProjectInput = {
  title: '',
  description: '',
  category: '',
  imageUrl: '',
  technologies: [],
  githubLink: '',
  liveLink: '',
  demoLink: '',
  displayOrder: 0,
};

const categoryOptions = [
  { value: 'Web App', label: 'Web Application' },
  { value: 'Game Dev', label: 'Game Development' },
  { value: 'Mobile', label: 'Mobile App' },
  { value: 'Desktop', label: 'Desktop Application' },
  { value: 'Library', label: 'Library/Package' },
  { value: 'Other', label: 'Other' },
];

export function ProjectForm({
  initialData = defaultValues,
  onSubmit,
  isLoading = false,
}: ProjectFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [techInput, setTechInput] = useState('');

  const form = useFormValidation({
    initialValues: initialData,
    schema: projectSchema,
    onSubmit: async (values) => {
      setSubmitError(null);
      setSubmitSuccess(false);
      try {
        await onSubmit(values);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 5000);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'An error occurred'
        );
      }
    },
  });

  // Sync form values when initialData changes (important for editing)
  useEffect(() => {
    if (initialData) {
      form.setValues(initialData);
    }
  }, [initialData]);

  const handleAddTechnology = () => {
    if (techInput.trim()) {
      const newTechs = [...form.values.technologies, techInput.trim()];
      form.setFieldValue('technologies', newTechs);
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (index: number) => {
    const newTechs = form.values.technologies.filter((_, i) => i !== index);
    form.setFieldValue('technologies', newTechs);
  };

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {submitError && <FormError message={submitError} />}

      {/* Success Alert */}
      {submitSuccess && (
        <FormSuccess message="Project saved successfully!" />
      )}

      {/* Form Fields */}
      <FormGroup>
        <FormField
          label="Project Title"
          name="title"
          type="text"
          placeholder="Enter project title"
          value={form.values.title}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.title}
          touched={form.touched.title}
          required
          variant="admin"
          disabled={isLoading || form.isSubmitting}
        />

        <TextAreaField
          label="Description"
          name="description"
          placeholder="Describe your project"
          value={form.values.description}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.description}
          touched={form.touched.description}
          required
          variant="admin"
          disabled={isLoading || form.isSubmitting}
        />

        <SelectField
          label="Category"
          name="category"
          value={form.values.category}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.category}
          touched={form.touched.category}
          options={categoryOptions}
          placeholder="Select a category"
          required
          variant="admin"
          disabled={isLoading || form.isSubmitting}
        />

        {/* Project Preview Image Upload - Integrated Component */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Gambar Preview Proyek <span className="text-red-500">*</span>
          </label>
          <ImageUpload
            value={form.values.imageUrl}
            onChange={(url) => form.setFieldValue('imageUrl', url)}
            folder="projects"
            disabled={isLoading || form.isSubmitting}
          />
          {form.errors.imageUrl && form.touched.imageUrl && (
            <p className="text-sm text-red-400">{form.errors.imageUrl}</p>
          )}
        </div>

        {/* Technologies */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Technologies <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTechnology();
                }
              }}
              placeholder="Add technology (e.g., React)"
              className="flex-1 px-3 py-2 bg-[var(--surface)] border border-hairline text-[var(--foreground)] rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              disabled={isLoading || form.isSubmitting}
            />
            <button
              type="button"
              onClick={handleAddTechnology}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isLoading || form.isSubmitting || !techInput.trim()}
            >
              Add
            </button>
          </div>
          {form.errors.technologies && form.touched.technologies && (
            <p className="text-sm text-red-400">{form.errors.technologies}</p>
          )}
          {form.values.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.values.technologies.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full"
                >
                  <span className="text-sm text-blue-400">{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnology(index)}
                    className="text-blue-400 hover:text-blue-300 font-bold"
                    disabled={isLoading || form.isSubmitting}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <FormField
          label="GitHub Link"
          name="githubLink"
          type="url"
          placeholder="https://github.com/..."
          value={form.values.githubLink || ''}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.githubLink}
          touched={form.touched.githubLink}
          variant="admin"
          disabled={isLoading || form.isSubmitting}
          helperText="Optional: Link to GitHub repository"
        />

        <FormField
          label="Live Link"
          name="liveLink"
          type="url"
          placeholder="https://example.com"
          value={form.values.liveLink || ''}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.liveLink}
          touched={form.touched.liveLink}
          variant="admin"
          disabled={isLoading || form.isSubmitting}
          helperText="Optional: Link to live project"
        />

        <FormField
          label="Itch.io / Demo Link"
          name="demoLink"
          type="url"
          placeholder="https://codenamezaxx.itch.io/..."
          value={form.values.demoLink || ''}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.demoLink}
          touched={form.touched.demoLink}
          variant="admin"
          disabled={isLoading || form.isSubmitting}
          helperText="Optional: Link to Itch.io game page or demo"
        />
      </FormGroup>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading || form.isSubmitting }
          className="flex-1"
        >
          {form.isSubmitting ? 'Saving...' : 'Save Project'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={form.resetForm}
          disabled={isLoading || form.isSubmitting}
          className="flex-1"
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
