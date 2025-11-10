'use client'
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaCalendarAlt } from 'react-icons/fa';
import { MdDelete, MdEdit, MdPayment } from 'react-icons/md';
import DriverName from '@/components/driver/DriverName';
import TripRoute from '@/components/trip/TripRoute';
import { Button } from '@/components/ui/button';
import Loading from '../loading';
import { IExpense } from '@/utils/interface';
import { formatNumber } from '@/utils/utilArray';
import dynamic from 'next/dynamic';
import { DeleteExpense, handleAddExpense, handleEditExpense } from '@/helpers/ExpenseOperation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TripDetails {
  [key: string]: string;
}

const TruckFuelBook: React.FC = () => {
  const { truckNo } = useParams();
  const [fuelBook, setFuelBook] = useState<IExpense[] | any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripDetails, setTripDetails] = useState<TripDetails>({});
  const [modelOpen, setModelOpen] = useState(false);
  const [selected, setSelected] = useState<IExpense | null>(null);

  const AddExpenseModal = dynamic(() => import('@/components/AddExpenseModal'), { ssr: false })

  const fetchFuel = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trucks/${truckNo}/expense?type=fuel`);
      if (!res.ok) throw new Error('Failed to fetch fuel book');
      const data = await res.json();
      setFuelBook(data.expenses);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, [truckNo]);

  useEffect(() => {
    fetchFuel();
  }, [fetchFuel]);

  const handleDelete = async (id: string, e: React.FormEvent) => {
    e.stopPropagation();
    try {
      const expense = await DeleteExpense(id)
      setFuelBook(fuelBook.filter((item) => item._id !== id));
    } catch (error: any) {
      alert('Failed to delete expense')
      console.log(error)
    }
  };

  const handleAddCharge = async (newCharge: any, id?: string) => {
    try {
      if (!selected) {
        const expense = await handleAddExpense(newCharge)
        setFuelBook((prev) => [
          expense,
          ...prev
        ])
      } else {
        const expense = await handleEditExpense(newCharge, selected._id as string)
        setFuelBook((prev) => prev.map((item: any) => item._id === selected._id ? { ...item, expense } : item))
      }
    } catch (error: any) {
      console.log(error);
      alert(`Failed to ${selected ? 'edit' : 'add'} expense`)
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full h-full p-4">
      <div className="table-container">
      <Table >
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Trip</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fuelBook?.map((expense, index) => (
              <TableRow
              key={index}
              className="border-t hover:bg-slate-100"
            >
              <TableCell>
                <div className='flex items-center space-x-2'>
                  <FaCalendarAlt className='text-bottomNavBarColor' />
                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                </div>
              </TableCell>

              <TableCell className="border p-4">₹{formatNumber(expense.amount)}</TableCell>
              <TableCell className="border p-4">
                <div className="flex items-center space-x-2">
                  <MdPayment className="text-green-500" />
                  <span>{expense.paymentMode}</span>
                </div>
              </TableCell>
              <TableCell className="border p-4">{expense.notes || ''}</TableCell>
              <TableCell className="border p-4">{expense.driverName}</TableCell>
              <TableCell className="border p-4"><span>{expense.trip_id ? <span>{expense.tripRoute?.origin.split(',')[0]} &rarr; {expense.tripRoute?.destination.split(',')[0]}</span> : "NA"}</span></TableCell>
              <TableCell>
                <div className='flex items-center space-x-2'>
                  <Button variant="outline" onClick={() => { setSelected(expense); setModelOpen(true); }}>
                    <MdEdit />
                  </Button>
                  <Button variant="destructive" onClick={(e) => handleDelete(expense._id as string, e)}>
                    <MdDelete />
                  </Button>
                </div>

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
        onSave={handleAddCharge}
        driverId={selected?.driver || ''}
        selected={selected} categories={['Truck Expense', 'Trip Expense', 'Office Expense']}      />
    </div>
  );
};

export default React.memo(TruckFuelBook);
