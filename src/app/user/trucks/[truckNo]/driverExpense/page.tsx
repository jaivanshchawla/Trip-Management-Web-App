'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { IExpense } from '@/utils/interface';
import { useParams } from 'next/navigation';
import { MdDelete, MdEdit, MdLocalGasStation, MdPayment } from 'react-icons/md';
import { DeleteExpense, handleAddCharge, handleAddExpense, handleDelete, handleEditExpense } from '@/helpers/ExpenseOperation';
import { fetchDriverName } from '@/helpers/driverOperations';
import TripRoute from '@/components/trip/TripRoute';
import DriverName from '@/components/driver/DriverName';
import { FaCalendarAlt } from 'react-icons/fa';
import { IconKey, icons } from '@/utils/icons';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Dynamically import ExpenseModal to split the code


const OtherExpense = () => {
  const { truckNo } = useParams();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [otherExpenses, setOtherExpenses] = useState<IExpense[] | any[]>([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [selected, setSelected] = useState<IExpense | null>(null);

  const AddExpenseModal = dynamic(() => import('@/components/AddExpenseModal'), {
    loading: () => <Loading />,
  });

  const fetchOther = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trucks/${truckNo}/expense?type=other`);
      if (!res.ok) {
        throw new Error('Failed to fetch other expenses');
      }
      const data = await res.json();
      setOtherExpenses(data.expenses);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOther();
  }, [truckNo]);

  const handleDelete = async (id: string, e: React.FormEvent) => {
    e.stopPropagation();
    try {
      const expense = await DeleteExpense(id)
      setOtherExpenses(otherExpenses.filter((item) => item._id !== id));
    } catch (error: any) {
      alert('Failed to delete expense')
      console.log(error)
    }
  };

  const handleAddCharge = async (newCharge: any, id?: string) => {
    try {
      if (!selected) {
        const expense = await handleAddExpense(newCharge)
        setOtherExpenses((prev) => [
          expense,
          ...prev
        ])
      } else {
        const expense = await handleEditExpense(newCharge, selected._id as string)
        setOtherExpenses((prev) => prev.map((item: any) => item._id === selected._id ? { ...item, ...expense } : item))
      }
    } catch (error: any) {
      console.log(error);
      alert(`Failed to ${selected ? 'edit' : 'add'} expense`)
    }
  };

  const renderedExpenses = useMemo(() => (
    otherExpenses.map((expense, index) => (
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
            {icons[expense.expenseType as IconKey]}
            <span>{expense.expenseType}</span>
          </div>
        </TableCell>
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
    ))
  ), [otherExpenses, handleDelete]);

  if (loading) return <Loading />;

  return (
    <div className="w-full h-full p-4">
      <div className="table-container">
        <Table className="custom-table">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Expense Type</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Trip</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderedExpenses}
          </TableBody>
        </Table>
      </div>
      {modelOpen && (
        <AddExpenseModal
          isOpen={modelOpen}
          onClose={() => {
            setModelOpen(false);
            setSelected(null);
        }}
          onSave={handleAddCharge}
          driverId={selected?.driver || ''}
          selected={selected} categories={['Truck Expense', 'Trip Expense', 'Office Expense']} />
      )}
    </div>
  );
};

export default React.memo(OtherExpense);
