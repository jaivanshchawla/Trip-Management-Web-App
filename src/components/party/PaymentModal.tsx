'use client'
import React, { useEffect, useState } from 'react';
import { ITrip, PaymentBook } from '@/utils/interface';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useParty } from '@/context/partyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { statuses } from '@/utils/schema';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        accountType: string;
        amount: number;
        paymentType: 'Cash' | 'Cheque' | 'Online Transfer';
        date: Date; // Ensure date is of type Date
        notes?: string;
        trip_id? : string
    }) => void;
    modalTitle: string;
    accountType: string;
    editData?: PaymentBook | any;

}

const PaymentModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onSave,
    modalTitle,
    accountType,
    editData,
}) => {
    const { party } = useParty()
    const [formState, setFormState] = useState({
        amount: editData?.amount || 0,
        paymentType: editData?.paymentType || 'Cash' as 'Cash' | 'Cheque' | 'Online Transfer',
        date: new Date(editData?.date || Date.now()).toISOString().split('T')[0],
        notes: editData?.notes || '',
        trip_id: editData?.trip_id || ''
    });

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
                date: formattedDate,
                notes: editData.notes || '',
                trip_id: editData?.trip_id || ''
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
        onSave({
            accountType,
            amount: formState.amount,
            paymentType: formState.paymentType,
            date: new Date(formState.date), // Convert date string to Date object
            notes: formState.notes,
            trip_id : formState.trip_id
        });
        onClose();
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormState((prevData) => {
            let updatedData = { ...prevData, [name]: value };

            return updatedData;
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
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
                            <label className="block text-sm font-medium text-gray-700">Amount*</label>
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
                            <label className="block text-sm font-medium text-gray-700">Payment Type*</label>
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
                        <div className='mb-4'>
                            <label className='text-sm text-gray-700'>Select Trip</label>
                            <Select value={formState.trip_id} defaultValue={formState.trip_id} onValueChange={(value) => handleSelectChange('trip_id', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder='(optional)' />
                                </SelectTrigger>
                                <SelectContent>
                                    {party.items?.map((trip: any) => (
                                        trip.type === 'trip' &&
                                        <SelectItem key={trip.trip_id} value={trip.trip_id}>
                                            <div className='flex items-center space-x-2 w-full'>
                                                <span className='font-semibold w-1/2'>{trip.description.origin.split(',')[0]} &rarr; {trip.description.destination.split(',')[0]}</span>
                                                <div className="flex flex-col items-center space-x-2 w-1/2">
                                                    <span >{statuses[trip.status as number]}</span>
                                                    <div className="relative w-full bg-gray-200 h-1 rounded">
                                                        <div
                                                            className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`}
                                                            style={{ width: `${(trip.status as number / 4) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* <div className="mb-4 flex items-center">
                            <input
                                type="checkbox"
                                name="receivedByDriver"
                                checked={formState.receivedByDriver}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label className="block text-sm font-medium text-gray-700">Received By Driver</label>
                        </div> */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Payment Date*</label>
                            <input
                                type="date"
                                name="date"
                                value={formState.date}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
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

export default PaymentModal;
