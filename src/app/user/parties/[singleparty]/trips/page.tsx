'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { FaCalendarAlt, FaTruck, FaRoute, FaFileInvoiceDollar, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import Loading from '../loading';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useParty } from '@/context/partyContext';
import { renderCellContent } from '@/utils/renderTripCell';

const SinglePartyTrips = () => {
  const { party, loading } = useParty();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ITrip | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  const columnOptions = [
    { label: 'Start Date', value: 'date' },
    { label: 'LR Number', value: 'LR' },
    { label: 'Truck Number', value: 'truck' },
    { label: 'Route', value: 'description' },
    { label: 'Status', value: 'status' },
    { label: 'Invoice Amt', value: 'invoice' },
  ];

  // Memoized sorted trips
  const sortedTrips = useMemo(() => {
    if (!party?.items || party?.items?.length === 0) return []; // Ensure trips is not null or empty
    let sortableTrips: ITrip[] = [];

    // Filter trips based on type
    party.items.forEach((item: any) => {
      if (item.type === 'trip') sortableTrips.push(item);
    });

    // Apply sorting if sortConfig key is not null
    if (sortConfig.key) {
      sortableTrips.sort((a: ITrip, b: ITrip) => {
        const aValue = a[sortConfig.key as keyof ITrip];
        const bValue = b[sortConfig.key as keyof ITrip];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sortableTrips;
  }, [party, sortConfig]);

  // Function to request sorting
  const requestSort = (key: keyof ITrip) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Function to get sort icon
  const getSortIcon = (columnName: keyof ITrip) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (party?.items?.length === 0) return <div>No trips for this party</div>;

  return (
    <div className="">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort('startDate')}>
              <div className='flex justify-between'>
                Start Date {getSortIcon('startDate')}
              </div>
            </TableHead>
            <TableHead>LR Number</TableHead>
            <TableHead>Truck Number</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Status</TableHead>
            <TableHead onClick={() => requestSort('balance')}>
              <div className='flex justify-between'>
                Amount {getSortIcon('amount')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrips?.map((trip: any) => (
            <TableRow
              key={trip.trip_id}
              className="border-t hover:bg-orange-100 cursor-pointer transition-colors"
              onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
            >
              {columnOptions.map(col =>
                <TableCell key={col.value}>
                  {renderCellContent(col.value, trip)}
                </TableCell>

              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SinglePartyTrips;
