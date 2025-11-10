import React, { useEffect, useState } from 'react';
import { ITrip, TripExpense, } from '@/utils/interface';
import TripInfo from './TripInfo';
import TripStatus from './TripStatus';
import StatusButton from './TripFunctions/StatusButton'; // Replace with your actual StatusButton component
import ViewBillButton from './TripFunctions/ViewBill'; // Replace with your actual ViewBillButton component
import Profit from './Profit';
import DataList from './DataList';
import Charges from './Charges'; // Import the Charges component
import { Button } from '@/components/ui/button';
import { UndoIcon } from 'lucide-react';
import { formatNumber } from '@/utils/utilArray';
import Link from 'next/link';

import { useTrip } from '@/context/tripContext';
import dynamic from 'next/dynamic';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import { useToast } from '@/components/hooks/use-toast';
import LoadingSlip from './TripFunctions/LoadingSlip';
import { useSearchParams } from 'next/navigation';

const BiltyForm = dynamic(() => import('../BiltyForm'), { ssr: false, loading: () => loadingIndicator })
const FrieghtMemo = dynamic(() => import('../FrieghtMemo'), { ssr: false, loading: () => loadingIndicator })


const TripDetails = () => {
  const params = useSearchParams()
  const actionFromhome = params.get('open')
  const { trip, setTrip } = useTrip()
  const [charges, setCharges] = useState<TripExpense[]>([])
  const [biltyModalOpen, setBiltyModalOpen] = useState(actionFromhome === 'bilty' ? true : false)
  const [fmModalOpen, setFmModalOpen] = useState(actionFromhome === 'fm' ? true : false)
  const { toast } = useToast()
  const [advanceTotal, setAdvanceTotal] = useState(0);
  const [paymentTotal, setPaymentTotal] = useState(0);





  useEffect(() => {
    const sorted = trip.tripCharges?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setCharges(sorted);
  }, [trip]);

  const handleUndoStatus = async () => {
    const updateDates = (dates: (Date | null)[]): (Date | null)[] => {
      // Create a copy of the array to avoid mutating the original array
      const updatedDates = [...dates];

      for (let i = 1; i < updatedDates.length; i++) {
        if (updatedDates[i] === null) {
          updatedDates[i - 1] = null;
        }
      }

      return updatedDates;
    };
    if (trip.status == 0) {
      alert('Cannot Undo the Status')
      return
    }
    const data = {
      status: trip.status ? trip.status - 1 : alert('No Trip Status'),
      dates: updateDates(trip.dates)
    }
    try {
      const res = await fetch(`/api/trips/${trip.trip_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        throw new Error('Failed to settle amount');
      }
      const resData = await res.json();
      setTrip((prev: ITrip | any) => ({
        ...prev,
        ...resData.trip
      }));
      toast({
        description: 'Trip Status Updated'
      })
    } catch (error) {
      alert(error)
      console.log('Error settling amount:', error);
    }
  }

  const handleStatusUpdate = async (data: any) => {
    try {
      const res = await fetch(`/api/trips/${trip.trip_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        throw new Error('Failed to settle amount');
      }
      const resData = await res.json();
      setTrip((prev: ITrip | any) => ({
        ...prev,
        ...resData.trip
      }));
      toast({
        description: 'Trip Status Updated'
      })
    } catch (error) {
      toast({
        description: 'Failed to update Status',
        variant: 'destructive'
      })
      console.log('Error settling amount:', error);
    }

    if (data.status === 1) {
      try {
        const driverRes = await fetch(`/api/drivers/${trip.driver}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'Available' }), // Assuming your PATCH route can handle this
        });
        if (!driverRes.ok) {
          throw new Error('Failed to update driver status');
        }
        const truckRes = await fetch(`/api/trucks/${trip.truck}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'Available' }), // Assuming your PATCH route can handle this
        });
        if (!truckRes.ok) {
          throw new Error('Failed to update truck status');
        }
      } catch (error: any) {
        console.log(error);
        alert(error.message)
      }
    }

    if (data.status === 4 && trip.balance > 0) {
      const itemtosend = {
        ...data,
        accountType: 'Payments',
        trip_id: trip.trip_id,
        driver_id: data.receivedByDriver ? trip.driver : null
      }
      try {
        const res = await fetch(`/api/suppliers/${trip.supplier}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([itemtosend]), // Wrap in array as per API expectation
        });
        if (!res.ok) {
          throw new Error('Failed to add new item');
        }
        const resData = await res.json();
        if (resData.status == 400) {
          alert(resData.message);
        }
        setTrip((prev: ITrip | any) => ({
          ...prev,
          tripAccounts: [resData.payments[0], ...prev.tripAccounts],
          truckHireCost: prev.truckHireCost - resData.payments[0].amount // Update truck hire cost locally
        }))

      } catch (error: any) {
        alert('Failed to Add Payment')
      }
    }

  }

  return (
    <div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side - Trip Details */}
        <div className="col-span-2 pr-4 flex flex-col gap-2">
          {/* <TruckHeader truck={trip.truck} driver={trip.driver} /> */}

          <div className='grid grid-cols-4 gap-2'>
            <Link href={`/user/trucks/${trip.truck}`}>
              <TripInfo label="Lorry" value={trip.truck || '----'} supplierId={trip.supplier || ''} supplierName={trip.supplierName || ''} />
            </Link>
            <Link href={`/user/parties/${trip.party}/trips`}>
              <TripInfo label="Party Name" value={trip.partyName || '----'} />
            </Link>
            <Link href={`/user/drivers/${trip.driver}`}>
              <TripInfo label="Driver" value={trip.driverName || '----'} />
            </Link>
            <TripInfo label="Party Balance" value={`₹${formatNumber(trip.balance)}`} />
          </div>

          <div className='grid grid-cols-4 gap-2'>
            <TripInfo label="FM No" value={trip.fmNo || '----'} />
            <TripInfo label="LR Number" value={trip.LR || '----'} />
            <TripInfo label="Material" value={trip.material || '----'} guaranteedWeight={trip.guaranteedWeight}/>
            <TripInfo label="Billing Type" value={trip.billingType || '----'} />
          </div>

          <TripInfo label="Route" value={`${trip.route.origin} → ${trip.route.destination}`} startDate={trip.startDate} validityDate={trip?.documents?.find((doc: any) => doc.type === 'E-Way Bill')?.validityDate || null} />
          <div className=" w-full">
            <TripStatus status={trip.status as number} dates={trip.dates} />
          </div>
          <div className="col-span-3 flex flex-col items-center justify-center space-x-4 ">
            <div className='grid grid-cols-2 gap-4'>
              <StatusButton status={trip.status as number} statusUpdate={handleStatusUpdate} dates={trip.dates} amount={trip.balance} />
              <Button variant={'destructive'} onClick={handleUndoStatus} className='h-full'>
                <div className='flex items-center space-x-2 py-2'>
                  <UndoIcon />
                  <span>Undo Status</span>
                </div>
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">

              <ViewBillButton trips={[]} />
              <Button variant={'outline'} onClick={() => setFmModalOpen(true)}>Generate FM/Challan</Button>
              <Button onClick={() => setBiltyModalOpen(true)}>Generate Bilty</Button>
              <LoadingSlip trip={trip} charges={trip?.loadingSlipDetails?.charges || 0} haltingCharges={trip?.loadingSlipDetails?.haltingCharges || 0}/>

              {/* Add more buttons as needed */}
            </div>
          </div>

        </div>

        {/* Right Side - Profit, Balance, and POD Viewer */}
        <div className="col-span-1 space-y-6">
          <Profit charges={charges} truckCost={trip.truckHireCost && trip.truckHireCost} amount={trip.amount} setCharges={setCharges} tripId={trip.trip_id} driverId={trip.driver} truckNo={trip.truck} tripExpense={trip.tripExpenses} />
          <TripInfo label="Notes" value={trip.notes || 'No notes available'} tripId={trip.trip_id} />
          {/* <EWayBillUpload validity={trip.ewbValidityDate ? trip.ewbValidityDate : null} tripId={trip.trip_id} ewayBillUrl={trip.documents?.find(doc => doc.type == 'ewayBill')?.url || trip.ewayBill} setEwayBillUrl={setEwayBillUrl} />
          {trip.POD ? <PODViewer podUrl={trip.POD} /> : null} */}
        </div>
      </div>
      <div className='grid grid-cols-3 gap-2 mt-4'>
        {/* <div className='col-span-1 bg-[#FAFDFF] p-2 rounded-xl shadow-xl'><DataList
  label="Advances"
  modalTitle="Add Advance"
  displayLabel={`₹${formatNumber(advanceTotal)}`}
  // displayLabel="Party Payments"
  onTotalAdvanceChange={setAdvanceTotal}
/>
</div> */}
<div className="col-span-1 bg-[#FAFDFF] p-2 rounded-xl shadow-xl">
  <DataList
  label="Advances"
  modalTitle="Add Advance"
  displayLabel={
  <div className="flex justify-between items-center w-full text-gray-800 font-semibold gap-x-2">
    <span>Party Payments</span>
    <span>Total: ₹{formatNumber(advanceTotal)}</span>
  </div>
  }
  onTotalAdvanceChange={setAdvanceTotal}
/>

</div>

<div className='col-span-1 bg-[#FAFDFF] p-2 rounded-xl shadow-xl'>
  <DataList
    label="Payments"
    modalTitle="Add Payment"
    displayLabel={
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center w-full text-gray-800 font-semibold gap-x-2">
          <span>Supplier Payments</span>
          <span>Total: ₹{formatNumber(paymentTotal)}</span>
        </div>
        <div className="flex justify-end w-full text-sm text-green-700 font-semibold">
          Supplier Balance: ₹{formatNumber((trip.truckHireCost || 0) - paymentTotal)}
        </div>
      </div>
    }
    onTotalAdvanceChange={setPaymentTotal}
  />
</div>



        <div className='col-span-1 bg-[#FAFDFF] p-2 rounded-xl shadow-xl'><Charges tripId={trip.trip_id} /></div>


      </div>
      <BiltyForm isOpen={biltyModalOpen} onClose={() => setBiltyModalOpen(false)} trip={trip} setTrip={setTrip} />
      <FrieghtMemo isOpen={fmModalOpen} onClose={() => setFmModalOpen(false)} />
    </div>
  );
};


export default TripDetails
