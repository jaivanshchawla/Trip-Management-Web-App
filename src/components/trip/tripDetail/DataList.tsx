import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { ITrip, PaymentBook } from '@/utils/interface';
import { MdDelete, MdEdit } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/utilArray';
import { PiPlusBold } from 'react-icons/pi';
import { useTrip } from '@/context/tripContext';
import { useToast } from '@/components/hooks/use-toast';

interface DataListProps {
  label: string;
  modalTitle: string;
  displayLabel?: string | React.ReactNode;
  onTotalAdvanceChange?: (total: number) => void;
}

const DataList: React.FC<DataListProps> = ({ label, modalTitle, displayLabel, onTotalAdvanceChange }) => {
  const { trip, setTrip } = useTrip();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<PaymentBook | null>(null);
  const [listData, setListData] = useState<PaymentBook[]>([]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const { toast } = useToast();
const [totalAdvance, setTotalAdvance] = useState<number>(0);

  // Destructure displayLabel properly here
  const labelToDisplay = displayLabel || label;

// useEffect(() => {
//   const temp = trip.tripAccounts.filter(
//     (account: PaymentBook) =>
//       account &&
//       account.accountType &&
//       account.accountType.toLowerCase() === label.toLowerCase()
//   );
//   const sortedData = temp.sort(
//     (a: PaymentBook, b: PaymentBook) =>
//       new Date(b.date).getTime() - new Date(a.date).getTime()
//   );
//   setListData(sortedData);

//   const totalAdvanceAmount = sortedData.reduce(
//     (accumulator: number, current: PaymentBook) => accumulator + (current.amount ?? 0),
//     0
//   );
//   setTotalAdvance(totalAdvanceAmount);

//   if (onTotalAdvanceChange) {
//     onTotalAdvanceChange(totalAdvanceAmount);
//   }
// }, [trip, label]);

useEffect(() => {
  if (!trip?.tripAccounts) return;

  // Determine the correct account type (Advances or Payments)
  const accountType =
    label.toLowerCase() === 'payments' ? 'Payments' : 'Advances';

  const filtered = trip.tripAccounts.filter(
    (account: PaymentBook) =>
      account?.accountType?.toLowerCase() === accountType.toLowerCase()
  );

  const sortedData = filtered.sort(
    (a: PaymentBook, b: PaymentBook) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  setListData(sortedData);

  const totalAmount = sortedData.reduce(
    (acc: number, curr: PaymentBook) => acc + (curr.amount || 0),
    0
  );

  setTotalAdvance(totalAmount);

  if (onTotalAdvanceChange) {
    onTotalAdvanceChange(totalAmount);
  }
}, [trip.tripAccounts, label]);


  const handleAddItem = async (newItem: any) => {
    const itemtosend = {
      ...newItem,
      trip_id: trip.trip_id,
      driver_id: newItem.receivedByDriver ? trip.driver : null
    }
    try {
      const res = await fetch(`/api/parties/${trip.party}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemtosend),
      });
      if (!res.ok) {
        throw new Error('Failed to add new item');
      }
      const resData = await res.json();
      if (resData.status == 400) {
        toast({description : resData.message, variant : 'destructive'});
        return;
      }

      setTrip((prev: ITrip | any) => ({
        ...prev,
        balance: label === "Advances" ? prev.balance - newItem.amount : prev.balance,
        tripAccounts : [resData.payment, ...prev.tripAccounts]
      }))
      toast({
        description : 'Payment Added Successfully'
      })
      setIsModalOpen(false);
      // setTrip();
      // router.refresh();
    } catch (error) {
      toast({
        title : 'Internal Server Error',
        description : 'Failed to add payment',
        variant : 'destructive'
      })
      console.log(error);
    }
  };

  const handleEditItem = async (editedItem: any) => {
    try {
      const res = await fetch(`/api/parties/${trip.party}/payments/${editedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedItem,
          driver_id: editedItem.receivedByDriver === true ? trip.driver : null
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to edit item');
      }

      const resData = await res.json();

      if (resData.status == 400) {
        toast({description : resData.message, variant : 'destructive'});
        return;
      }

      setTrip((prev: ITrip | any) => ({
        ...prev,
        balance: label === "Advances" ? (editData ? prev.balance + editData?.amount as number - editedItem.amount : prev.balance) : prev.balance,
        tripAccounts : prev.tripAccounts.map((acc: any) => acc._id === resData.payment._id? resData.payment : acc),
      }))
      toast({
        description : 'Edited Sucessfully'
      })
      setEditData(null);
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title : 'Internal Server Error',
        description : 'Failed to edit payment',
        variant : 'destructive'
      })
      console.log(error);
    }
  };

  const handleDeleteItem = async (item: PaymentBook) => {
    try {
      const res = await fetch(`/api/parties/${trip.party}/payments/${item._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!res.ok) {
        throw new Error('Failed to delete item');
      }
      const resData = await res.json();
      setTrip((prev: ITrip | any) => ({
        ...prev,
        balance: label === "Advances" ? prev.balance + item.amount : prev.balance,
        tripAccounts : prev.tripAccounts.filter((acc: any) => acc._id!== item._id),
      }))
      toast({
        description : 'Deleted Successfully'
      })
      // router.refresh();
    } catch (error) {
      toast({
        title : 'Internal Server Error',
        description : 'Failed to delete payment',
        variant : 'destructive'
      })
      console.log(error);
    }
  };

  const toggleItemExpansion = (index: number) => {
    setExpandedItem((prev) => (prev === index ? null : index));
  };

  const openAddModal = () => {
    if(label === "Advances" && trip.balance <= 0){
      toast({description : 'Trip Balance is zero', variant : 'warning'});
      return
    }
    setEditData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PaymentBook) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  return (
    <div className="mt-6">
      {/* <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{labelToDisplay}</h3> 
        <Button
          className="rounded-full flex items-center w-8 h-8 p-0"
          onClick={openAddModal}
          aria-label={`Add ${label}`}
          disabled={trip.status == 4}
        >
          <PiPlusBold color='white' size={20} />
        </Button>
      </div> */}
      <div className="flex items-center justify-between mb-4">
  <div className="flex-1">
    {typeof labelToDisplay === 'string' ? (
      <h3 className="text-lg font-semibold text-gray-800">{labelToDisplay}</h3>
    ) : (
      <div className="text-lg font-semibold text-gray-800 w-full">
        {labelToDisplay}
      </div>
    )}
  </div>
  <Button
    className="rounded-full flex items-center w-8 h-8 p-0"
    onClick={openAddModal}
    aria-label={`Add ${label}`}
    disabled={trip.status == 4}
  >
    <PiPlusBold color="white" size={20} />
  </Button>
</div>

      {!listData || listData.length === 0 ? (
        <p className="text-sm text-gray-500">No {label.toLowerCase()} available.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg divide-y divide-gray-200">
          {listData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col px-4 py-4 hover:bg-gray-50 transition duration-300 ease-in-out transform hover:scale-105 rounded-lg cursor-pointer"
              onClick={() => toggleItemExpansion(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Amount: ₹{formatNumber(item.amount)}</p>
                  <p className="text-xs text-gray-600">{item.paymentType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Date: {new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>
              {expandedItem === index && (
                <div className="mt-4 bg-gray-100 p-4 rounded-md border border-gray-300">
                  <p className="text-xs text-gray-600">
                    Received by Driver: {item.driver_id ? 'Yes' : 'No'}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-gray-600 mb-2">Notes: {item.notes}</p>
                  )}
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant={'ghost'}
                      onClick={() => openEditModal(item)}
                      disabled={trip.status == 4}
                      className="flex items-center justify-center p-2 hover:bg-gray-200"
                    >
                      <MdEdit size={20} />
                    </Button>
                    <Button
                      variant={'ghost'}
                      onClick={() => handleDeleteItem(item)}
                      disabled={trip.status == 4}
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
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleAddItem}
        modalTitle={modalTitle}
        accountType={label}
      />
      {editData && (
        <Modal
          isOpen={!!editData}
          onClose={closeModal}
          onSave={handleEditItem}
          modalTitle={`Edit ${label.slice(0,label.length - 1)}`}
          accountType={label}
          editData={editData}
        />
      )}
    </div>
  );
};

export default DataList;
