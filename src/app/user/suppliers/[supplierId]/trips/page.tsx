'use client'
import { Button } from '@/components/ui/button'
import {  ITrip } from '@/utils/interface'
import { statuses } from '@/utils/schema'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import Loading from '../../loading'
import { FaCalendarAlt, FaTruck, FaRoute, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa'
import { formatNumber } from '@/utils/utilArray'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSupplier } from '@/context/supplierContext'


const SupplierDetailPage = () => {

    const {supplier, setSupplier, loading} = useSupplier()
    const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })

    const sortedTrips = useMemo(() => {
      if (!supplier?.supplierTripAccounts || supplier?.suppplierTripAccounts?.length === 0) return []; // This line ensures that trips is not null or empty
      let sortableTrips = [...supplier.supplierTripAccounts as any];
      if (sortConfig.key !== null) {
        sortableTrips.sort((a, b) => {
          if (a[sortConfig.key!] < b[sortConfig.key!]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key!] > b[sortConfig.key!]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      return sortableTrips;
    }, [supplier, sortConfig]);
  
  
    const requestSort = (key: keyof ITrip) => {
      let direction: 'asc' | 'desc' = 'asc'
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc'
      }
      setSortConfig({ key, direction })
    }
  
    const getSortIcon = (columnName: keyof ITrip) => {
      if (sortConfig.key === columnName) {
        return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
      }
      return <FaSort />
    }

    // const fetchSupplierTrips = async (supplierId: string) => {
    //     const res = await fetch(`/api/trips/supplier/${supplierId}`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     })
    //     const data = await res.json()
    //     console.log(data)
    //     setTrips(data.trips)
    //     setLoading(false)
    // }

    // useEffect(() => {
    //     if (supplierId) {
    //         fetchSupplierTrips(supplierId as string)
    //     }
    // }, [supplierId])

    if (loading) {
        return <Loading />
    }
    return (
        <div className="w-full h-full p-4">
            <div className="table-container">
                <Table className="custom-table">
                    <TableHeader>
                        <TableRow className="bg-gray-200">
                            <TableHead onClick={()=> requestSort('startDate')}>
                                <div className='flex justify-between'>
                                Start Date {getSortIcon('startDate')}
                                </div>
                                </TableHead>
                            <TableHead>Truck Number</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead onClick={()=> requestSort('truckHireCost')}>
                            <div className='flex justify-between'>
                                Truck Hire Cost {getSortIcon('truckHireCost')}
                                </div>
                            </TableHead>
                            <TableHead onClick={()=>requestSort('status')}>
                            <div className='flex justify-between'>
                                Status {getSortIcon('status')}
                                </div>
                            </TableHead>
                            <TableHead  onClick={()=> requestSort('amount')}>
                            <div className='flex justify-between'>
                                Trip Amount {getSortIcon('amount')}
                                </div>
                            </TableHead>
                            <TableHead className='border p-2'>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTrips.map((trip, index) => (
                            trip.type === 'trip' &&
                            <TableRow key={index} className="border-t hover:bg-slate-100 cursor-pointer">
                                <TableCell className="border p-4">
                                <div className='flex items-center space-x-2'>
                                    <FaCalendarAlt className="text-bottomNavBarColor" />
                                    <span>{new Date(trip.date).toLocaleDateString()}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="border p-4 ">
                                    <div className='flex items-center space-x-2'>
                                        <FaTruck className="text-bottomNavBarColor" />
                                        <span>{trip.truck}</span>
                                    </div>

                                </TableCell>
                                <TableCell className="border p-4">
                                    <div className='flex items-center space-x-2'>
                                        <FaRoute className="text-bottomNavBarColor" />
                                        <span>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</span>
                                    </div>

                                </TableCell>
                                <TableCell><span className='text-red-500 font-semibold'>₹{formatNumber(trip.truckHireCost)}</span></TableCell>
                                <TableCell className="border p-4">
                                    <div className="flex flex-col items-center space-x-2">
                                        <span>{statuses[trip.status as number]}</span>
                                        <div className="relative w-full bg-gray-200 h-1 rounded">
                                            <div className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`} style={{ width: `${(trip.status as number / 4) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><span className='font-semibold text-green-500'>₹{formatNumber(trip.amount)}</span></TableCell>
                                <TableCell><Link href={`/user/trips/${trip.trip_id}`}><Button variant='outline'>View Trip</Button></Link></TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default SupplierDetailPage