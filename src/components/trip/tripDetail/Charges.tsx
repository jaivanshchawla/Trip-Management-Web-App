import React, { useState, useEffect } from 'react';
import ChargeModal from './ChargeModal';
import { ITrip, TripExpense } from '@/utils/interface';
import { MdDelete, MdEdit } from 'react-icons/md';
import EditChargeModal from './EditChargeModal';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/utilArray';
import { PiPlusBold } from 'react-icons/pi';
import { useTrip } from '@/context/tripContext';

type props = {
  tripId : string
}

const Charges : React.FC<props> = ({tripId}) => {
  const {trip, setTrip} = useTrip()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [sortedCharges, setSortedCharges] = useState<TripExpense[]>([]);
  const [selectedCharge, setSelectedCharge] = useState<TripExpense | null>(null);

  useEffect(() => {
    if (trip.tripCharges) {
      const sorted = [...trip.tripCharges].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSortedCharges(sorted);
    }
  }, [trip.tripCharges]);

  const handleAddCharge = async (newCharge: TripExpense) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCharge),
      });
      if(!res.ok){
        throw new Error('Failed to add Charge')
      }
      const data =  await res.json();
      setTrip((prev : ITrip | any) =>({
        ...prev,
        tripCharges : [
          data.newCharge,
          ...prev.tripCharges
        ],
        balance : newCharge.partyBill ? prev.balance + Number(newCharge.amount) : prev.balance - Number(newCharge.amount),
      }))
    } catch (error) {
      alert(error)
      console.error('Error adding charge:', error);
    }
    
  };

  const toggleItemExpansion = (index: number) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const handleEditCharge = (index: number) => {
    setSelectedCharge(sortedCharges[index]);
    setEditModalOpen(true);
  };

  const handleDeleteCharge = async (index: number) => {
    const chargeToDelete = sortedCharges[index];
    const res = await fetch(`/api/trips/${tripId}/expenses/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: chargeToDelete._id }),
    });
    if (res.ok) {
      
      setTrip((prev : ITrip | any) =>({
        ...prev,
        tripCharges : prev.tripCharges.filter((charge : any) => charge._id !== chargeToDelete._id),
        balance : chargeToDelete.partyBill ? prev.balance - chargeToDelete.amount : prev.balance + chargeToDelete .amount
      }))
      
    } else {
      console.error('Failed to delete charge:', chargeToDelete._id);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Charges</h3>
        <Button
          disabled={trip.status === 4}
          className="flex items-center justify-center w-8 h-8 rounded-full p-0 "
          onClick={() => setIsModalOpen(true)}
          aria-label="Add Charge"
        >
          <PiPlusBold color='white' size={20}/>
        </Button>
      </div>
      {!sortedCharges || sortedCharges.length === 0 ? (
        <p className="text-sm text-gray-500">No charges available.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg divide-y divide-gray-200">
          {sortedCharges.map((charge : any, index : number) => (
            <div
              key={index}
              className="flex flex-col px-4 py-4 hover:bg-gray-50 transition duration-300 ease-in-out transform hover:scale-105 rounded-lg cursor-pointer"
              onClick={() => toggleItemExpansion(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Amount: ₹{formatNumber(charge.amount)}</p>
                  <p className="text-xs text-gray-600">Type: {charge.expenseType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Date: {new Date(charge.date).toLocaleDateString()}</p>
                  <p className={`text-xs font-semibold ${charge.partyBill ? 'text-green-600' : 'text-red-600'}`}>
                    {charge.partyBill ? 'Added to Bill' : 'Reduced from Bill'}
                  </p>
                </div>
              </div>
              {expandedItem === index && (
                <div className="mt-4 bg-gray-100 p-4 rounded-md border border-gray-300">
                  {charge.notes && (
                    <p className="text-xs text-gray-600 mb-2">Notes: {charge.notes}</p>
                  )}
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      variant={'ghost'}
                      disabled={trip.status === 4}
                      onClick={() => handleEditCharge(index)}
                      className="flex items-center justify-center p-2 hover:bg-gray-200"
                    >
                      <MdEdit size={20} />
                    </Button>
                    <Button
                      variant={'ghost'}
                      disabled={trip.status === 4}
                      onClick={() => handleDeleteCharge(index)}
                      className="flex items-center justify-center p-2 hover:bg-gray-200"
                    >
                      <MdDelete size={20} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ChargeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCharge}
      />
      {editModalOpen && selectedCharge && (
        <EditChargeModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={async (editedCharge: TripExpense) => {
            // Send PATCH request to update charge
            const res = await fetch(`/api/trips/${tripId}/expenses`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(editedCharge),
            });
            if (!res.ok) {
              console.error('Failed to update charge:', selectedCharge._id);
              return;
            }

            setTrip((prev : ITrip | any) =>({
              ...prev,
              tripCharges : prev.tripCharges.map((charge : any) =>
                charge._id === selectedCharge._id? editedCharge : charge
              ),
            }))
            setEditModalOpen(false);
          }}
          charge={selectedCharge}
        />
      )}
    </div>
  );
};

export default Charges;
