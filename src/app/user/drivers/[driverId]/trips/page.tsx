'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import { FaCalendarAlt, FaTruck, FaRoute, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Loading from '../loading';
import PartyName from '@/components/party/PartyName';
import { useDriver } from '@/context/driverContext';
import { renderCellContent } from '@/utils/renderTripCell';

const DriverTrips: React.FC = () => {
  const { driver, loading } = useDriver();
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<{ key: keyof ITrip | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  const columnOptions = [
    { label: 'Start Date', value: 'startDate' },
    { label: 'Truck Number', value: 'truck' },
    { label: 'Party Name', value: 'party' },
    { label: 'Route', value: 'route' },
    { label: 'Status', value: 'status' },
  ];

  const trips = driver?.driverTrips || [];

  const sortedTrips = useMemo(() => {
    if (trips.length === 0) return [];
    const sortableTrips = [...trips];
    if (sortConfig.key) {
      sortableTrips.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key!] > b[sortConfig.key!]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableTrips;
  }, [trips, sortConfig]);

  const requestSort = (key: keyof ITrip) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName: keyof ITrip) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  if (loading) return <Loading />;
  if (!trips.length) return <div>No trips for this driver</div>;

  return (
    <div className="table-container flex flex-col justify-start gap-3">
      <Table className="custom-table">
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort('startDate')}>
              <div className="flex justify-between">
                Start Date {getSortIcon('startDate')}
              </div>
            </TableHead>
            <TableHead>Truck Number</TableHead>
            <TableHead>Route</TableHead>
            <TableHead onClick={() => requestSort('status')}>
              <div className="flex justify-between">
                Status {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead onClick={() => requestSort('partyName')}>
              <div className="flex justify-between">
                Party Name {getSortIcon('partyName')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrips.map((trip) => (
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

export default DriverTrips;
