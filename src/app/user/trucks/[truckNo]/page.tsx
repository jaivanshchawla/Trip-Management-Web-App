'use client';
import React, { useEffect, useState,  } from 'react';
import { IExpense, } from '@/utils/interface';
import { useParams, useRouter } from 'next/navigation';
import { statuses } from '@/utils/schema';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { MdDelete, MdEdit } from 'react-icons/md';
import Link from 'next/link';
import { FaCalendarAlt, } from 'react-icons/fa';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteExpense, handleAddExpense, handleEditExpense } from '@/helpers/ExpenseOperation';
import { useTruck } from '@/context/truckContext';
import TripCard from '@/components/TripCard';
const Loading = dynamic(() => import('./loading'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});



const TruckPage = () => {
  const { truck, setTruck, loading } = useTruck()
  console.log(truck)
  const { truckNo } = useParams();
  const [revenue, setRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [modelOpen, setModelOpen] = useState(false);
  const [selected, setSelected] = useState<IExpense | null>(null);

  const AddExpenseModal = dynamic(() => import('@/components/AddExpenseModal'), { ssr: false })

  const handleExpense = async (editedExpense: IExpense) => {
    try {
      if (selected) {
        const expense: any = await handleEditExpense(editedExpense, selected._id as string);
        setTruck((prev: any) => ({
          ...prev,
          truckLedger: prev.truckLedger.map((item: any) => (item._id === expense._id ? expense : item)),
        }));
      } else {
        const expense: any = await handleAddExpense(editedExpense);
        setTruck((prev: any) => ({
          ...prev,
          truckLedger: [expense, ...prev.truckLedger], // Add new expense at the beginning
        }));
      }
    } catch (error) {
      alert('Failed to perform expense operation');
      console.log(error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const expense = await DeleteExpense(id);
      if (expense) {
        setTruck((prev: any) => ({
          ...prev,
          truckLedger: prev.truckLedger.filter((item: any) => item._id !== expense._id),
        }));
      }
    } catch (error) {
      alert('Failed to Delete Expense');
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profitRes] = await Promise.all([
          fetch(`/api/trucks/${truckNo}/summary`)
        ]);

        const [profitData] = await Promise.all([
          profitRes.ok ? profitRes.json() : []
        ])



        setTotalExpense(profitData.truckExpense);
        setRevenue(profitData.tripRevenue);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        alert(error.message);
      }
    };
    fetchData();
  }, [truckNo]);


  if (loading) return <Loading />;
  

  return (
    <div className="w-full h-full p-4">
      <div className="mb-4 flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-green-700">Total Revenue: <span className="text-black">₹{formatNumber(revenue)}</span></h2>
        <h2 className="text-lg font-bold text-red-700">Total Expense: <span className="text-black">₹{formatNumber(totalExpense)}</span></h2>
        <h2 className="text-lg font-bold text-blue-700">Profit: <span className="text-black">₹{formatNumber(revenue - totalExpense)}</span></h2>
      </div>

      <div className="table-container">
        <Table className="custom-table">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Expense</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {truck.truckLedger.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaCalendarAlt className='text-bottomNavBarColor' />
                    <span>{new Date(item.date || item.startDate).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.expenseType ? (
                    <div className="flex items-center space-x-2 p-2">
                      <span className="font-semibold text-lg text-gray-800">{item.expenseType}</span>
                      {item.trip_id && (
                        <Button variant={"link"} className="text-red-500 pt-1 rounded-lg">
                          <Link href={`/user/trips/${item.trip_id}`}>from a trip</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <TripCard
                      key={item.trip_id}
                      tripId={item.trip_id}
                      route={item.route}
                      partyName={item.partyName}
                      status={item.status}
                      statuses={statuses}
                    />
                  )}
                </TableCell>

                <TableCell>
                  <span className='text-red-500 font-semibold'>₹{item.expenseType ? formatNumber(item.amount) : 0}</span>
                </TableCell>
                <TableCell><span className='text-green-500 font-semibold'>₹{!item.expenseType ? formatNumber(item.tripRevenue) : ''}</span></TableCell>
                <TableCell>
                  {item.expenseType ?
                    <div className='flex space-x-2 justify-center items-center w-full p-1'>
                      <Button variant="outline" onClick={() => {
                        setSelected(item);
                        setModelOpen(true);
                      }}><MdEdit /></Button>
                      <Button onClick={() => handleDeleteExpense(item._id)} variant={'destructive'} ><MdDelete /></Button>
                    </div> :
                    <div className='flex items-center justify-center'>
                      <Link href={`/user/trips/${item.trip_id}`}><Button variant={'outline'} >View Trip</Button></Link>
                    </div>

                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AddExpenseModal
        isOpen={modelOpen}
        onClose={() => {
          setModelOpen(false);
          setSelected(null);
      }}
        onSave={handleExpense}
        truckNo={truckNo as string}
        categories={['Truck Expense', 'Trip Expense', 'Office Expense']} driverId={''}
        selected={selected} />
    </div>
  );
};

export default TruckPage;
