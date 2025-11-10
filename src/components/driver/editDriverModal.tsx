// components/EditDriverModal.tsx
import React, { useState } from 'react';
import { IDriver } from '@/utils/interface';
import { isValidPhone } from '@/utils/validate';
import { Button } from '../ui/button';
import { useDriver } from '@/context/driverContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface EditDriverModalProps {
  name: string;
  driverId: string;
  handleEdit: (data: Partial<IDriver>) => void;
  onCancel: () => void;
  contactNumber: string
}

const EditDriverModal: React.FC<EditDriverModalProps> = ({ name, driverId, handleEdit, onCancel, contactNumber }) => {
  const { driver, setDriver } = useDriver()
  const [formData, setFormData] = useState({
    name: driver.name || "",
    contactNumber: driver.contactNumber || "",
    licenseNo: driver.licenseNo || "",
    aadharNo: driver.aadharNo || '',
    lastJoiningDate: new Date(driver.lastJoiningDate || Date.now())
  })

  const [saving, setSaving]= useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!isValidPhone(formData.contactNumber)) {
      alert('Enter a Valid Phone')
      return
    }
    setSaving(true)
    handleEdit(formData);
  };

  return (
    <div className="modal-class">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0, 0.71, 0.2, 1.01]
        }}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[700px] overflow-y-auto thin-scrollbar"
      >
          <h2 className="text-2xl mb-4">Edit Driver</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                name='name'
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Mobile Number</label>
              <input
                type="text"
                name='contactNumber'
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>
            <label className="block mb-2">
              Aadhar Number
              <input
                type="text"
                name="aadharNo"
                value={formData.aadharNo}
                onChange={handleChange}
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
              />
            </label>
            <label className="block mb-2">
              License Number
              <input
                type="text"
                name="licenseNo"
                value={formData.licenseNo}
                onChange={handleChange}
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
              />
            </label>
            <label className="block mb-2">
              Last Joining Date
              <input
                type="date"
                name="lastJoiningDate"
                value={new Date(formData.lastJoiningDate).toISOString().split('T')[0]}
                onChange={handleChange}
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
              />
            </label>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant={'outline'}
                onClick={() => {
                  onCancel()
                }} // Reset name field to original value on cancel
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? <Loader2 className='text-white animate-spin' /> : 'Save'}
              </Button>
            </div>
          </form>
      </motion.div>
    </div>
  );
};

export default EditDriverModal;
