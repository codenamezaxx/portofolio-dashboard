/**
 * Hero Editor Component
 * 
 * Allows admins to edit the hero section content including:
 * - Name
 * - Role
 * - Tagline
 * - Hero image upload
 * 
 * Features:
 * - Form validation with Zod
 * - Image upload with preview
 * - Save/Cancel functionality
 * - Last updated timestamp display
 * - Error handling and user feedback
 * - Accessibility features (ARIA labels, semantic HTML)
 * - Dark mode support via ThemeContext
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { TextInput } from '@/components/ui/TextInput';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import type { Profile } from '@/types';
import { z } from 'zod';

// Validation schema for hero content
const HeroSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  role: z.string().min(1, 'Role is required').max(255, 'Role must be less than 255 characters'),
  tagline: z.string().min(1, 'Tagline is required').max(500, 'Tagline must be less than 500 characters'),
  heroImageUrl: z.string().optional().nullable(),
});

type HeroFormData = z.infer<typeof HeroSchema>;

interface HeroEditorProps {
  initialData?: Profile;
}

export function HeroEditor({ initialData }: HeroEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<HeroFormData>({
    name: initialData?.name || '',
    role: initialData?.role || '',
    tagline: initialData?.tagline || '',
    heroImageUrl: initialData?.heroImageUrl || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!initialData);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(initialData?.updatedAt ? new Date(initialData.updatedAt) : null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.heroImageUrl || null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch hero data on mount if not provided
  useEffect(() => {
    if (!initialData) {
      fetchHeroData();
    }
  }, [initialData]);

  const fetchHeroData = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/content/profiles', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hero data');
      }

      const data = await response.json();
      const profile = data.data?.[0];

      if (profile) {
        setFormData({
          name: profile.name || '',
          role: profile.role || '',
          tagline: profile.tagline || '',
          heroImageUrl: profile.heroImageUrl || null,
        });
        setImagePreview(profile.heroImageUrl || null);
        setLastUpdated(new Date(profile.updatedAt));
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
      setErrorMessage('Failed to load hero data. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (field: keyof HeroFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (result: { url: string; filename: string }) => {
    setFormData((prev) => ({
      ...prev,
      heroImageUrl: result.url,
    }));
    setImagePreview(result.url);
    setHasChanges(true);
    setSuccessMessage('Image uploaded successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleImageError = (error: Error) => {
    setErrorMessage(`Image upload failed: ${error.message}`);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const validateForm = (): boolean => {
    try {
      HeroSchema.parse(formData);
      setErrors({});
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
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/content/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save hero data');
      }

      const data = await response.json();
      setLastUpdated(new Date(data.data.updatedAt));
      setSuccessMessage('Hero section updated successfully!');
      setHasChanges(false);

      // Trigger ISR revalidation so public page reflects changes immediately
      await fetch('/api/revalidate', {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {}); // Non-blocking — don't fail save if revalidate fails

      // Redirect after success
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (error) {
      console.error('Error saving hero data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save hero data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        router.back();
      }
    } else {
      router.back();
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
      <div className="flex items-center justify-between">
        <Breadcrumb />
        <span className="text-xs text-mute dark:text-mute">
          {lastUpdated && `Last updated: ${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`}
        </span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink dark:text-ink">Hero Section Editor</h1>
        <p className="text-body dark:text-body mt-2">
          Edit your profile information that appears on the hero section of your portfolio
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <FormSuccess message={successMessage} />
      )}

      {/* Error Message */}
      {errorMessage && (
        <FormError message={errorMessage} />
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md p-6 space-y-6">
          {/* Name Field */}
          <div>
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              disabled={isLoading}
              required
              aria-label="Full name"
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-red-400 mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <TextInput
              label="Professional Role"
              placeholder="e.g., Front-End Web Developer"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              error={errors.role}
              disabled={isLoading}
              required
              aria-label="Professional role"
              aria-describedby={errors.role ? 'role-error' : undefined}
            />
            {errors.role && (
              <p id="role-error" className="text-sm text-red-400 mt-1">
                {errors.role}
              </p>
            )}
          </div>

          {/* Tagline Field */}
          <div>
            <TextArea
              label="Tagline"
              placeholder="Enter a brief tagline or description about yourself"
              value={formData.tagline}
              onChange={(e) => handleInputChange('tagline', e.target.value)}
              error={errors.tagline}
              disabled={isLoading}
              required
              rows={3}
              aria-label="Tagline"
              aria-describedby={errors.tagline ? 'tagline-error' : undefined}
            />
            {errors.tagline && (
              <p id="tagline-error" className="text-sm text-red-400 mt-1">
                {errors.tagline}
              </p>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
                Hero Image
              </label>
              <p className="text-xs text-[var(--muted)] mb-4">
                Upload a profile or hero image (JPG, PNG, WebP, SVG - Max 5MB)
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative w-full h-64 bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Hero image preview"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData((prev) => ({
                      ...prev,
                      heroImageUrl: null,
                    }));
                    setHasChanges(true);
                  }}
                  disabled={isLoading}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Image Upload Component */}
            <ImageUpload
              onUpload={handleImageUpload}
              onError={handleImageError}
              maxSize={5 * 1024 * 1024}
              acceptedFormats={['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']}
              disabled={isLoading}
              folder="hero"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            variant="secondary"
            aria-label="Cancel editing"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !hasChanges}
            aria-label="Save hero section changes"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          <span className="font-semibold text-blue-400">💡 Tip:</span> The hero section is the first thing visitors see on your portfolio. Make sure your name, role, and tagline clearly represent your professional identity.
        </p>
      </div>
    </div>
  );
}
