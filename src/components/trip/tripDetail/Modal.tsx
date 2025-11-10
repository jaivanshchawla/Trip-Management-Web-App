import React, { useEffect, useState } from 'react';
import { PaymentBook } from '@/utils/interface';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTrip } from '@/context/tripContext';
import { useToast } from '@/components/hooks/use-toast';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id: string | undefined
    accountType: string;
    amount: number;
    paymentType: 'Cash' | 'Cheque' | 'Online Transfer';
    receivedByDriver: boolean;
    date: Date; // Ensure date is of type Date
    notes?: string;
  }) => void;
  modalTitle: string;
  accountType: string;
  editData?: PaymentBook | any;
}

const paymentTypes = ['Cash', 'Cheque', 'Online Transfer', 'Bank Transfer', 'UPI', 'Fuel', 'Others']

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  modalTitle,
  accountType,
  editData,
}) => {
  const [formState, setFormState] = useState({
    amount: editData?.amount || 0,
    paymentType: editData?.paymentType || 'Cash' as string,
    receivedByDriver: editData?.driver_id ? true : false,
    date: new Date(editData?.date || Date.now()).toISOString().split('T')[0],
    notes: editData?.notes || ''
  });

  const {trip, setTrip} = useTrip()
  const {toast} = useToast()

  useEffect(() => {
    if (editData) {
      const formattedDate = (editData.date instanceof Date)
        ? editData.date.toISOString().split('T')[0]
        : (editData.date && !isNaN(new Date(editData.date).getTime()))
          ? new Date(editData.date).toISOString().split('T')[0]
          : '';
      setFormState({
        amount: editData.amount,
        paymentType: editData.paymentType,
        receivedByDriver: editData.driver_id ? true : false,
        date: formattedDate,
        notes: editData.notes || ''
      });
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | any>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let pending = trip.balance
    if (editData){
      pending = pending + editData.amount
    }
    if (!formState.amount || formState.amount <=0) {
      toast({
        description : 'Enter Valid Amount',
        variant : 'warning'
      })
      return;
    }
    if(editData && (pending - formState.amount < 0)){
      toast({
        description : 'Payment amount exceeds pending balance',
        variant : 'warning'
      })
      return;
    }
    if(!editData && (formState.amount > trip.balance)){
      toast({
        description : 'Payment amount exceeds pending balance',
        variant : 'warning'
      })
      return;
    }
    onSave({
      id: editData?._id.toString(),
      accountType,
      amount: formState.amount,
      paymentType: formState.paymentType,
      receivedByDriver: formState.receivedByDriver,
      date: new Date(formState.date), // Convert date string to Date object
      notes: formState.notes,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center"></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0, 0.71, 0.2, 1.01]
        }} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">{modalTitle}</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="">Amount</label>
              <input
                type="number"
                name="amount"
                value={formState.amount}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                onFocus={(e) => {
                  if (e.target.value === '0') {
                    e.target.value = '';
                  }
                }}
                required
              />
            </div>
            <div className="mb-4">
              <label className="">Payment Type*</label>
              <select
                name="paymentType"
                value={formState.paymentType}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                required
              >
                {paymentTypes.map(type=>(
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="receivedByDriver"
                checked={formState.receivedByDriver}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="block text-sm font-medium text-gray-700">Received By Driver</label>
            </div>
            <div className="mb-4">
              <label className="">Payment Date*</label>
              <input
                type="date"
                name="date"
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                value={formState.date}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="">Notes</label>
              <textarea
                name="notes"
                value={formState.notes}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant='outline' type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default Modal;
