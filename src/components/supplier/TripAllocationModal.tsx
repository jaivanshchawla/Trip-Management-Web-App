import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ITrip } from '@/utils/interface';

interface TripAllocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    trips: ITrip[];
    truckHireCosts: Record<string, number>;
    totalAmount: number;
    onAllocate: (tripAllocations: Record<string, number>) => void;
}

const TripAllocationModal = ({ isOpen, onClose, trips, truckHireCosts, totalAmount, onAllocate }: TripAllocationModalProps) => {
    const [tripAllocations, setTripAllocations] = useState<Record<string, number>>({});

    const handleAllocationChange = (tripId: string, allocatedAmount: number) => {
        const trip = trips.find(trip => trip.trip_id === tripId);
        if (trip && allocatedAmount > truckHireCosts[tripId]) {
            alert(`Allocated amount cannot exceed the remaining truck hire cost of ${truckHireCosts[tripId]}`);
            return;
        }
        setTripAllocations(prev => ({ ...prev, [tripId]: allocatedAmount }));
    };

    const totalAllocatedAmount = Object.values(tripAllocations).reduce((sum, amount) => sum + (amount || 0), 0);

    const handleSave = () => {
        onAllocate(tripAllocations);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
            <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-xl">
                <h2 className="text-xl font-bold mb-4">Allocate Amount to Trips</h2>
                {(totalAmount > Object.values(truckHireCosts).reduce((sum, cost) => sum + cost, 0)) ? (
                    <p className="text-red-500">The amount exceeds the total truck hire cost of all trips.</p>
                ) : (
                    <div className="space-y-2">
                        {trips.map((trip) => (
                            <div key={trip.trip_id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md shadow-sm">
                                <span className="flex-1 text-gray-700">{trip.route.origin} &rarr; {trip.route.destination}</span>
                                <input
                                    type="number"
                                    value={tripAllocations[trip.trip_id] || ''}
                                    onChange={(e) => handleAllocationChange(trip.trip_id, Number(e.target.value))}
                                    className="w-28 p-2 border rounded"
                                    placeholder="Amount"
                                    disabled={totalAllocatedAmount >= totalAmount}
                                />
                                <span className="text-gray-700 font-semibold ml-1">/{truckHireCosts[trip.trip_id]}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={totalAllocatedAmount > totalAmount}>Save</Button>
                </div>
            </div>
        </div>
    );
};

export default TripAllocationModal;
