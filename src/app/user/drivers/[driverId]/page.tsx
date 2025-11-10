'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MdDelete, MdEdit } from "react-icons/md";
import { IDriver, IDriverAccount, IExpense, PaymentBook } from '@/utils/interface';
import Loading from '../loading';
import { DeleteExpense, ExpenseforDriver, handleEditExpense } from '@/helpers/ExpenseOperation';
import { handleDelete as DeleteForExpense } from '@/helpers/ExpenseOperation';
import { DeleteAccount } from '@/helpers/TripOperation';
import { deleteDriverAccount, EditDriverAccount } from '@/helpers/driverOperations';
import { Button } from '@/components/ui/button';
import DriverModal from '@/components/driver/driverModal';
import { handleEditAccount } from '@/helpers/TripOperation';
import { handleAddCharge as EditExpense } from '@/helpers/ExpenseOperation';
import { FaCalendarAlt, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import Link from 'next/link';
import { formatNumber } from '@/utils/utilArray';
import dynamic from 'next/dynamic';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDriver } from '@/context/driverContext';

const Driver: React.FC = () => {
  const { driverId } = useParams();

  const { driver, loading, setDriver } = useDriver()
  const [error, setError] = useState<string | null>(null);
  const [expenseEdit, setExpenseEdit] = useState(false);
  const [paymentEdit, setPaymentEdit] = useState(false);
  const [accountEdit, setAccountEdit] = useState(false);
  const [selected, setSelected] = useState<any>([]);
  const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })


  const AddExpenseModal = dynamic(() => import('@/components/AddExpenseModal'), { ssr: false })


  const sortedAccounts = useMemo(() => {
    if (!driver?.driverExpAccounts || driver?.driverExpAccounts.length === 0) return []; // Ensure accounts is not null or empty

    // Utility functions to get sortable values for specific fields
    const getSortableDate = (account: any) => {
      return new Date(account.date || account.paymentDate).getTime(); // Use date if available, otherwise fallback to paymentDate
    };

    const getSortableGave = (account: any) => {
      return account.gave || (account.type === 'truck' ? account.amount : 0); // Use 'gave' or fallback to 'amount' if it's a truck expense
    };

    const getSortableGot = (account: any) => {
      return account.got || (account.type !== 'truck' ? account.amount : 0); // Use 'got' or fallback to 'amount' for non-truck types
    };

    let sortableAccounts = [...driver?.driverExpAccounts as any];

    if (sortConfig.key !== null) {
      sortableAccounts.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'date') {
          // Special case for date column
          aValue = getSortableDate(a);
          bValue = getSortableDate(b);
        } else if (sortConfig.key === 'gave') {
          // Special case for 'gave'
          aValue = getSortableGave(a);
          bValue = getSortableGave(b);
        } else if (sortConfig.key === 'got') {
          // Special case for 'got'
          aValue = getSortableGot(a);
          bValue = getSortableGot(b);
        } else {
          // Generic case for other fields
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableAccounts;
  }, [driver, sortConfig]);


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

  // const Modal = dynamic(() => import('@/components/trip/tripDetail/Modal'), { ssr: false })

  const handleDelete = async (account: any) => {
    let balance = driver.balance
    try {
      let deletedAccount: any;

      if (account.expenseType) {
        deletedAccount = await DeleteExpense(account._id);
        setDriver((prev : IDriver | any)=>({
          ...prev,
          driverExpAccounts : prev.driverExpAccounts.filter((acc : any) => acc._id !== deletedAccount._id),
          balance : prev.balance + deletedAccount.amount
        }))
      } else if (account.accountType) {
        deletedAccount = await DeleteAccount(account._id, account.trip_id, account.party_id);
        setDriver((prev : IDriver | any)=>({
          ...prev,
          driverExpAccounts : prev.driverExpAccounts.filter((acc : any) => acc.paymentBook_id !== deletedAccount.paymentBook_id),
          balance : prev.balance + deletedAccount.amount
        }))
      } else {
        const data = await deleteDriverAccount(driverId as string, account.account_id);
        deletedAccount = data.driver;
        setDriver((prev : IDriver | any)=>({
          ...prev,
          driverExpAccounts : prev.driverExpAccounts.filter((acc : any) => acc.account_id !== account.account_id),
          balance : prev.balance - account.got + account.gave
        }))
      }

      // Update driverExpAccounts in driver state with the updated accounts
      // setDriver((prev: any) => ({
      //   ...prev,
      //   driverExpAccounts: accounts.filter(acc => acc.account_id !== account.account_id),
      //   balance : balance
      // }));
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };


  // const fetchDriverDetails = async () => {
  //   try {
  //     const response = await fetch(`/api/drivers/${driverId}`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch driver');
  //     }

  //     const result = await response.json();
  //     setDriver(result);
  //     setDriverAccounts(result.accounts);
  //   } catch (err: any) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchTrips = async () => {
  //   try {
  //     const res = await fetch(`/api/trips/driver/${driverId}/accounts`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!res.ok) {
  //       throw new Error('Failed to fetch trips');
  //     }

  //     const data = await res.json();
  //     return data.accounts;
  //   } catch (err) {
  //     setError((err as Error).message);
  //     console.log(err)
  //     return [];
  //   }
  // };

  // const fetchTruckExpenses = async () => {
  //   try {
  //     const truckExpense = await ExpenseforDriver(driverId as string);
  //     const formattedTruckExpenses = truckExpense.map((expense: IExpense) => ({
  //       ...expense,
  //       date: expense.date,
  //       type: 'truck',
  //     }));
  //     return formattedTruckExpenses;
  //   } catch (err) {
  //     setError((err as Error).message);
  //     return [];
  //   }
  // };

  // const fetchAllData = async () => {
  //   setLoading(true);
  //   const accountsData = await fetchTrips();
  //   const truckExpensesData = await fetchTruckExpenses();
  //   const allAccounts = [
  //     ...accountsData,
  //     ...truckExpensesData,
  //     ...driverAccounts,
  //   ];

  //   setAccounts(allAccounts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  //   setLoading(false);
  // };

  const handleEditAccounts = async (account: any) => {
    try {
      // Create a variable to store the updated accounts
      let updatedAccounts: any[] = [...driver?.driverExpAccounts];
      let updatedAccount: any;
      let balance : number = driver.balance

      if (account.expenseType) {
        // Handle expense edit logic
        const expense = await handleEditExpense(account, selected._id);
        balance += selected.amount
        updatedAccount = expense;

        updatedAccounts = updatedAccounts.filter(acc => acc._id !== expense._id);
       
        if (expense.driver === selected.driver) {
          updatedAccounts.push({ ...expense });
          balance -= expense.amount
        }

      } else if (account.accountType) {
        // Handle payment edit logic
        const result = await handleEditAccount(account, selected.trip_id, selected.party_id);
        if (result.error) {
          alert(result.error);
          return;
        }
        updatedAccount = result;
        balance = balance - (selected.amount - result.amount)

        updatedAccounts = updatedAccounts.map(acc =>
          acc._id === result._id ? { ...acc, ...updatedAccount } : acc
        );

      } else {
        // Handle driver account edit logic
        const data = await EditDriverAccount(driverId as string, account, selected.account_id);
        updatedAccount = data;
        balance = balance - (selected.got - updatedAccount.got + updatedAccount.gave - selected.gave)
        updatedAccounts = updatedAccounts.map(acc =>
          acc.account_id === updatedAccount.account_id ? { ...acc, ...updatedAccount } : acc
        );
      }

      // Now update the accounts and driverExpAccounts using updatedAccounts
      setDriver((prev: any) => ({
        ...prev,
        balance : balance,
        driverExpAccounts: updatedAccounts.map(acc => ({ ...acc })), // Ensure driverExpAccounts is synced
      }));

    } catch (error) {
      console.error(error);
      alert('Failed to Edit Account');
    }
  };



  // useEffect(() => {
  //   fetchDriverDetails();
  // }, [driverId]);

  // useEffect(() => {
  //   fetchAllData();
  // }, [driverId, driverAccounts]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!driver) {
    return <div>No driver found</div>;
  }

  return (
    <div className="w-full">

      <div className="w-full h-full p-4">
        <div className="table-container">
          <Table className="custom-table">
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('date')}>
                  <div className='flex justify-between'>
                    Date {getSortIcon('date')}
                  </div>

                </TableHead>
                <TableHead>Reason</TableHead>
                <TableHead onClick={() => requestSort('gave')}>
                  <div className='flex justify-between'>
                    Driver Gave {getSortIcon('gave')}
                  </div>
                </TableHead>
                <TableHead onClick={() => requestSort('got')}>
                  <div className='flex justify-between'>
                    Driver Got {getSortIcon('got')}
                  </div>
                </TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAccounts.map((account, index: number) => (
                <TableRow key={account._id}>
                  <TableCell>
                    <div className='flex items-center space-x-2'>
                      <FaCalendarAlt className='text-bottomNavBarColor' />
                      <span>{new Date(account.date || account.paymentDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </TableCell>
                  <TableCell >
                    <div className='flex items-center space-x-2 '>
                      <span>{account.reason || account.expenseType || `Trip ${account.accountType} `}</span>
                      {account.trip_id && <Button variant={"link"} className='text-red-500 pt-1 rounded-lg'><Link href={`/user/trips/${account.trip_id}`}>from a trip</Link></Button>}
                    </div>
                  </TableCell>
                  <TableCell><span className='text-red-600 font-semibold'>₹{formatNumber(account.gave) || (account.expenseType && formatNumber(account.amount)) || 0}</span></TableCell>
                  <TableCell ><span className='text-green-600 font-semibold'>₹{formatNumber(account.got) || (account.paymentType && formatNumber(account.amount)) || 0}</span></TableCell>
                  <TableCell>
                    <div className='flex gap-2 items-center w-full'>
                      {!account.accountType && <Button
                        variant={'outline'}
                        onClick={() => {
                          setSelected(account);
                          if (account.expenseType) {
                            setExpenseEdit(true);
                          } else if (account.accountType) {
                            setPaymentEdit(true);
                          } else {
                            setAccountEdit(true);
                          }
                        }}
                      >
                        <MdEdit />
                      </Button>}
                      <Button
                        variant={'destructive'}
                        onClick={() => {
                          handleDelete(account);
                        }}
                      >
                        <MdDelete />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* <ExpenseModal
        isOpen={expenseEdit}
        onClose={() => setExpenseEdit(false)}
        onSave={handleEditAccounts}
        driverId={selected.driver || ''}
        selected={selected}
      /> */}
      <AddExpenseModal
        isOpen={expenseEdit}
        onClose={() => setExpenseEdit(false)}
        onSave={handleEditAccounts}
        driverId={driverId as string}
        selected={selected} categories={['Truck Expense', 'Trip Expense']} />

      {/* {selected != null && <Modal
        isOpen={paymentEdit}
        onClose={() => setPaymentEdit(false)}
        onSave={handleEditAccounts}
        modalTitle="Edit Item"
        accountType={selected.accountType}
        editData={selected}
      />} */}
      <DriverModal
        open={accountEdit}
        onClose={() => setAccountEdit(false)}
        onConfirm={handleEditAccounts}
        type={selected.gave ? 'gave' : 'got'}
        selected={selected}
      />
    </div>
  );
};

export default Driver;
