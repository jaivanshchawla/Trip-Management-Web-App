'use client';
import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { IExpense, } from '@/utils/interface';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import {  handleAddExpense, } from '@/helpers/ExpenseOperation';
;
import { FaSort, FaSortDown, FaSortUp,  } from 'react-icons/fa';

import debounce from 'lodash.debounce';
import dynamic from 'next/dynamic';

import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import { TbPlus } from 'react-icons/tb';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ExpenseTable from '@/components/ExpenseTable';
import { useToast } from '@/components/hooks/use-toast';

const AddExpenseModal = dynamic(() => import('@/components/AddExpenseModal'), { ssr: false, loading: () => <div>{loadingIndicator}</div> })
const ExpenseFilterModal = dynamic(() => import('@/components/ExpenseFilterModal'), { ssr: false, loading: () => <div>{loadingIndicator}</div> })
const DraftExpense: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [truckExpenseBook, setTruckExpenseBook] = useState<IExpense[] | any[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<IExpense | null>(null);
    const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })
    const [searchQuery, setSearchQuery] = useState('')
    const { toast } = useToast()


    const [visibleColumns, setVisibleColumns] = useState({
        date: true,
        amount: true,
        expenseType: true,
        notes: true,
        truck: true,
        action: true,
        ledger: true
    });


    const sortedExpense = useMemo(() => {
        if (!truckExpenseBook || truckExpenseBook.length === 0) return [];  // This line ensures that truckExpenseBook is not null or empty
        let filteredexpenses = [...truckExpenseBook]

        if (searchQuery) {
            const lowercaseQuery = searchQuery.toLowerCase()
            filteredexpenses = truckExpenseBook.filter((expense: any) =>
                expense?.expenseType.toLowerCase().includes(lowercaseQuery) ||
                expense?.paymentMode.toLowerCase().includes(lowercaseQuery) ||
                new Date(expense?.date).toLocaleDateString().includes(lowercaseQuery) ||
                expense?.amount.toString().includes(lowercaseQuery) ||
                expense?.notes.toString().includes(lowercaseQuery) ||
                expense?.driverName.toString().includes(lowercaseQuery) ||
                expense?.truck.toLowerCase().includes(lowercaseQuery)
            )
        }
        if (sortConfig.key !== null) {
            filteredexpenses.sort((a: any, b: any) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredexpenses;
    }, [truckExpenseBook, sortConfig, searchQuery]);


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

    // Debounce the search input to reduce re-renders on each keystroke
    const debouncedSearch = useCallback(
        debounce((query) => setSearchQuery(query), 300),
        []
    );

    // Handle search input
    const handleSearch: any = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
    };


    const getBook = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/expenses/draft')
            const data = await res.json()
            setTruckExpenseBook(data.expenses);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/expenses/draft/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await res.json()
            setTruckExpenseBook((prev) => {
                return prev.filter((item) => item._id !== id)
            })
        } catch (error) {
            toast({
                description: 'An error occurred. Please try again.',
                variant: 'destructive',
            })
        }
    }

    const handleExpense = async (expense: IExpense, id?: string, file?: File | null) => {
        try {
            // Execute add expense and delete draft in parallel for efficiency
            const missingFields = new Set()
            if (!expense.expenseType) missingFields.add('expenseType');
            if (!expense.date) missingFields.add('date');
            if (!expense.amount) missingFields.add('amount');
            if (!expense.paymentMode) missingFields.add('paymentMode');
            if (missingFields.size > 0) {
                toast({
                    description: `Missing required fields: ${Array.from(missingFields).join(', ')}`,
                    variant: 'warning',
                })
                return
            }
            const [addedExpense, delRes] = await Promise.all([
                handleAddExpense(expense, file),
                fetch(`/api/expenses/draft/${selected?._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            ]);

            const delData = await delRes.json();

            if (!delRes.ok) {
                throw new Error(`Failed to delete draft: ${delData.message || 'Unknown error'}`);
            }

            // Update the truck expense book
            setTruckExpenseBook((prev) =>
                prev.filter((exp) => exp._id !== delData.expense._id)
            );
        } catch (error: unknown) {
            console.error('Error in handleExpense:', error);
            toast({
                description: 'An error occurred. Please try again.',
                variant: 'destructive',
            });
        } finally {
            // Ensure modal state is updated even if an error occurs
            setSelected(null);
            setModalOpen(false);
        }
    };


    useEffect(() => {
        // Call getBook with null for the first render
        getBook();
    }, [])

    if (loading) return <Loading />;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    const handleToggleColumn = (column: keyof typeof visibleColumns) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    const handleSelectAll = (selectAll: boolean) => {
        setVisibleColumns({
            date: selectAll,
            amount: selectAll,
            expenseType: selectAll,
            notes: selectAll,
            truck: selectAll,
            action: selectAll,
            ledger: selectAll
        });
    };

    return (
        <div className="w-full h-full">

            <div className="flex items-center justify-between gap-4 bg-transparent p-4">
                <div className="flex items-center gap-4 flex-grow">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">Columns</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={Object.values(visibleColumns).every(Boolean)}
                                onCheckedChange={handleSelectAll}
                            >
                                Select All
                            </DropdownMenuCheckboxItem>
                            {Object.entries(visibleColumns).map(([column, isVisible]) => (
                                <DropdownMenuCheckboxItem
                                    key={column}
                                    checked={isVisible}
                                    onCheckedChange={() => handleToggleColumn(column as any)}
                                >
                                    {column.charAt(0).toUpperCase() + column.slice(1)}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <input
                        type="text"
                        onChange={handleSearch}
                        placeholder={`Search from ${sortedExpense.length} expenses...`}
                        className="max-w-xs"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => {
                            setSelected(null)
                            setModalOpen(true)
                        }}
                    >
                        <TbPlus className="mr-2 h-4 w-4" /> Add
                    </Button>

                </div>
            </div>

            <div className="">
                <ExpenseTable
                    sortedExpense={sortedExpense}
                    handleDelete={handleDelete}
                    visibleColumns={visibleColumns}
                    requestSort={requestSort}
                    getSortIcon={getSortIcon}
                    setSelected={setSelected}
                    setTruckExpenseBook={setTruckExpenseBook}
                    setModalOpen={setModalOpen}
                />
            </div>


            <AddExpenseModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleExpense}
                driverId={selected?.driver as string}
                selected={selected} categories={['Truck Expense', 'Trip Expense', 'Office Expense']}
                setDrafts={setTruckExpenseBook} />

        </div>
    );
};

const DraftExpenseWrapper: React.FC = () => {
    return (
        <Suspense fallback={<Loading />}>
            <DraftExpense />
        </Suspense>
    )

}

export default DraftExpenseWrapper;
