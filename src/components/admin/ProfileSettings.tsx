/**
 * Profile Settings Component
 * 
 * Provides quick access to profile management options including:
 * - Change password
 * - Security settings
 * - Session management
 * - Account preferences
 * - Resume/CV upload
 * - Logout
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/lib/useLogout';
import Swal from 'sweetalert2';
import { Modal, Button } from '@/components/ui';
import type { AdminUser } from '@/types';

interface ProfileSettingsProps {
  user: AdminUser;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const { logout, isLoading: isLoggingOut, error: logoutError } = useLogout();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordForm.currentPassword) {
      await Swal.fire({
        icon: 'warning',
        title: 'Oops!',
        text: 'Current password is required',
        confirmButtonColor: '#B8860B',
        background: 'var(--background)',
        color: 'var(--foreground)',
      });
      return;
    }

    if (!passwordForm.newPassword) {
      await Swal.fire({
        icon: 'warning',
        title: 'Oops!',
        text: 'New password is required',
        confirmButtonColor: '#B8860B',
        background: 'var(--background)',
        color: 'var(--foreground)',
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      await Swal.fire({
        icon: 'warning',
        title: 'Password Terlalu Pendek',
        text: 'New password must be at least 8 characters',
        confirmButtonColor: '#B8860B',
        background: 'var(--background)',
        color: 'var(--foreground)',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      await Swal.fire({
        icon: 'error',
        title: 'Password Tidak Cocok',
        text: 'Passwords do not match',
        confirmButtonColor: '#B8860B',
        background: 'var(--background)',
        color: 'var(--foreground)',
      });
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      await Swal.fire({
        icon: 'warning',
        title: 'Password Sama',
        text: 'New password must be different from current password',
        confirmButtonColor: '#B8860B',
        background: 'var(--background)',
        color: 'var(--foreground)',
      });
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      icon: 'question',
      title: 'Ubah Password?',
      text: 'Apakah Anda yakin ingin mengubah password?',
      showCancelButton: true,
      confirmButtonColor: '#B8860B',
      cancelButtonColor: '#8B7355',
      confirmButtonText: 'Ya, Ubah',
      cancelButtonText: 'Batal',
      background: 'var(--background)',
      color: 'var(--foreground)',
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Password berhasil diubah',
          confirmButtonColor: '#B8860B',
          background: 'var(--background)',
          color: 'var(--foreground)',
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowChangePassword(false);
      } else {
        const data = await response.json();
        await Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: data.error || 'Failed to change password',
          confirmButtonColor: '#B8860B',
          background: 'var(--background)',
          color: 'var(--foreground)',
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An error occurred while changing password',
        confirmButtonColor: '#B8860B',
        background: 'var(--background)',
        color: 'var(--foreground)',
      });
      console.error('Password change error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Keluar',
      text: 'Sesi admin Anda akan diakhiri.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#cd4239',
      cancelButtonColor: '#8B7355',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      background: 'var(--background)',
      color: 'var(--foreground)',
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Resume upload started', { resumeFile });

    if (!resumeFile) {
      await Swal.fire({
        icon: 'warning',
        title: 'File Tidak Dipilih',
        text: 'Please select a PDF file',
        confirmButtonColor: '#B8860B',
        background: 'var(--background)',
        color: 'var(--foreground)',
      });
      return;
    }

    if (resumeFile.type !== 'application/pdf') {
      await Swal.fire({
        icon: 'error',
        title: 'Format Salah',
        text: 'Only PDF files are allowed',
        confirmButtonColor: '#B8860B',
        background: 'var(--background)',
        color: 'var(--foreground)',
      });
      return;
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      await Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: 'File size must be less than 5MB',
        confirmButtonColor: '#B8860B',
        background: 'var(--background)',
        color: 'var(--foreground)',
      });
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      icon: 'question',
      title: 'Upload Resume?',
      text: `Apakah Anda yakin ingin upload file "${resumeFile.name}"?`,
      showCancelButton: true,
      confirmButtonColor: '#B8860B',
      cancelButtonColor: '#8B7355',
      confirmButtonText: 'Ya, Upload',
      cancelButtonText: 'Batal',
      background: 'var(--background)',
      color: 'var(--foreground)',
    });

    if (!result.isConfirmed) return;

    setIsUploadingResume(true);

    // Show loading dialog
    Swal.fire({
      title: 'Uploading...',
      html: 'Mohon tunggu, file sedang diupload',
      allowOutsideClick: false,
      allowEscapeKey: false,
      background: 'var(--background)',
      color: 'var(--foreground)',
      didOpen: async () => {
        Swal.showLoading();

        try {
          console.log('Creating FormData and uploading to /api/upload/pdf');
          const formData = new FormData();
          formData.append('file', resumeFile);
          formData.append('folder', 'resumes');

          const uploadResponse = await fetch('/api/upload/pdf', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          console.log('Upload response status:', uploadResponse.status);

          if (!uploadResponse.ok) {
            const data = await uploadResponse.json();
            console.error('Upload failed:', data);
            Swal.hideLoading();
            await Swal.fire({
              icon: 'error',
              title: 'Upload Gagal',
              text: data.error || `Upload failed with status ${uploadResponse.status}`,
              confirmButtonColor: '#B8860B',
              background: 'var(--background)',
              color: 'var(--foreground)',
            });
            setIsUploadingResume(false);
            return;
          }

          const uploadData = await uploadResponse.json();
          console.log('Upload successful, got URL:', uploadData.url);
          const resumeUrl = uploadData.url;

          // Update profile with resume URL
          console.log('Updating profile with resume URL');
          const updateResponse = await fetch('/api/content/profile-resume', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ resume_url: resumeUrl }),
          });

          console.log('Update response status:', updateResponse.status);

          if (updateResponse.ok) {
            console.log('Resume update successful');
            // Trigger refresh event for CV preview component
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('cv-uploaded'));
            }
            Swal.hideLoading();
            await Swal.fire({
              icon: 'success',
              title: 'Berhasil!',
              text: 'Resume berhasil diupload',
              confirmButtonColor: '#B8860B',
              background: 'var(--background)',
              color: 'var(--foreground)',
            });
            setResumeFile(null);
            setShowResumeUpload(false);
            router.refresh();
          } else {
            const data = await updateResponse.json();
            console.error('Update failed:', data);
            Swal.hideLoading();
            await Swal.fire({
              icon: 'error',
              title: 'Gagal Menyimpan',
              text: data.error || `Update failed with status ${updateResponse.status}`,
              confirmButtonColor: '#B8860B',
              background: 'var(--background)',
              color: 'var(--foreground)',
            });
          }
        } catch (error) {
          console.error('Resume upload error:', error);
          Swal.hideLoading();
          await Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred while uploading resume',
            confirmButtonColor: '#B8860B',
            background: 'var(--background)',
            color: 'var(--foreground)',
          });
        } finally {
          setIsUploadingResume(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <div className="bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md p-6">
        <h3 className="text-heading-md font-bold text-ink dark:text-ink mb-6 flex items-center gap-3">
          Settings
        </h3>

        <div className="space-y-3">
          {/* Upload Resume Button */}
          <button
            onClick={() => setShowResumeUpload(true)}
            className="w-full px-6 py-4 text-left bg-surface-card dark:bg-surface-card hover:bg-surface-soft dark:hover:bg-surface-soft border border-hairline dark:border-hairline rounded-md transition-all duration-300 group hover:border-stone dark:hover:border-stone"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-body-strong text-body-md text-ink dark:text-ink">
                    Upload Resume/CV
                  </p>
                </div>
              </div>
              <span className="text-2xl text-mute dark:text-mute group-hover:text-primary dark:group-hover:text-primary transition-colors">
                →
              </span>
            </div>
          </button>

          {/* Change Password Button */}
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full px-6 py-4 text-left bg-surface-card dark:bg-surface-card hover:bg-surface-soft dark:hover:bg-surface-soft border border-hairline dark:border-hairline rounded-md transition-all duration-300 group hover:border-stone dark:hover:border-stone"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-body-strong text-body-md text-ink dark:text-ink">
                    Change Password
                  </p>
                </div>
              </div>
              <span className="text-2xl text-mute dark:text-mute group-hover:text-primary dark:group-hover:text-primary transition-colors">
                →
              </span>
            </div>
          </button>

          {/* Security Settings Link */}
          <Link
            href="/admin/security"
            className="w-full px-6 py-4 text-left bg-surface-card dark:bg-surface-card hover:bg-surface-soft dark:hover:bg-surface-soft border border-hairline dark:border-hairline rounded-md transition-all duration-300 group hover:border-stone dark:hover:border-stone block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-body-strong text-body-md text-ink dark:text-ink">
                    Security Settings
                  </p>
                </div>
              </div>
              <span className="text-2xl text-mute dark:text-mute group-hover:text-primary dark:group-hover:text-primary transition-colors">
                →
              </span>
            </div>
          </Link>

          {/* Sessions Link */}
          <Link
            href="/admin/sessions"
            className="w-full px-6 py-4 text-left bg-surface-card dark:bg-surface-card hover:bg-surface-soft dark:hover:bg-surface-soft border border-hairline dark:border-hairline rounded-md transition-all duration-300 group hover:border-stone dark:hover:border-stone block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-body-strong text-body-md text-ink dark:text-ink">
                    Active Sessions
                  </p>
                </div>
              </div>
              <span className="text-2xl text-mute dark:text-mute group-hover:text-primary dark:group-hover:text-primary transition-colors">
                →
              </span>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-6 py-4 text-left bg-accent-red-soft dark:bg-accent-red-soft hover:bg-accent-red/20 dark:hover:bg-accent-red/20 border border-accent-red/40 dark:border-accent-red/40 rounded-md transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent-red/60 dark:hover:border-accent-red/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-body-strong text-body-md text-accent-red dark:text-accent-red">
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </p>
                </div>
              </div>
              <span className="text-2xl text-accent-red/70 dark:text-accent-red/70 group-hover:text-accent-red dark:group-hover:text-accent-red transition-colors">
                →
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Logout Error Alert */}
      {logoutError && (
        <div className="bg-accent-red-soft dark:bg-accent-red-soft border border-accent-red/30 dark:border-accent-red/30 rounded-md p-4">
          <p className="text-sm text-accent-red dark:text-accent-red">{logoutError}</p>
        </div>
      )}

      {/* Resume Upload Modal */}
      <Modal
        isOpen={showResumeUpload}
        onClose={() => {
          setShowResumeUpload(false);
          setResumeFile(null);
        }}
        title="Upload Resume/CV"
      >
        <form onSubmit={handleResumeUpload} className="space-y-6">
          <div>
            <label className="block text-body-strong text-ink dark:text-ink mb-3">
              Select PDF File
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 bg-surface-card dark:bg-surface-card border-2 border-dashed border-hairline dark:border-hairline rounded-md text-ink dark:text-ink focus:outline-none focus:border-accent-blue dark:focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 dark:focus:ring-accent-blue/20 transition-all duration-300 cursor-pointer hover:border-stone dark:hover:border-stone"
              disabled={isUploadingResume}
            />
            <p className="text-body-xs text-body dark:text-body mt-2">
              Maximum file size: 5MB. Only PDF files are allowed.
            </p>
          </div>

          {resumeFile && (
            <div className="p-4 bg-accent-blue-soft dark:bg-accent-blue-soft border border-accent-blue/30 dark:border-accent-blue/30 rounded-md">
              <p className="text-sm text-accent-blue dark:text-accent-blue font-medium">
                📄 {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)}MB)
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isUploadingResume || !resumeFile}
              isLoading={isUploadingResume}
              className="flex-1"
            >
              Upload Resume
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowResumeUpload(false);
                setResumeFile(null);
              }}
              disabled={isUploadingResume}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => {
          setShowChangePassword(false);
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }}
        title="Change Password"
      >
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-body-strong text-ink dark:text-ink mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md text-ink dark:text-ink placeholder-mute dark:placeholder-mute focus:outline-none focus:border-accent-blue dark:focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 dark:focus:ring-accent-blue/20 transition-all duration-300"
              placeholder="Enter current password"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-body-strong text-ink dark:text-ink mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md text-ink dark:text-ink placeholder-mute dark:placeholder-mute focus:outline-none focus:border-accent-blue dark:focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 dark:focus:ring-accent-blue/20 transition-all duration-300"
              placeholder="Enter new password (min 8 characters)"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-body-strong text-ink dark:text-ink mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md text-ink dark:text-ink placeholder-mute dark:placeholder-mute focus:outline-none focus:border-accent-blue dark:focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 dark:focus:ring-accent-blue/20 transition-all duration-300"
              placeholder="Confirm new password"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="flex-1"
            >
              Update Password
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowChangePassword(false);
                setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Info Card */}
      <div className="bg-accent-blue-soft dark:bg-accent-blue-soft border border-accent-blue/30 dark:border-accent-blue/30 rounded-md p-6">
        <p className="text-sm text-body dark:text-body leading-relaxed">
          <span className="font-body-strong text-accent-blue dark:text-accent-blue">Tip:</span> Keep your password
          secure and change it regularly. Never share your credentials with anyone.
        </p>
      </div>
    </div>
  );
}
