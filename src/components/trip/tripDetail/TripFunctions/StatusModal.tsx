import React, { useState, useEffect } from 'react';
import { statuses } from '@/utils/schema';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface StatusModalProps {
  status: number;
  isOpen: boolean;
  dates: Date[];
  amount: number
  onClose: () => void;
  onSave: (data: any) => void;
}

const StatusModal: React.FC<StatusModalProps> = ({ status, isOpen, onClose, onSave, dates, amount }) => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [podReceivedDate, setPodReceivedDate] = useState<string>(new Date().toLocaleDateString());
  const [podImage, setPodImage] = useState<File | null>(null);
  const [paymentType, setPaymentType] = useState<string>('Cash');
  const [settlementDate, setSettlementDate] = useState<Date>(new Date(Date.now()));
  const [receivedByDriver, setReceivedByDriver] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');


  useEffect(() => {
    if (status === 0) {
      setStartDate(new Date().toISOString().split('T')[0]);
    } else if (status === 1) {
      setPodReceivedDate(new Date().toISOString().split('T')[0]);
    }
  }, [status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setPodImage(file);
  };


  const saveChanges = () => {
    let data: any = {};

    const convertFileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result.toString());
          } else {
            reject('Failed to convert file to Base64');
          }
        };
        reader.onerror = () => reject('Error reading file');
      });
    };

    const updateData = async () => {
      if (statuses[status] === 'Started') {
        dates[1] = new Date(startDate);
        data = { dates: dates, status: status + 1 };
      } else if (statuses[status] === 'Completed') {
        dates[2] = new Date(podReceivedDate);

        if (podImage) {
          try {
            const base64PodImage = await convertFileToBase64(podImage);
            data = { dates: dates, status: status + 1, podImage: base64PodImage };
          } catch (error) {
            console.error('Error converting file to Base64:', error);
          }
        } else {
          data = { dates: dates, status: status + 1 };
        }
      } else if (statuses[status] === 'POD Recieved') {
        dates[3] = new Date(startDate);
        data = { dates: dates, status: status + 1 };
      } else if (statuses[status] === 'POD Submitted') {
        dates[4] = new Date(settlementDate);
        amount === 0 ? data = { dates: dates, status: status + 1 } :
          data = {
            amount: amount,
            paymentType,
            receivedByDriver,
            notes,
            date: dates[4],
            dates: dates,
            status: status + 1,
          };
      }

      onSave(data)
      onClose()
      // You can now use the `data` object to send the request or perform further actions
      // Example: sending data to the server
      // await fetch('/api/update-status', { method: 'POST', body: JSON.stringify(data) });
    };

    updateData();

  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0, 0.71, 0.2, 1.01]
        }} className="bg-white rounded-lg shadow-md overflow-hidden" style={{ maxWidth: '600px', width: '90%' }}>
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4 text-black">Trip {statuses[status + 1]}</h2>
          {statuses[status] === 'Started' && (
            <div className="mb-4">
              <label className="">End Date</label>
              <input
                type="date"
                value={startDate}
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          )}
          {statuses[status] === 'Completed' && (
            <>
              <div className="mb-4">
                <label className="">POD Received Date*</label>
                <input
                  type="date"
                  value={podReceivedDate}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  onChange={(e) => setPodReceivedDate(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="">POD Image</label>
                <input
                  type="file"
                  accept="image/*, application/pdf"
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}
          {statuses[status] === 'POD Recieved' && (
            <div className="mb-4">
              <label className="">POD Submitted Date*</label>
              <input
                type="date"
                value={startDate}
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          )}
          {statuses[status] === 'POD Submitted' && (
            <>
              <div className="mb-4">
                <label className="">Amount</label>
                <input
                  type="number"
                  value={amount}
                  disabled
                />
              </div>
              <div className="mb-4">
                <label className="">Payment Type</label>
                <select
                  className="w-full px-3 py-2 border border-lightOrange rounded-lg focus:outline-none focus:ring focus:ring-lightOrange focus:border-lightOrange"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="">Settlement Date*</label>
                <input
                  type="date"
                  value={new Date(settlementDate).toISOString().split('T')[0]}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  onChange={(e) => setSettlementDate(new Date(e.target.value))}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-lightOrange focus:ring-bottomNavBarColor"
                    checked={receivedByDriver}
                    onChange={(e) => setReceivedByDriver(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Received by Driver</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-lightOrange rounded-lg focus:outline-none focus:ring focus:ring-lightOrange focus:border-bottomNavBarColor"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <p className="mt-2 text-sm text-red-600 font-semibold">
                  ⚠️ Warning: Make sure to check all the payments and charges. Once settled, they cannot be edited.
                </p>
              </div>

            </>
          )}
          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={saveChanges}>
              Save
            </Button>
            <Button variant={'outline'} onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatusModal;
