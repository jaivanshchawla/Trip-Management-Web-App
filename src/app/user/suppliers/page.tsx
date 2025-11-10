// PartiesPage.tsx
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ISupplier } from '@/utils/interface';
import Loading from './loading';
import { useRouter } from 'next/navigation';
import { FaUserTie, FaPhone, FaTruck, FaWallet, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { formatNumber } from '@/utils/utilArray';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import debounce from 'lodash.debounce';
import { useExpenseData } from '@/components/hooks/useExpenseData';

const SuppliersPage = () => {

  const router = useRouter();
  const {suppliers, isLoading, refetchSuppliers} = useExpenseData()
  // const [suppliers, setSuppliers] = useState<ISupplier[] | any>([]);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState(''); // Track the search query

  useEffect(() => {
    refetchSuppliers()
  }, [refetchSuppliers])

  // Fetch suppliers data
  // useEffect(() => {
  //   const fetchSuppliers = async () => {
  //     try {
  //       const res = await fetch('/api/suppliers', {
  //         method: 'GET',
  //         headers: { 'Content-Type': 'application/json' },
  //       });

  //       if (!res.ok) {
  //         throw new Error('Failed to fetch suppliers');
  //       }

  //       const data = await res.json();
  //       setSuppliers(data.suppliers);
  //     } catch (err) {
  //       setError((err as Error).message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchSuppliers();
  // }, []);

  // Function to request sorting
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
  const filteredAndSortedSuppliers = useMemo(() => {
    let filteredSuppliers = suppliers;

    // Filter based on search query
    if (searchQuery) {
      filteredSuppliers = suppliers.filter((supplier: any) =>
        supplier.name.toLowerCase().includes(searchQuery) ||
        supplier.contactNumber.toString().includes(searchQuery) ||
        supplier.tripCount.toString().includes(searchQuery) ||
        supplier.balance.toString().includes(searchQuery)
      );
    }

    // Sort the suppliers
    if (sortConfig.key !== null) {
      filteredSuppliers.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredSuppliers;
  }, [suppliers, searchQuery, sortConfig]);


  // useEffect(() => {
  //   const fetchSuppliers = async () => {
  //     try {
  //       const res = await fetch('/api/suppliers', {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       if (!res.ok) {
  //         throw new Error('Failed to fetch suppliers');
  //       }

  //       const data = await res.json();
  //       setSuppliers(data.suppliers);
  //     } catch (err) {
  //       setError((err as Error).message);
  //     } finally {
  //       setTimeout(() => {
  //         setLoading(false);
  //       }, 1000);
  //     }
  //   };

  //   fetchSuppliers();
  // }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">No Suppliers found</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <input
        type="text"
        placeholder="Search"
        onChange={handleSearch}
      />
      <div className="mt-2">
        <Table className="">
          <TableHeader>
            <TableRow className="">
              <TableHead onClick={() => requestSort('name')}>
                <div className='flex justify-between'>
                  Supplier Name {getSortIcon('name')}
                </div>

              </TableHead>
              <TableHead>
                <div className='flex justify-between'>
                  Contact
                </div>
              </TableHead>
              <TableHead onClick={() => requestSort('tripCount')}>
                <div className='flex justify-between'>
                  Active Trips {getSortIcon('tripCount')}
                </div>
              </TableHead>
              <TableHead onClick={() => requestSort('balance')}>
                <div className='flex justify-between'>
                  Supplier Balance {getSortIcon('balance')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedSuppliers?.map((supplier: any, index) => (
              <TableRow
                index = {index + 1}
                key={supplier.supplier_id as string}
                onClick={() => router.push(`suppliers/${supplier.supplier_id}/trips`)}
              >
                <TableCell >
                  <div className="flex items-center space-x-2">
                    <FaUserTie className="text-bottomNavBarColor" />
                    <span>{supplier.name}</span>
                  </div>
                </TableCell>
                <TableCell >
                  <div className="flex items-center space-x-2">
                    <FaPhone className="text-green-500" />
                    <span>{supplier.contactNumber}</span>
                  </div>
                </TableCell>
                <TableCell >
                  <div className="flex items-center space-x-2">
                    <FaTruck className="text-bottomNavBarColor" />
                    <span>{supplier.tripCount}</span>
                  </div>
                </TableCell>
                <TableCell >
                  <div className="flex items-center space-x-2">
                    <FaWallet className="text-bottomNavBarColor" />
                    <span className={`${supplier.balance > 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>₹{formatNumber(supplier.balance)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SuppliersPage;
