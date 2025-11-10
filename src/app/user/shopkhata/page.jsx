// PartiesPage.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/user/loading'
import { FaPhone } from 'react-icons/fa6';
import { GoOrganization } from "react-icons/go";
import { FaAddressBook, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { formatNumber } from '@/utils/utilArray';
import debounce from 'lodash.debounce';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useExpenseData } from '@/components/hooks/useExpenseData';

const ShopKhataPage = () => {
  const {shops, isLoading, refetchShops} = useExpenseData()
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState(''); // Track the search query



  useEffect(() => {
    refetchShops()
  }, [refetchShops])

  const requestSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort icon logic
  const getSortIcon = (columnName: any) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  // Debounce the search input to reduce re-renders on each keystroke
  const debouncedSearch = useCallback(
    debounce((query) => setSearchQuery(query), 300),
    []
  );

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value.toLowerCase());
  };

  // Filter and sort suppliers based on search query and sort configuration
  const filteredAndSortedShops = useMemo(() => {
    let filteredShops = shops;

    // Filter based on search query
    if (searchQuery) {
      filteredShops = shops.filter((shop: any) =>
        shop.name.toLowerCase().includes(searchQuery) ||
        shop.contactNumber.toString().includes(searchQuery) ||
        shop.address.toString().includes(searchQuery) ||
        shop.balance.toString().includes(searchQuery) ||
        shop.gstNumber.toString().includes(searchQuery)
      );
    }

    // Sort the suppliers
    if (sortConfig.key !== null) {
      filteredShops.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredShops;
  }, [shops, searchQuery, sortConfig]);


  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!shops || shops.length === 0) {
    return <div>No Shops found</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <input type='text' placeholder='Search' onChange={handleSearch} />
      <div className='mt-2'>
        <Table >
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('name')}>
                <div className='flex justify-between'>
                  Name {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead onClick={() => requestSort('address')}>
                <div className='flex justify-between'>
                  Address {getSortIcon('address')}
                </div>
              </TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead onClick={() => requestSort('name')}>
                <div className='flex justify-between'>
                  Shop Balance {getSortIcon('balance')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedShops.map((shop, index) => (
              <TableRow index={index + 1} key={shop.shop_id as string} className="border-t w-full cursor-pointer" onClick={() => router.push(`/user/shopkhata/${shop.shop_id}`)}>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <GoOrganization className="text-bottomNavBarColor" />
                    <span>{shop.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaPhone className="text-green-500" />
                    <span>{shop.contactNumber}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaAddressBook className="text-bottomNavBarColor" />
                    <span>{shop.address}</span>
                  </div></TableCell>
                <TableCell>{shop.gstNumber}</TableCell>
                <TableCell><span className={`${shop.balance > 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>₹{formatNumber(shop.balance)}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShopKhataPage;
