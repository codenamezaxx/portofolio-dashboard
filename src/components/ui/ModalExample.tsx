'use client';

import { useState } from 'react';
import { Button } from './Button';
import {
  Modal,
  ConfirmationDialog,
  DeleteConfirmationDialog,
  AlertDialog,
} from './Modal';

/**
 * Example component demonstrating all Modal variants
 * This is for documentation and testing purposes
 */
export function ModalExample() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setConfirmOpen(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold mb-6">Modal Component Examples</h2>

      {/* Basic Modal Example */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Modal</h3>
        <Button onClick={() => setBasicOpen(true)}>Open Basic Modal</Button>
        <Modal
          isOpen={basicOpen}
          onClose={() => setBasicOpen(false)}
          title="Basic Modal Example"
          message="This is a basic modal with custom content and actions."
          actions={[
            {
              label: 'Cancel',
              onClick: () => setBasicOpen(false),
              variant: 'secondary',
            },
            {
              label: 'Confirm',
              onClick: () => setBasicOpen(false),
              variant: 'primary',
            },
          ]}
        />
      </div>

      {/* Confirmation Dialog Example */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Confirmation Dialog</h3>
        <Button onClick={() => setConfirmOpen(true)}>
          Open Confirmation Dialog
        </Button>
        <ConfirmationDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm Action"
          message="Are you sure you want to proceed with this action?"
          confirmLabel="Proceed"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          isConfirming={isLoading}
        />
      </div>

      {/* Delete Confirmation Dialog Example */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Delete Confirmation</h3>
        <Button onClick={() => setDeleteOpen(true)} variant="danger">
          Delete Item
        </Button>
        <DeleteConfirmationDialog
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          itemName="Sample Project"
          onConfirm={handleDelete}
          isConfirming={isLoading}
        />
      </div>

      {/* Alert Dialog Example */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Alert Dialog</h3>
        <Button onClick={() => setAlertOpen(true)}>Show Alert</Button>
        <AlertDialog
          isOpen={alertOpen}
          onClose={() => setAlertOpen(false)}
          title="Success"
          message="Your changes have been saved successfully!"
          actionLabel="OK"
          variant="success"
        />
      </div>
    </div>
  );
}
