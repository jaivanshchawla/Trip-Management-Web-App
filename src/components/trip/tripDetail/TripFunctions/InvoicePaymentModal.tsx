import React, { useEffect, useState } from 'react';
import { PaymentBook } from '@/utils/interface';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTrip } from '@/context/tripContext';
import { useToast } from '@/components/hooks/use-toast';
import {v4 as uuidV4} from 'uuid'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { statuses } from '@/utils/schema';
import { formatNumber } from '@/utils/utilArray';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id: string | undefined
    trip_id : string
    amount: number;
    party_id : string
    paymentType: string;
    receivedByDriver: boolean;
    date: string; // Ensure date is of type Date
    notes?: string;
  }) => void;
  trips : any[]
}

const InvoicePaymentModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trips
}) => {
  const [formState, setFormState] = useState({
    amount:  0,
    trip_id : '',
    paymentType: 'Cash',
    receivedByDriver: false,
    date: new Date(Date.now()).toISOString().split('T')[0],
    notes: ''
  });
  const {toast} = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | any>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.amount || formState.amount <=0) {
      toast({
        description : 'Enter Valid Amount',
        variant : 'warning'
      })

      return;
    }

    if(trips.find(trip=>trip.trip_id === formState.trip_id).balance - formState.amount < 0){
      
      toast({
        description : 'Payment amount exceeds pending balance',
        variant : 'warning'
      })
      return;
    }

    // if(formState.amount > trip.balance){
    //   toast({
    //     description : 'Payment amount exceeds pending balance',
    //     variant : 'warning'
    //   })
    //   return;
    // }
    onSave({
      id: uuidV4(),
      trip_id : formState.trip_id,
      party_id : trips.find((trip)=>trip.trip_id === formState.trip_id).party,
      amount: formState.amount,
      paymentType: formState.paymentType,
      receivedByDriver: formState.receivedByDriver,
      date: new Date(formState.date).toISOString().split('T')[0], // Convert date string to Date object
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
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
          <h3 className="text-lg font-semibold mb-4">Payment</h3>
          <form onSubmit={handleSubmit}>
          {trips && trips?.length > 0 &&
            <div className="mb-4">
              <label className="block text-sm text-gray-700">Trip*</label>
              <Select 
                name="trip_id" 
                value={formState.trip_id} 
                onValueChange={(value) => setFormState((prev)=>({
                    ...prev,
                    trip_id : value
                }))}
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

                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Balance : {formatNumber(trip.balance)}
                        </span>

                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
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
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Online Transfer">Online Transfer</option>
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
                value={formState.date}
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
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

export default InvoicePaymentModal;
