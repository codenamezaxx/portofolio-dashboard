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
import Badge from '@/components/ui/Badge';
import type { ContactInfo } from '@/types';
import { contactInfoSchema } from '@/lib/validation';
import { z } from 'zod';
import { 
  Mail, 
  Send, 
  History, 
  ExternalLink,
  Clock,
  AlertCircle,
  Settings,
  RotateCcw
} from 'lucide-react';
import { 
  GithubIcon, 
  LinkedinIcon, 
  InstagramIcon 
} from '@/components/ui/Icons';

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

  // Fetch contact info on mount if not provided
  useEffect(() => {
    if (!initialData) {
      fetchContactInfo();
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
      const response = await fetch('/api/content/contact-info/history?limit=5', {
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
      
      if (showVersionHistory) {
        await fetchVersionHistory();
      }

      setSuccessMessage('Contact information updated successfully!');
      setHasChanges(false);

      await fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {});

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
    <div className="space-y-8 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[var(--foreground)] mt-2 tracking-tight">Contact Center</h1>
            <p className="text-[var(--muted)] font-medium">Manage social connectivity and incoming inquiries</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
            Last Sync: {formatLastUpdated(lastUpdated)}
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-8 items-start">
        
        {/* Left Column: Configuration Form */}
        <div className="lg:col-span-1 space-y-6 w-full">
          <div className="bg-primary/5 dark:bg-white/5 backdrop-blur-md border border-primary/10 rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Social Links</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* GitHub */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-mute flex items-center gap-2">
                    <GithubIcon className="w-3 h-3" /> GitHub
                  </label>
                  {formData.githubUrl && (
                    <button 
                      type="button" 
                      onClick={() => handleTestLink(formData.githubUrl || '', 'GitHub')}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Test Link <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mute group-focus-within:text-primary transition-colors z-10">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <TextInput
                    placeholder="https://github.com/..."
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    error={errors.githubUrl}
                    disabled={isLoading}
                    className="pl-10 h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-mute flex items-center gap-2">
                    <LinkedinIcon className="w-3 h-3" /> LinkedIn
                  </label>
                  {formData.linkedinUrl && (
                    <button 
                      type="button" 
                      onClick={() => handleTestLink(formData.linkedinUrl || '', 'LinkedIn')}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Test Link <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mute group-focus-within:text-primary transition-colors z-10">
                    <LinkedinIcon className="w-4 h-4" />
                  </div>
                  <TextInput
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    error={errors.linkedinUrl}
                    disabled={isLoading}
                    className="pl-10 h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-mute flex items-center gap-2">
                    <InstagramIcon className="w-3 h-3" /> Instagram
                  </label>
                  {formData.instagramUrl && (
                    <button 
                      type="button" 
                      onClick={() => handleTestLink(formData.instagramUrl || '', 'Instagram')}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Test Link <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mute group-focus-within:text-primary transition-colors z-10">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <TextInput
                    placeholder="https://instagram.com/..."
                    value={formData.instagramUrl}
                    onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                    error={errors.instagramUrl}
                    disabled={isLoading}
                    className="pl-10 h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl"
                  />
                </div>
              </div>

              {/* Telegram */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-mute flex items-center gap-2">
                    <Send className="w-3 h-3" /> Telegram
                  </label>
                  {formData.telegramUrl && (
                    <button 
                      type="button" 
                      onClick={() => handleTestLink(formData.telegramUrl || '', 'Telegram')}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Test Link <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mute group-focus-within:text-primary transition-colors z-10">
                    <Send className="w-4 h-4" />
                  </div>
                  <TextInput
                    placeholder="https://t.me/..."
                    value={formData.telegramUrl}
                    onChange={(e) => handleInputChange('telegramUrl', e.target.value)}
                    error={errors.telegramUrl}
                    disabled={isLoading}
                    className="pl-10 h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-mute flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mute group-focus-within:text-primary transition-colors z-10">
                    <Mail className="w-4 h-4" />
                  </div>
                  <TextInput
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    disabled={isLoading}
                    className="pl-10 h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || !hasChanges}
                  className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 font-bold"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Save Configuration'}
                </Button>
                
                <button
                  type="button"
                  onClick={handleShowVersionHistory}
                  className="text-xs font-bold text-mute hover:text-primary transition-colors flex items-center justify-center gap-2 py-2"
                >
                  <History className="w-3.5 h-3.5" />
                  {showVersionHistory ? 'Hide' : 'View'} Version History
                </button>
              </div>
            </form>
          </div>

          {/* Version History (Conditional) */}
          {showVersionHistory && (
            <div className="bg-surface-card border border-hairline rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-sm font-black uppercase tracking-widest text-ink">Revision History</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingHistory ? (
                   <div className="flex justify-center py-8"><LoadingSpinner size="sm" /></div>
                ) : versionHistory.length === 0 ? (
                   <p className="text-xs text-mute text-center py-4">No previous versions found.</p>
                ) : (
                  versionHistory.map((version) => (
                    <div key={version.id} className="p-3 bg-surface-soft border border-hairline rounded-xl flex items-center justify-between group">
                      <div>
                        <p className="text-xs font-bold text-ink">{new Date(version.created_at).toLocaleDateString()}</p>
                        <p className="text-[10px] text-mute uppercase font-black">{new Date(version.created_at).toLocaleTimeString()}</p>
                      </div>
                      <button
                        onClick={() => handleRestoreVersion(version)}
                        className="p-1.5 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/20"
                        title="Restore this version"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tip Box */}
          <div className="bg-accent-blue/5 border border-accent-blue/10 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-accent-blue shrink-0" />
            <p className="text-xs text-accent-blue/80 leading-relaxed">
              <strong>Pro Tip:</strong> Verified social links increase trust. Always use the "Test Link" feature before saving changes to ensure your connections are active.
            </p>
          </div>
        </div>
      </div>

      {/* Form Feedback */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {successMessage && (
          <div className="pointer-events-auto animate-in slide-in-from-right-full duration-500">
            <FormSuccess message={successMessage} />
          </div>
        )}
        {errorMessage && (
          <div className="pointer-events-auto animate-in slide-in-from-right-full duration-500">
            <FormError message={errorMessage} />
          </div>
        )}
      </div>
    </div>
  );
}
