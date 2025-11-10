'use client'
import TripCard from '@/components/TripCard';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { statuses } from '@/utils/schema';
import { truckTypesIcons } from '@/utils/utilArray';
import debounce from 'lodash.debounce';
import {useRouter} from 'next/navigation';
import { Input } from '@/components/ui/input';
import React, { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import Loading from '../../loading';
import { useSupplier } from '@/context/supplierContext';
import Link from 'next/link';

const SupplierTrucks = () => {
    const router = useRouter();
    const { supplier, setSupplier, loading } = useSupplier()
    const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useMemo(
        () => debounce((query: string) => setSearchQuery(query), 300),
        []
    );

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value.toLowerCase());
    }, [debouncedSearch]);

    const sortedTrucks = useMemo(() => {
        if (!supplier?.supplierTrucks || supplier?.supplierTrucks.length === 0) return [];

        let filteredTrucks = [...supplier?.supplierTrucks];

        if (searchQuery) {
            const lowercaseQuery = searchQuery.toLowerCase();
            filteredTrucks = filteredTrucks.filter((truck) =>
                Object.values(truck).some(value =>
                    typeof value === 'string' && value.toLowerCase().includes(lowercaseQuery)
                ) ||
                truck.latestTrip?.partyName?.toLowerCase().includes(lowercaseQuery) ||
                truck.latestTrip?.route?.origin.toLowerCase().includes(lowercaseQuery) ||
                truck.latestTrip?.route?.destination.toLowerCase().includes(lowercaseQuery) ||
                new Date(truck.latestTrip?.startDate).toLocaleDateString().includes(lowercaseQuery)
            );
        }

        if (sortConfig.key) {
            filteredTrucks.sort((a, b) => {
                if (a[sortConfig.key!] < b[sortConfig.key!]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key!] > b[sortConfig.key!]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredTrucks;
    }, [sortConfig, searchQuery]);

    const requestSort = useCallback((key: any) => {
        setSortConfig((prevConfig: any) => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    const getSortIcon = useCallback((columnName: any) => {
        if (sortConfig.key === columnName) {
            return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    }, [sortConfig]);

    if (loading) return <Loading />;

    if (!supplier?.supplierTrucks || supplier?.supplierTrucks.length === 0) {
        return <div className="text-gray-500 text-center py-8">No trucks found</div>;
    }

    return (
        <div className="w-full h-full p-4">
            <div className="flex w-full px-60 mb-2">
                <Input
                    type="text"
                    placeholder="Search..."
                    onChange={handleSearch}
                    className="w-full"
                />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Truck Number</TableHead>
                        <TableHead onClick={() => requestSort('truckType')} className="cursor-pointer">
                            <div className="flex justify-between items-center">
                                Truck Type {getSortIcon('truckType')}
                            </div>
                        </TableHead>
                        <TableHead onClick={() => requestSort('status')} className="cursor-pointer">
                            <div className="flex justify-between items-center">
                                Status {getSortIcon('status')}
                            </div>
                        </TableHead>
                        <TableHead>Latest Trip</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTrucks.map((truck) => {
                        const Icon = truckTypesIcons.find(item => item.type === truck.truckType)?.Icon;
                        return (
                            <TableRow
                                key={truck.truckNo}
                                className="border-t hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                                onClick={() => router.push(`/user/trucks/${truck.truckNo}`)}
                            >
                                <TableCell className="text-gray-800 font-medium">
                                    <div className="flex flex-col space-y-2">
                                        {truck.truckNo}
                                        {truck.driverName && (
                                            <span className="text-gray-400 text-sm">
                                                Driver:
                                                <Button variant="link" asChild>
                                                    <Link
                                                        href={`/user/drivers/${truck.driver_id}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {truck.driverName}
                                                    </Link>
                                                </Button>
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2 justify-between">
                                        <span>{truck.truckType}</span>
                                        {Icon && <Icon className="inline-block ml-2 h-6 w-6 text-bottomNavBarColor" />}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${truck.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {truck.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {truck.latestTrip && Object.keys(truck.latestTrip).length > 0 ? (
                                        <TripCard
                                            key={truck.latestTrip.trip_id}
                                            tripId={truck.latestTrip.trip_id}
                                            route={truck.latestTrip.route}
                                            partyName={truck.latestTrip.partyName}
                                            status={truck.latestTrip.status}
                                            statuses={statuses}
                                            startDate={truck.latestTrip.startDate}
                                        />
                                    ) : (
                                        'NA'
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

export default SupplierTrucks