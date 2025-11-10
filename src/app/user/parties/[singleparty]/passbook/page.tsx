'use client'

import TripRevenue from '@/components/trip/tripDetail/Profit/TripRevenue';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaRoute, FaSort, FaSortDown, FaSortUp, FaTruck } from 'react-icons/fa';
import Loading from '../loading';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useParty } from '@/context/partyContext';
import { Button } from '@/components/ui/button';
import { MdDelete, MdEdit } from 'react-icons/md';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PaymentBook } from '@/utils/interface';

interface ITrip {
  trip_id: string;
  date: Date;
  truck: string;
  description: {
    origin: string;
    destination: string;
  };
  amount: number;
}

interface IAccount {
  accountType: string;
  amount: number;
  date: Date;
  trip_id: string;
}

const SinglePartyPassbook = () => {
  const { party, setParty, loading } = useParty()
  const router = useRouter();
  console.log(party)

  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })
  const [selected, setSelected] = useState<PaymentBook | any>()
  const [isOpen, setIsOpen] = useState(false)

  const PaymentModal = dynamic(() => import('@/components/party/PaymentModal'))


  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/parties/${party.party_id}/payments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!res.ok) {
        throw new Error('Failed to Delete Payment')
      }
      const data = await res.json()
      const payment = data.payment
      setParty((prev: any) => ({
        ...prev,
        items: prev.items.filter((item: PaymentBook | ITrip | any) => item._id !== payment._id)
      }))
    } catch (error) {
      alert('Failed to delete payment')
    }
  }


  const handlePayment = async (payment: PaymentBook | any) => {
    try {
      const res = await fetch(`/api/parties/${party.party_id}/payments/${selected?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payment)
      })
      if (!res.ok) {
        throw new Error('failed to add payment')
      }
      const data = await res.json();
      const editedPayment = data.payment;
      const updatedItems = party.items.map((item: any) => item._id === editedPayment._id ? { ...editedPayment, description: editedPayment.accountType, type: 'payment' } : item)


      setParty({ ...party, items: updatedItems });

    } catch (error) {
      alert('failed to edit payment')
    }
  }

  const sortedAccounts = useMemo(() => {
    if (!party?.items || party?.items.length === 0) return []; // Ensure that partyAccount is not null or empty
    let sortableAccounts = [...party.items]; // Clone the array

    // Apply sorting if sortConfig.key is not null
    if (sortConfig.key !== null) {
      sortableAccounts.sort((a, b) => {
        if (sortConfig.key === 'date') {
          // Sort by date field
          const aDate = new Date(a.date);
          const bDate = new Date(b.date);

          if (aDate < bDate) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aDate > bDate) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } else {
          // Sort by other fields (e.g., amount, revenue, etc.)
          if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
      });
    }

    return sortableAccounts;
  }, [party, sortConfig]);



  const requestSort = (key: keyof ITrip | IAccount | any) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName: keyof ITrip | IAccount | any) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
    }
    return <FaSort />
  }


  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (party.items.length === 0) return <div>No transactions or trips for this party</div>;

  return (
    <div className="">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort('startDate')}>
              <div className='flex justify-between'>
                Date {getSortIcon('startDate')}
              </div>
            </TableHead>
            <TableHead>Details</TableHead>
            <TableHead onClick={() => requestSort('amount')}>
              <div className='flex justify-between'>
                Payment {getSortIcon('amount')}
              </div>
            </TableHead>
            <TableHead onClick={() => requestSort('revenue')}>
              <div className='flex justify-between'>
                Revenue {getSortIcon('revenue')}
              </div>
            </TableHead>
            <TableHead>
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAccounts.map((acc: any, index) => (
            <TableRow
              key={index}
              className=" cursor-none"

            >
              <TableCell>
                <div className='flex items-center space-x-2'>
                  <FaCalendarAlt className='text-bottomNavBarColor' />
                  <span>{new Date(acc.date).toLocaleDateString('en-IN')}</span>
                </div>

              </TableCell>
              <TableCell className="p-4">
                {acc.type === 'payment' ? (
                  <div className='flex justify-between'>
                    <span className="text-lg font-semibold">{acc.description}</span>
                    {acc.trip_id && <Link href={`/user/trips/${acc.trip_id}`}><Button className='text-red-500 text-sm' variant={'link'}>from a trip</Button></Link>}
                  </div>

                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <FaTruck className="text-bottomNavBarColor text-2xl" />
                      <span className="ml-1 text-lg font-semibold text-gray-800">{acc.truck}</span>
                    </div>
                    <div className="flex items-center space-x-3 border-l-2 border-gray-200 pl-4">
                      <FaRoute className="text-bottomNavBarColor text-2xl" />
                      <span className="text-gray-700 text-md font-medium">
                        {acc.description?.origin.split(',')[0]} &rarr; {acc.description?.destination.split(',')[0]}
                      </span>
                    </div>
                  </div>

                )}
              </TableCell>



              <TableCell><span className='text-green-500 font-semibold'>{acc.type === 'payment' && `₹${formatNumber(acc.amount)}`}</span></TableCell>
              <TableCell><span className='text-green-500 font-semibold'>₹{acc.accountType ? '' : formatNumber(acc.revenue)}</span></TableCell>
              <TableCell>
                <div>
                  {acc.type === 'trip' ? <Button variant={'outline'} onClick={() => router.push(`/user/trips/${acc.trip_id}`)}>View Trip</Button> :

                    (
                      <div className='flex items-center space-x-2'>
                        <Button variant={'outline'} onClick={() => {
                          setSelected({
                            ...acc,
                            accountType: acc.description
                          })
                          setIsOpen(true)
                        }}><MdEdit /></Button>
                        <Button variant={'destructive'} onClick={() => handleDelete(acc._id)}><MdDelete /></Button>
                      </div>
                    )

                  }
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaymentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        editData={selected}
        onSave={handlePayment} modalTitle={'Payment'} accountType={selected?.accountType || 'Payments'}
      />
    </div>
  );
};

export default SinglePartyPassbook;
