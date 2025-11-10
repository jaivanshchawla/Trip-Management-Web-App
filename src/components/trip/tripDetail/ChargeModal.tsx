import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { motion } from 'framer-motion';
import React, { useState, useMemo, useEffect } from 'react';

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: any;
  trips?: ITrip[]
}

const chargeType = [
  'Detention/Halting Charges',
  'Repair Expense',
  'Loading Charges',
  'Unloading Charges',
  'Union Charges',
  'Weight Charges',
  'Other Charges'
];

const deductionType = [
  'Material Loss',
  'Brokerage',
  'Late Fees',
  'TDS',
  'Mamul',
  'Other'
];

interface TripExpense {
  trip_id: string;
  partyBill: boolean;
  amount: number;
  date: string;
  expenseType: string;
  notes?: string;
}

const ChargeModal: React.FC<ChargeModalProps> = ({ isOpen, onClose, onSave, trips }) => {
  const [formData, setFormData] = useState<TripExpense>({
    trip_id: '',
    partyBill: true,
    amount: 0,
    date: new Date(Date.now()).toISOString(),
    expenseType: '',
    notes: '',
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | string, selectName?: string) => {
    if (typeof e === 'string' && selectName) {
      setFormData({ ...formData, [selectName]: e });
    } else if (typeof e !== 'string') {
      const { name, value, type } = e.target;
      setFormData({ ...formData, [name]: type === 'checkbox' ? !formData.partyBill : value });
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      handleChange({ target: { name: e.target.name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-class"></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0, 0.71, 0.2, 1.01]
        }} className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Add New Charge</h2>
          {trips && trips?.length > 0 &&
            <div className="mb-4">
              <label className="block text-sm text-gray-700">Trip*</label>
              <Select 
                name="trip_id" 
                value={formData.trip_id} 
                onValueChange={(value) => handleChange(value, 'trip_id')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Trip" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.trip_id} value={trip.trip_id}>
                      <div className="flex items-center justify-between w-full p-2 space-x-4">

                        {/* Display route origin to destination */}
                        <span className="font-semibold text-gray-700 whitespace-nowrap">
                          {trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]}
                        </span>

                        {/* Status indicator with progress bar */}
                        <div className="flex flex-col w-1/2 space-y-1">
                          {/* Status label */}
                          <span className="text-sm text-gray-600">
                            {statuses[trip.status as number]}
                          </span>

                          {/* Progress bar for status */}
                          <div className="relative w-full h-1 bg-gray-200 rounded">
                            <div
                              className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0
                                ? 'bg-red-500'
                                : trip.status === 1
                                  ? 'bg-yellow-500'
                                  : trip.status === 2
                                    ? 'bg-blue-500'
                                    : trip.status === 3
                                      ? 'bg-green-500'
                                      : 'bg-green-800'
                                }`}
                              style={{ width: `${(trip.status as number / 4) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* LR number */}
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {trip.LR}
                        </span>

                        {/* Start date */}
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {new Date(trip.startDate).toISOString().split('T')[0]}
                        </span>

                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Add to Party Bill</label>
            <input
              type="checkbox"
              name="partyBill"
              checked={formData.partyBill}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Expense Type</label>
            <div className="relative">
              <select
                name="expenseType"
                value={formData.expenseType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md appearance-none"
              >
                <option value="">Select Expense Type</option>
                {formData.partyBill
                  ? chargeType.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))
                  : deductionType.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="h-4 w-4 fill-current text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              onFocus={handleFocus}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
    <input
              type="date"
              name="date"
              onClick={(e) => (e.target as HTMLInputElement).showPicker()}
              value={new Date(formData.date).toISOString().split('T')[0]}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant='outline' onClick={onClose} >
              Cancel
            </Button>
            <Button onClick={handleSave} >
              Save
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ChargeModal;

