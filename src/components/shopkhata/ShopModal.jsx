import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const ShopModal = ({ open, onClose, type, onConfirm, selected }) => {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [otherReason, setOtherReason] = useState('');

  useEffect(() => {
    if (selected) {
      setAmount(selected.gave ? selected.gave : selected.got || 0);
      setReason(selected.reason || '');
      setDate(selected.date ? new Date(selected.date).toISOString().split('T')[0] : '');
      setOtherReason('');
    }
  }, [selected]);

  const handleConfirm = () => {
    const finalReason = reason === 'Other' ? otherReason : reason;
    if(selected){
      onConfirm({
        gave : selected.gave ? amount : 0,
        got : selected.got ? amount : 0,
        reason : finalReason,
        date : date
      })
    }else{
      onConfirm(amount, finalReason, date);
    }
    
    onClose()
    setAmount(0);
    setReason('');
    setOtherReason('');
    setDate('');
  };

  const handleCancel = () => {
    onClose();
  };


  return (
    <>
      {open && (
        <div className="modal-class">
          <div className="absolute inset-0 bg-gray-900 opacity-50 backdrop-blur-lg"></div>
          <div className="relative bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{type === 'credit' ? 'Credit' : 'Payment'}</h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                
                  <input
                    type="text"
                    className="mt-2 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    placeholder="Enter other reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  onClick={(e) => e.target.showPicker()}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={handleConfirm}>Confirm</Button>
                <Button
                  variant={'ghost'}
                  
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ShopModal;
