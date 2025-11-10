// PartiesPage.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { FaPhone, FaSort, FaSortDown, FaSortUp, FaUserTie } from 'react-icons/fa6';
import { GoOrganization } from "react-icons/go";
import { FaAddressBook, FaObjectGroup } from 'react-icons/fa';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useExpenseData } from '@/components/hooks/useExpenseData';
import { handleExportToExcel } from '@/utils/excelOperation';
import { Button } from '@/components/ui/button';
import { BsFiletypeXlsx } from 'react-icons/bs';

const PartiesPage = () => {

  // mutate('/api/parties')
  const router = useRouter();

  const {parties, isLoading, refetchParties} = useExpenseData()

  // const [parties, setParties] = useState<IParty[] | null>(null);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })

  useEffect(() => {
    refetchParties()
  }, [refetchParties])

  const sortedParties = useMemo(() => {
    if (!parties || parties.length === 0) return []; // This line ensures that trips is not null or empty
    let sortableTrips = [...parties as any];
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
  }, [parties, sortConfig]);

  


  const requestSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName: any) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
    }
    return <FaSort />
  }

  const handleExport = ()=>{
    const selectedColums = ["name", "contactPerson", "contactNumber", "address", "gstNumber", "partyBalance"]
    handleExportToExcel(sortedParties,selectedColums, 'customers.xlsx')
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!parties || parties.length === 0) {
    return <div>No parties found</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <div className="">
        <div className='p-2 flex justify-end'>
        <Button onClick={()=>handleExport()}>
          <BsFiletypeXlsx size={20}/>
        </Button>
        </div>
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('name')}>
                <div className='flex justify-between'>
                  Name {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>PAN</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead onClick={() => requestSort('partyBalance')}>
                <div className='flex justify-between'>
                  Balance {getSortIcon('partyBalance')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedParties.map((party, index) => (
              <TableRow index={index + 1} key={party.party_id as string} className="border-t w-full cursor-pointer" onClick={() => router.push(`/user/parties/${party.party_id}/trips`)}>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <GoOrganization className="text-bottomNavBarColor" />
                    <span>{party.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaUserTie className="text-bottomNavBarColor" />
                    <span>{party.contactPerson}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaPhone className="text-green-500" />
                    <span>{party.contactNumber}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaAddressBook className="text-bottomNavBarColor" />
                    <span>{party.address}</span>
                  </div></TableCell>
                  <TableCell>{party.email}</TableCell>
                  <TableCell>{party.pan}</TableCell>
                <TableCell>{party.gstNumber}</TableCell>
                <TableCell><span className='text-green-600 font-semibold'>₹{formatNumber(party.partyBalance) || ''}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PartiesPage;
