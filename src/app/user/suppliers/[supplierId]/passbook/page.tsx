'use client'
import Loading from '../../loading'
import TripRoute from '@/components/trip/TripRoute'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSupplier } from '@/context/supplierContext'
import { ISupplierAccount, ITrip } from '@/utils/interface'
import { formatNumber } from '@/utils/utilArray'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCalendarAlt, FaRoute, FaTruck, FaWallet } from 'react-icons/fa'
import { MdDelete, MdEdit } from 'react-icons/md'

const SupplierPassbook = () => {
  const router = useRouter()
  const { supplierId } = useParams()
  const { supplier, setSupplier, loading } = useSupplier()
  // const fetchData = async () => {
  //   const [tripRes, paymentRes] = await Promise.all([
  //     fetch(`/api/suppliers/${supplierId}/payments/trips`),
  //     fetch(`/api/suppliers/${supplierId}/payments`)
  //   ])

  //   const [tripData, paymentData] = await Promise.all([
  //     tripRes.ok ? tripRes.json() : [],
  //     paymentRes.ok ? paymentRes.json() : []
  //   ])

  //   setTrips(tripData.trips)
  //   setAccounts(paymentData.supplierAccounts)
  //   setLoading(false)
  // }

  // useEffect(() => {
  //   fetchData()
  // }, [supplierId])

  const handleDeleteAccount = async (paymentId: string) => {
    const res = await fetch(`/api/suppliers/${supplierId}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) {
      alert('Failed to delete payment')
      return
    }
    const data = await res.json()
    console.log(data)
    // setAccounts(accounts.filter((acc: ISupplierAccount) => acc._id !== paymentId))
    setSupplier((prev: any) => ({
      ...prev,
      supplierTripAccounts: prev.supplierTripAccounts.filter((acc: any) => acc._id !== paymentId),
      balance : prev.balance - data.payment.amount
    }))
  }

  if (loading) return <Loading />

  return (
    <div className="w-full h-full p-4">
      <div className="table-container">
        <Table className="custom-table">
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead className="border p-2">Date</TableHead>
              <TableHead className="border p-2">Details</TableHead>
              <TableHead className="border p-2">Payment</TableHead>
              <TableHead className="border p-2">Expense</TableHead>
              <TableHead className='border p-2'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supplier.supplierTripAccounts && supplier.supplierTripAccounts.map((acc: any, index: number) => (
              <TableRow key={index} className="border-t hover:bg-slate-100 cursor-pointer">
                <TableCell className="border p-2">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-bottomNavBarColor" />
                    <span>{new Date(acc.date).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell className="border p-2">
                  {acc.type === 'payment' ?
                    <div className='flex justify-between'>
                      <div className='flex items-center space-x-2'>
                        <FaWallet className='text-bottomNavBarColor' />
                        <span>Payment</span>
                      </div>
                      <div>
                        {acc.route && acc.trip_id && <p>{acc.route.origin.split(',')[0]} &rarr; {acc.route.destination.split(',')[0]}</p>}
                      </div>
                    </div> :
                    <div className="flex items-center justify-between space-y-2">
                      <span className="font-medium flex items-center space-x-2 p-1"><FaWallet className='text-bottomNavBarColor' /><span>Truck Hire Cost</span></span>

                      <span className=" text-gray-600 flex items-center space-x-2 p-1">
                        <FaRoute className='text-bottomNavBarColor' />
                        <p>{acc.route.origin.split(',')[0]} &rarr; {acc.route.destination.split(',')[0]}</p>
                      </span>
                    </div>
                  }

                </TableCell>
                <TableCell className="border p-2"><span className='text-green-600 font-semibold'>{acc.type === 'payment' && `₹${formatNumber(acc.amount)}`}</span></TableCell>
                <TableCell className="border p-2"><span className='text-red-600 font-semibold'>{acc.type === 'trip' && `₹${formatNumber(acc.amount)}`}</span></TableCell>
                <TableCell className='border p-2'>
                  {acc.type === 'payment' ?
                    <div className='flex items-center space-x-2'>

                      <Button variant={'destructive'} onClick={() => handleDeleteAccount(acc._id)}><MdDelete /></Button>
                      {acc.trip_id && <Link href={`/api/trips/${acc.trip_id}`}><Button variant={'outline'}>View Trip</Button></Link>}
                    </div> :
                    <div className='flex items-center gap-2'>
                      <Link href={`/user/trips/${acc.trip_id}`}><Button variant={'outline'}>View Trip</Button></Link>
                    </div>
                  }

                </TableCell>
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default SupplierPassbook