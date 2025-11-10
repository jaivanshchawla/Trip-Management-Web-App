'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ITrip, IParty } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { FaCalendarAlt, FaTruck, FaRoute, FaFileInvoiceDollar, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/utils/utilArray';
import { useTruck } from '@/context/truckContext';
import Loading from '../loading'

// Dynamically import the Loading component


const TruckTripsPage = () => {
  const {truck, setTruck, loading} = useTruck()
  const router = useRouter();
  const { truckNo } = useParams();
  
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<IParty[]>([]);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })

  const trips = useMemo(()=>{
    let filteredTrips: any = []
    if (!truck?.truckLedger || truck?.truckLedger?.length === 0) return []; 
    truck.truckLedger.map((item : any)=>{
      if(item.type === 'trip') filteredTrips.push(item)
    })
    return filteredTrips
  },[truck])

  const sortedTrips = useMemo(() => {
    if (!truck?.truckLedger || truck?.truckLedger?.length === 0) return []; // This line ensures that trips is not null or empty
    let sortableTrips = [...trips as any];
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
  }, [trips, sortConfig]);


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

  // useEffect(() => {
  //   const fetchTrips = async () => {
  //     try {
  //       const res = await fetch(`/api/trips/truck/${truckNo}`);
  //       if (!res.ok) {
  //         throw new Error('Failed to fetch trips');
  //       }
  //       const data = await res.json();
  //       setTrips(data.trips);
  //     } catch (err) {
  //       setError((err as Error).message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const fetchParties = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await fetch('/api/parties');
  //       if (!res.ok) {
  //         throw new Error('Failed to fetch parties');
  //       }
  //       const data = await res.json();
  //       setParties(data.parties);
  //     } catch (err) {
  //       setError((err as Error).message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTrips();
  //   fetchParties();
  // }, [truckNo]);

  const renderedTrips = useMemo(() => (
    sortedTrips.map((trip, index) => (
      <TableRow
        key={trip.trip_id}
        className="border-t hover:bg-orange-100 cursor-pointer transition-colors"
        onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
      >
        <TableCell className="border p-4 ">
          <div className='flex items-center space-x-2'>


            <FaCalendarAlt className="text-[rgb(247,132,50)]" />
            <span>{new Date(trip.startDate).toLocaleDateString()}</span>
          </div>
        </TableCell>
        <TableCell className="border p-4">{trip.LR}</TableCell>
        <TableCell className="border p-4">
          <div className='flex items-center space-x-2'>
            <span>{trip.partyName}</span>
          </div>
        </TableCell>
        <TableCell className="border p-4 ">
          <div className='flex items-center space-x-2'>
            <FaRoute className="text-[rgb(247,132,50)]" />
            <span>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</span>
          </div>

        </TableCell>
        <TableCell className="border p-4">
          <div className="flex flex-col items-center space-x-2">
            <span>{statuses[trip.status as number]}</span>
            <div className="relative w-full bg-gray-200 h-1 rounded">
              <div className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`} style={{ width: `${(trip.status as number / 4) * 100}%` }}></div>
            </div>
          </div>
        </TableCell>
      </TableRow>
    ))
  ), [trips, parties, router]);

  if (loading) return <Loading />;

  return (
    <div className="w-full h-full p-4">
      {error && <div className="text-red-500">{error}</div>}
      <div className="table-container">
        <Table className="custom-table">
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('startDate')}>
                <div className='flex justify-between'>
                  Start Date {getSortIcon('startDate')}
                </div>

              </TableHead>
              <TableHead>LR Number</TableHead>
              <TableHead onClick={() => requestSort('partyName')}>
                <div className='flex justify-between'>
                  Party Name{getSortIcon('partyName')}
                </div>
              </TableHead>
              <TableHead>Route</TableHead>
              <TableHead onClick={()=>requestSort('status')}>
              <div className='flex justify-between'>
                  Status{getSortIcon('status')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderedTrips}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default React.memo(TruckTripsPage);
