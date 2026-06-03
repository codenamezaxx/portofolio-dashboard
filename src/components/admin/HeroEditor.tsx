/**
 * Hero Editor Component
 * 
 * Allows admins to edit the hero section content including:
 * - Name
 * - Role
 * - Tagline
 * - Hero image upload
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
import { 
  Rocket, 
  Sparkles, 
  Clock, 
  Monitor, 
  Save, 
  X, 
  Eye,
  Info
} from 'lucide-react';

// Validation schema for hero content
const HeroSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  role: z.string().min(1, 'Role is required').max(255, 'Role must be less than 255 characters'),
  tagline: z.string().min(1, 'Tagline is required').max(500, 'Tagline must be less than 500 characters'),
  status_label: z.string().max(50, 'Status label must be less than 50 characters').optional().nullable(),
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
    status_label: initialData?.status_label || '',
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
          status_label: profile.status_label || '',
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

      await fetch('/api/revalidate', {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {});

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Breadcrumb Navigation & Last Updated */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {lastUpdated && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-soft dark:bg-surface-soft border border-hairline rounded-full">
            <Clock className="w-3.5 h-3.5 text-mute" />
            <span className="text-[10px] font-black text-mute uppercase tracking-widest">
              Last Updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Rocket className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-ink tracking-tight">Hero Section Editor</h1>
          <p className="text-body dark:text-body font-medium mt-1">
            Refine your digital identity and professional introduction
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Form Card */}
        <div className="order-2 lg:order-1 space-y-6">
          {successMessage && <FormSuccess message={successMessage} />}
          {errorMessage && <FormError message={errorMessage} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-primary/5 dark:bg-white/5 backdrop-blur-md border border-primary/10 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-md space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-black text-mute uppercase tracking-[0.2em]">Profile Content</h3>
              </div>

              <TextInput
                label="Status Label"
                placeholder="e.g., Open to work"
                value={formData.status_label || ''}
                onChange={(e) => handleInputChange('status_label', e.target.value)}
                error={errors.status_label}
                disabled={isLoading}
                className="h-11 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />

              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                disabled={isLoading}
                required
                className="h-11 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />

              <TextInput
                label="Professional Role"
                placeholder="e.g., Senior Full-Stack Developer"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                error={errors.role}
                disabled={isLoading}
                required
                className="h-11 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />

              <TextArea
                label="Tagline / Introduction"
                placeholder="Briefly describe your expertise and professional mission..."
                value={formData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                error={errors.tagline}
                disabled={isLoading}
                required
                rows={4}
                className="focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[120px]"
              />

              {/* Image Upload */}
              <div className="space-y-4 pt-4 border-t border-hairline/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-mute uppercase tracking-wider">
                    Hero Presentation Image
                  </label>
                  <span className="text-[10px] text-stone">Max 5MB • JPG, PNG, WebP</span>
                </div>

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
            <div className="flex items-center justify-end gap-4 pt-2">
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                variant="ghost"
                className="px-6 hover:bg-surface-soft"
              >
                <X className="w-4 h-4 mr-2" /> Discard
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="px-8 shadow-lg shadow-primary/20 transition-all duration-300 active:scale-95 disabled:shadow-none"
              >
                {isLoading ? (
                  <>Saving Changes...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Tip Box */}
          <div className="p-5 rounded-2xl bg-accent-blue-soft/20 border border-accent-blue/10 flex gap-4">
            <Info className="w-6 h-6 text-accent-blue flex-shrink-0" />
            <p className="text-xs text-body leading-relaxed">
              <span className="font-black text-accent-blue uppercase tracking-wider block mb-1">UI/UX Tip</span>
              The hero section is the digital face of your portfolio. Use a high-quality professional image and a tagline that highlights your unique value proposition.
            </p>
          </div>
        </div>

        {/* Right Column: Live Preview Card */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Eye className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-black text-mute uppercase tracking-[0.2em]">Live Mockup</h3>
          </div>

          <div className="relative group rounded-3xl border border-hairline overflow-hidden shadow-2xl bg-canvas dark:bg-surface-dark">
            {/* Browser Header Mockup */}
            <div className="bg-surface-soft dark:bg-surface-card px-4 py-3 border-b border-hairline flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 max-w-[200px] mx-auto h-5 bg-white/50 dark:bg-white/5 rounded-md border border-hairline flex items-center px-2">
                <div className="w-2 h-2 rounded-full bg-mute/30 mr-2" />
                <div className="w-full h-1 bg-mute/20 rounded-full" />
              </div>
            </div>

            {/* Hero Mockup Content */}
            <div className="relative p-8 md:p-12 min-h-[400px] flex flex-col justify-center overflow-hidden">
              {/* Background Ambient Glow */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-accent-blue/10 rounded-full blur-[60px]" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                  <Monitor className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {formData.status_label || 'Status Label'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-4xl md:text-5xl font-black text-ink dark:text-ink tracking-tight break-words">
                    {formData.name || 'Your Name'}
                  </h4>
                  <p className="text-xl md:text-2xl font-bold text-primary italic">
                    {formData.role || 'Your Professional Role'}
                  </p>
                </div>

                <p className="text-base text-body dark:text-body/80 max-w-md leading-relaxed font-medium">
                  {formData.tagline || 'Your compelling tagline will appear here to introduce you to your visitors...'}
                </p>

                {/* Hero Image Mockup */}
                {imagePreview && (
                  <div className="mt-8 relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-xl group-hover:scale-[1.02] transition-transform duration-500">
                    <Image
                      src={imagePreview}
                      alt="Mockup hero"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats / Info Badges */}
          <div className="grid grid-cols-2 gap-4 mt-6">
             <div className="p-4 rounded-2xl bg-surface-card dark:bg-surface-card border border-hairline shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-mute uppercase tracking-widest">Visibility</p>
                   <p className="text-xs font-bold text-ink dark:text-ink">Live on Portfolio</p>
                </div>
             </div>
             <div className="p-4 rounded-2xl bg-surface-card dark:bg-surface-card border border-hairline shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                   <Save className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-mute uppercase tracking-widest">Changes</p>
                   <p className="text-xs font-bold text-ink dark:text-ink">{hasChanges ? 'Unsaved Edits' : 'Up to date'}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
