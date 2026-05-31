/**
 * User Manager Component
 * 
 * Manages admin users with:
 * - List users
 * - Add user
 * - Edit user
 * - Delete user
 * - Password validation
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Users, Plus, Edit2, Trash2, Info, CheckCircle, XCircle } from 'lucide-react';
import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const UserSchema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email required'),
  password: z.string().min(8, 'Min 8 chars').regex(passwordRegex, 'Weak password'),
  isActive: z.boolean().optional(),
});

const UserUpdateSchema = z.object({
  email: z.string().email('Invalid email').optional(),
  password: z.string().min(8).regex(passwordRegex, 'Weak password').optional(),
  isActive: z.boolean().optional(),
});

interface User {
  id: string;
  email: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [addForm, setAddForm] = useState({ email: '', password: '', isActive: true });
  const [editForm, setEditForm] = useState({ email: '', password: '', isActive: true });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    getSelfId();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const getSelfId = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const { user } = await response.json();
        setSelfId(user?.id);
      }
    } catch (err) {
      console.error('Failed to get self ID:', err);
    }
  };

  const handleAddUser = async () => {
    try {
      setFormErrors({});
      const validated = UserSchema.parse(addForm);
      setIsSubmitting(true);
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }
      
      await fetchUsers();
      setShowAddModal(false);
      setAddForm({ email: '', password: '', isActive: true });
      setSuccessMessage('User created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) errors[issue.path[0].toString()] = issue.message;
        });
        setFormErrors(errors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create user');
        setTimeout(() => setError(null), 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    
    try {
      setFormErrors({});
      const toSend: any = {};
      if (editForm.email && editForm.email !== editingUser.email) toSend.email = editForm.email;
      if (editForm.password) toSend.password = editForm.password;
      if (editForm.isActive !== editingUser.isActive) toSend.isActive = editForm.isActive;
      
      if (Object.keys(toSend).length === 0) {
        setError('No changes to save');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      const validated = UserUpdateSchema.parse(toSend);
      setIsSubmitting(true);
      
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }
      
      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
      setSuccessMessage('User updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) errors[issue.path[0].toString()] = issue.message;
        });
        setFormErrors(errors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update user');
        setTimeout(() => setError(null), 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      await fetchUsers();
      setShowDeleteModal(false);
      setDeletingUser(null);
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({ email: user.email, password: '', isActive: user.isActive });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-ink tracking-tight">User Management</h1>
            <p className="text-body dark:text-body font-medium mt-1">Manage admin user accounts</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Add Admin User
        </Button>
      </div>

      {successMessage && <FormSuccess message={successMessage} />}
      {error && <FormError message={error} />}

      <div className="bg-surface-card dark:bg-surface-card rounded-2xl shadow-md overflow-hidden border border-hairline">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-hairline">
            <thead className="bg-surface-soft dark:bg-surface-soft">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-black text-mute uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-soft dark:hover:bg-surface-soft transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-ink dark:text-ink">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-accent-green-soft text-accent-green' : 'bg-accent-red-soft text-accent-red'}`}>
                    {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-accent-blue hover:text-accent-blue/80 font-bold"
                  >
                    Edit
                  </button>
                  {selfId !== user.id && (
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="text-accent-red hover:text-accent-red/80 font-bold"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Admin User">
        <div className="space-y-4">
          <TextInput
            label="Email"
            type="email"
            value={addForm.email}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            error={formErrors.email}
            className="h-11"
          />
          <TextInput
            label="Password"
            type="password"
            value={addForm.password}
            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
            error={formErrors.password}
            className="h-11"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={addForm.isActive}
              onChange={(e) => setAddForm({ ...addForm, isActive: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium">Active</span>
          </label>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Admin User">
        <div className="space-y-4">
          <TextInput
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            error={formErrors.email}
            className="h-11"
          />
          <TextInput
            label="New Password (leave empty to keep current)"
            type="password"
            value={editForm.password}
            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            error={formErrors.password}
            className="h-11"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium">Active</span>
          </label>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleEditUser} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete User">
        <div className="space-y-4">
          <p className="text-body">
            Are you sure you want to delete user <strong>{deletingUser?.email}</strong>?
          </p>
          <div className="bg-accent-red-soft/20 border border-accent-red/20 text-accent-red px-4 py-3 rounded-xl">
            <p className="text-sm font-bold">This action cannot be undone. All active sessions will be revoked.</p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteUser} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Info Tip */}
      <div className="p-5 rounded-2xl bg-accent-blue-soft/20 border border-accent-blue/10 flex gap-4">
        <Info className="w-6 h-6 text-accent-blue flex-shrink-0" />
        <p className="text-xs text-body leading-relaxed">
          <span className="font-black text-accent-blue uppercase tracking-wider block mb-1">Security Note</span>
          Passwords must be at least 8 characters with uppercase, lowercase, number, and special character. You cannot delete your own account.
        </p>
      </div>
    </div>
  );
}