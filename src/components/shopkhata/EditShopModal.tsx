// components/EditDriverModal.tsx
import React, { useState } from 'react';
import { IDriver } from '@/utils/interface';
import { isValidPhone } from '@/utils/validate';
import { Button } from '../ui/button';

interface EditDriverModalProps {
  name: string;
  shopId: string;
  handleEdit: (driverName: string, mobileNumber: string) => void;
  onCancel : () =>void;
  contactNumber : string
}

const EditShopModal: React.FC<EditDriverModalProps> = ({ name, shopId, handleEdit, onCancel, contactNumber }) => {
  const [driverName, setDriverName] = useState<string>(name);
  const [mobileNumber, setMobileNumber] = useState<string>(contactNumber); // Initialize mobileNumber with an empty string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!isValidPhone(mobileNumber)) {
      alert('Enter a Valid Phone')
      return
    }
    handleEdit(driverName, mobileNumber);
  };

  return (
    <div className="modal-class">
      <div className="bg-white p-6 rounded-md w-full max-w-md">
        <h2 className="text-2xl mb-4">Edit Driver</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant={'outline'}
              onClick={() => {setDriverName(name)
                onCancel()
              }} // Reset name field to original value on cancel
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShopModal;
