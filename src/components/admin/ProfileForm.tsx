/**
 * ProfileForm Component
 * 
 * Example form component demonstrating Zod validation integration.
 * Manages hero section profile data (name, role, tagline, hero image).
 */

'use client';

import { useState } from 'react';
import { useFormValidation } from '@/lib/useFormValidation';
import { profileSchema, type ProfileInput } from '@/lib/validation';
import { FormField, TextAreaField, Button, FormGroup, ImageUpload } from '@/components/ui';
import { FormError, FormSuccess } from '@/components/ui';

interface ProfileFormProps {
  initialData?: ProfileInput;
  onSubmit: (data: ProfileInput) => Promise<void>;
  isLoading?: boolean;
}

const defaultValues: ProfileInput = {
  name: '',
  role: '',
  tagline: '',
  heroImageUrl: '',
};

export function ProfileForm({
  initialData = defaultValues,
  onSubmit,
  isLoading = false,
}: ProfileFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useFormValidation({
    initialValues: initialData,
    schema: profileSchema,
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

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {submitError && (
        <FormError message={submitError} />
      )}

      {/* Success Alert */}
      {submitSuccess && (
        <FormSuccess message="Profile updated successfully!" />
      )}

      {/* Form Fields */}
      <FormGroup>
        <FormField
          label="Full Name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={form.values.name}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.name}
          touched={form.touched.name}
          required
          variant="admin"
          disabled={isLoading || form.isSubmitting}
        />

        <FormField
          label="Professional Role"
          name="role"
          type="text"
          placeholder="e.g., Front-End Developer"
          value={form.values.role}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.role}
          touched={form.touched.role}
          required
          variant="admin"
          disabled={isLoading || form.isSubmitting}
        />

        <TextAreaField
          label="Tagline"
          name="tagline"
          placeholder="A brief description about yourself"
          value={form.values.tagline}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.tagline}
          touched={form.touched.tagline}
          required
          variant="admin"
          disabled={isLoading || form.isSubmitting}
        />

        {/* Hero Image Upload - Integrated Component */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Hero Image <span className="text-red-500">*</span>
          </label>
          <ImageUpload
            value={form.values.heroImageUrl}
            onChange={(url) => form.setFieldValue('heroImageUrl', url)}
            folder="profile"
            disabled={isLoading || form.isSubmitting}
          />
          {form.errors.heroImageUrl && form.touched.heroImageUrl && (
            <p className="text-sm text-red-400">{form.errors.heroImageUrl}</p>
          )}
          <p className="text-xs text-[var(--muted)]">
            Optional: Upload a hero section image
          </p>
        </div>
      </FormGroup>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading || form.isSubmitting || !form.isValid}
          className="flex-1"
        >
          {form.isSubmitting ? 'Saving...' : 'Save Profile'}
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
