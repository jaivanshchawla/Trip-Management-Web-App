import React, { useEffect, useState } from 'react';
import { driverGave, driverGot } from '@/utils/utilArray';
import { Button } from '../ui/button';
import { useToast } from '@/components/hooks/use-toast';
import { motion } from 'framer-motion';

interface DriverModalProps {
  open: boolean;
  onClose: () => void;
  type: 'gave' | 'got' | null;
  onConfirm: any;
  selected?: any;
}

const DriverModal: React.FC<DriverModalProps> = ({ open, onClose, type, onConfirm, selected }) => {
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // Store date in ISO format
  const [otherReason, setOtherReason] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (selected) {
      setAmount(selected.gave ? selected.gave : selected.got || 0);
      setReason(selected.reason || '');
      setDate(selected.date ? new Date(selected.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setOtherReason('');
    }
  }, [selected]);

  const handleConfirm = () => {
    const finalReason = reason === 'Other' ? otherReason : reason;

    if (!amount || !finalReason || !date) {
      toast({
        'description': 'Please fill all the detials',
        variant: 'warning'
      })

      if (amount <= 0) {
        toast({
          description: 'Amount not acceptable',
          variant: 'warning'
        })
      }

      return;
    }

    if (selected) {
      onConfirm({
        gave: selected.gave ? amount : 0,
        got: selected.got ? amount : 0,
        reason: finalReason,
        date: date,
      });
    } else {
      onConfirm(amount, finalReason, date);
    }

    onClose();
    setAmount(0);
    setReason('');
    setOtherReason('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleCancel = () => {
    onClose();
  };

  const reasonOptions = type === 'gave' ? driverGave : driverGot;

  if (!open) {
    return null
  }

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
    
          <h2 className="text-xl font-bold mb-4">{type === 'gave' ? 'Driver Gave' : 'Driver Got'}</h2>
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Amount*</label>
              <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Reason*</label>
              <select
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                <option value="" disabled>Select a reason</option>
                {reasonOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {reason === 'Other' && (
                <input
                  type="text"
                  className="mt-2 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  placeholder="Enter other reason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  required
                />
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Date*</label>
              <input
                type="date"
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={date} // Ensure date is in ISO format 'YYYY-MM-DD'
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleConfirm}>Confirm</Button>
              <Button
                variant={'outline'}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
      </motion.div>
    </div>
  )
};

export default DriverModal;
