/**
 * Contact Info Editor Component
 * 
 * Allows admins to edit social media and contact information including:
 * - GitHub URL
 * - LinkedIn URL
 * - Instagram URL
 * - Telegram URL
 * - Email address
 * 
 * Features:
 * - Form validation with Zod
 * - URL validation for social links
 * - Test link functionality (open in new tab)
 * - Version history for social links (restore from previous version)
 * - Save/Cancel functionality
 * - Last updated timestamp display
 * - Error handling and user feedback
 * - Accessibility features (ARIA labels, semantic HTML)
 * - Dark mode support via ThemeContext
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import type { ContactInfo } from '@/types';
import { contactInfoSchema } from '@/lib/validation';
import { z } from 'zod';

type ContactInfoFormData = z.infer<typeof contactInfoSchema>;

interface ContactInfoEditorProps {
  initialData?: ContactInfo;
}

interface VersionHistoryRecord {
  id: string;
  contact_info_id: string;
  admin_user_id: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  telegram_url: string | null;
  email: string | null;
  created_at: string;
}

export function ContactInfoEditor({ initialData }: ContactInfoEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ContactInfoFormData>({
    githubUrl: initialData?.githubUrl || '',
    linkedinUrl: initialData?.linkedinUrl || '',
    instagramUrl: initialData?.instagramUrl || '',
    telegramUrl: initialData?.telegramUrl || '',
    email: initialData?.email || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!initialData);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(initialData?.updatedAt ? new Date(initialData.updatedAt) : null);
  const [hasChanges, setHasChanges] = useState(false);
  const [versionHistory, setVersionHistory] = useState<VersionHistoryRecord[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [contactInfoId, setContactInfoId] = useState<string | null>(null);

  // Fetch contact info on mount if not provided
  useEffect(() => {
    if (!initialData) {
      fetchContactInfo();
    } else {
      setContactInfoId(initialData.id || null);
    }
  }, [initialData]);

  const fetchContactInfo = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/content/contact-info', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contact information');
      }

      const res = await response.json();
      const contactInfo = res.data?.[0];

      if (contactInfo) {
        setContactInfoId(contactInfo.id);
        setFormData({
          githubUrl: contactInfo.githubUrl || '',
          linkedinUrl: contactInfo.linkedinUrl || '',
          instagramUrl: contactInfo.instagramUrl || '',
          telegramUrl: contactInfo.telegramUrl || '',
          email: contactInfo.email || '',
        });
        
        if (contactInfo.updatedAt) {
          setLastUpdated(new Date(contactInfo.updatedAt));
        }
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      setErrorMessage('Failed to load contact information. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchVersionHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch('/api/content/contact-info/history?limit=50', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch version history');
      }

      const res = await response.json();
      setVersionHistory(res.data || []);
    } catch (error) {
      console.error('Error fetching version history:', error);
      setErrorMessage('Failed to load version history. Please try again.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleInputChange = (field: keyof ContactInfoFormData, value: string) => {
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

  const validateForm = (): boolean => {
    try {
      contactInfoSchema.parse(formData);
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
      const response = await fetch('/api/content/contact-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          githubUrl: formData.githubUrl || null,
          linkedinUrl: formData.linkedinUrl || null,
          instagramUrl: formData.instagramUrl || null,
          telegramUrl: formData.telegramUrl || null,
          email: formData.email || null,
        }),
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || 'Failed to save contact information');
      }

      const res = await response.json();
      if (res.data?.updatedAt) {
        setLastUpdated(new Date(res.data.updatedAt));
      }
      
      // Refresh version history
      if (showVersionHistory) {
        await fetchVersionHistory();
      }

      setSuccessMessage('Contact information updated successfully!');
      setHasChanges(false);

      // Trigger ISR revalidation
      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});

      // Redirect after success
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (error) {
      console.error('Error saving contact info:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save contact information');
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

  const handleTestLink = (url: string, platform: string) => {
    if (!url) {
      setErrorMessage(`${platform} URL is not set`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShowVersionHistory = async () => {
    if (!showVersionHistory && versionHistory.length === 0) {
      await fetchVersionHistory();
    }
    setShowVersionHistory(!showVersionHistory);
  };

  const handleRestoreVersion = async (version: VersionHistoryRecord) => {
    if (confirm('Are you sure you want to restore this version?')) {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch('/api/content/contact-info/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            versionId: version.id,
          }),
        });

        if (!response.ok) {
          const res = await response.json();
          throw new Error(res.error || 'Failed to restore version');
        }

        const res = await response.json();
        
        // Update form with restored data
        setFormData({
          githubUrl: version.github_url || '',
          linkedinUrl: version.linkedin_url || '',
          instagramUrl: version.instagram_url || '',
          telegramUrl: version.telegram_url || '',
          email: version.email || '',
        });
        
        if (res.data?.updatedAt) {
          setLastUpdated(new Date(res.data.updatedAt));
        }
        setHasChanges(false);
        setShowVersionHistory(false);
        
        // Refresh version history
        await fetchVersionHistory();
        
        setSuccessMessage('Version restored successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Error restoring version:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to restore version');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const formatLastUpdated = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return 'Never';
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumb />
        <span className="text-xs text-[var(--muted)]">
          Last updated: {formatLastUpdated(lastUpdated)}
        </span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Contact Information Editor</h1>
        <p className="text-[var(--muted)] mt-2">
          Manage your social media links and contact information
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
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 space-y-6">
          {/* GitHub URL Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                GitHub URL
              </label>
              {formData.githubUrl && (
                <button
                  type="button"
                  onClick={() => handleTestLink(formData.githubUrl || '', 'GitHub')}
                  disabled={isLoading}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                  aria-label="Test GitHub link"
                >
                  Test Link ↗
                </button>
              )}
            </div>
            <TextInput
              placeholder="https://github.com/username"
              value={formData.githubUrl}
              onChange={(e) => handleInputChange('githubUrl', e.target.value)}
              error={errors.githubUrl}
              disabled={isLoading}
              aria-label="GitHub URL"
              aria-describedby={errors.githubUrl ? 'github-error' : undefined}
            />
            {errors.githubUrl && (
              <p id="github-error" className="text-sm text-red-400 mt-1">
                {errors.githubUrl}
              </p>
            )}
          </div>

          {/* LinkedIn URL Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                LinkedIn URL
              </label>
              {formData.linkedinUrl && (
                <button
                  type="button"
                  onClick={() => handleTestLink(formData.linkedinUrl || '', 'LinkedIn')}
                  disabled={isLoading}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                  aria-label="Test LinkedIn link"
                >
                  Test Link ↗
                </button>
              )}
            </div>
            <TextInput
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
              error={errors.linkedinUrl}
              disabled={isLoading}
              aria-label="LinkedIn URL"
              aria-describedby={errors.linkedinUrl ? 'linkedin-error' : undefined}
            />
            {errors.linkedinUrl && (
              <p id="linkedin-error" className="text-sm text-red-400 mt-1">
                {errors.linkedinUrl}
              </p>
            )}
          </div>

          {/* Instagram URL Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Instagram URL
              </label>
              {formData.instagramUrl && (
                <button
                  type="button"
                  onClick={() => handleTestLink(formData.instagramUrl || '', 'Instagram')}
                  disabled={isLoading}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                  aria-label="Test Instagram link"
                >
                  Test Link ↗
                </button>
              )}
            </div>
            <TextInput
              placeholder="https://instagram.com/username"
              value={formData.instagramUrl}
              onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
              error={errors.instagramUrl}
              disabled={isLoading}
              aria-label="Instagram URL"
              aria-describedby={errors.instagramUrl ? 'instagram-error' : undefined}
            />
            {errors.instagramUrl && (
              <p id="instagram-error" className="text-sm text-red-400 mt-1">
                {errors.instagramUrl}
              </p>
            )}
          </div>

          {/* Telegram URL Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Telegram URL
              </label>
              {formData.telegramUrl && (
                <button
                  type="button"
                  onClick={() => handleTestLink(formData.telegramUrl || '', 'Telegram')}
                  disabled={isLoading}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                  aria-label="Test Telegram link"
                >
                  Test Link ↗
                </button>
              )}
            </div>
            <TextInput
              placeholder="https://t.me/username"
              value={formData.telegramUrl}
              onChange={(e) => handleInputChange('telegramUrl', e.target.value)}
              error={errors.telegramUrl}
              disabled={isLoading}
              aria-label="Telegram URL"
              aria-describedby={errors.telegramUrl ? 'telegram-error' : undefined}
            />
            {errors.telegramUrl && (
              <p id="telegram-error" className="text-sm text-red-400 mt-1">
                {errors.telegramUrl}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Email Address
            </label>
            <TextInput
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              disabled={isLoading}
              aria-label="Email address"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-400 mt-1">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 justify-between">
          <button
            type="button"
            onClick={handleShowVersionHistory}
            disabled={isLoading || isLoadingHistory}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Show version history"
          >
            {isLoadingHistory ? 'Loading...' : showVersionHistory ? 'Hide' : 'Show'} Version History ({versionHistory.length})
          </button>
          <div className="flex gap-3">
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
              aria-label="Save contact information changes"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>

      {/* Version History */}
      {showVersionHistory && versionHistory.length > 0 && (
        <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Version History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {versionHistory.map((version, index) => (
              <div
                key={version.id}
                className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {new Date(version.created_at).toLocaleDateString()} {new Date(version.created_at).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {Object.values({
                      github: version.github_url,
                      linkedin: version.linkedin_url,
                      instagram: version.instagram_url,
                      telegram: version.telegram_url,
                      email: version.email,
                    }).filter(v => v).length} fields set
                  </p>
                </div>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRestoreVersion(version)}
                    disabled={isLoading}
                    className="ml-4 px-3 py-1 text-xs bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded transition-colors disabled:opacity-50"
                    aria-label="Restore this version"
                  >
                    Restore
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          <span className="font-semibold text-blue-400">💡 Tip:</span> Make sure your social media URLs are correct and publicly accessible. You can test each link by clicking the "Test Link" button next to each field.
        </p>
      </div>
    </div>
  );
}
