'use client';

import Loading from '../loading';

import { IExpense } from '@/utils/interface';
import React, { useEffect, useState, Suspense, useCallback, useMemo } from 'react';

import {  FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import {generateMonthYearOptions } from '@/utils/utilArray';


import debounce from 'lodash.debounce';
import dynamic from 'next/dynamic';
import { handleAddExpense, handleEditExpense } from '@/helpers/ExpenseOperation';
import { ExpenseHeader } from '@/components/ExpenseHeader';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import ExpenseTable from '@/components/ExpenseTable';
import { useToast } from '@/components/hooks/use-toast';

const AddExpenseModal = dynamic(() => import('@/components/AddExpenseModal'), { ssr: false, loading: () => <div>{loadingIndicator}</div> })
const ExpenseFilterModal = dynamic(() => import('@/components/ExpenseFilterModal'), { ssr: false, loading: () => <div>{loadingIndicator}</div> })
const OfficeExpense: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [maintainenceBook, setMaintainenceBook] = useState<IExpense[] | any[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<IExpense | null>(null);
    const [visibleColumns, setVisibleColumns] = useState({
        date: true,
        amount: true,
        expenseType: true,
        notes: true,
        paymentMode: true,
        action: true,
    });
    const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'asc' })
    const [searchQuery, setSearchQuery] = useState('')
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const {toast} = useToast()



    const handleSelectAll = (selectAll: boolean) => {
        setVisibleColumns({
            date: selectAll,
            amount: selectAll,
            expenseType: selectAll,
            notes: selectAll,
            action: selectAll,
            paymentMode: selectAll,
        });
    };

    const handleToggleColumn = (column: keyof typeof visibleColumns) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    const [month, year] = [null, null];

    const getBook = async () => {
        try {
            setLoading(true);
            let res;
            if (month === null || year === null) {
                res = await fetch(`/api/expenses/officeExpense`)
            } else {
                res = await fetch(`/api/expenses/officeExpense?month=${month}&year=${year}`);
            }
            if (!res.ok) throw new Error('Error fetching expenses');
            const data = await res.json();
            setMaintainenceBook(data.expenses || []);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleExpense = async (expense: IExpense | any, id?: string, file?: File | null) => {
        try {
            const data = selected ? await handleEditExpense(expense, selected._id as string, file) : await handleAddExpense(expense, file)
            selected ?
                setMaintainenceBook((prev) => (
                    prev.map((exp) => exp._id === data._id ? ({ ...exp, ...data }) : exp)
                )) : setMaintainenceBook((prev) => [
                    { ...data },
                    ...prev
                ])
            toast({
                description : `Expense ${selected ? 'edited' : 'added'} successfully`
            })

        } catch (error) {
            toast({
                description : 'Please try again',
                variant : 'destructive'
            })
        } finally {
            setSelected(null)
            setModalOpen(false);
        }
    };

    const handleDelete = async (expenseId: string) => {
        try {
            const res = await fetch(`/api/expenses/${expenseId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) {
                toast({
                    description : 'Failed to delete expense',
                    variant : 'destructive'
                })
                return;
            }
            setMaintainenceBook((prev) => prev.filter((item) => item._id !== expenseId));
            toast({
                description : 'Expense deleted successfully'
            })
        } catch (error: any) {
            toast({
                description : 'Failed to delete expense',
                variant : 'destructive'
            })
        }
    };

    const handleFilter = async (filter: { paymentModes: string[], monYear: string[], shops: string[], expenseType: string[] }) => {
        try {
            const res = await fetch(`/api/expenses/officeExpense?filter=${encodeURIComponent(JSON.stringify(filter))}`)
            const data = await res.json()
            setMaintainenceBook(data.expenses)
        } catch (error) {
            console.log(error)
        } finally {
            setFilterModalOpen(false)
        }
    }

    const sortedExpense = useMemo(() => {
        if (!maintainenceBook || maintainenceBook.length === 0) return [];  // This line ensures that truckExpenseBook is not null or empty
        let filteredexpenses = [...maintainenceBook]

        if (searchQuery) {
            const lowercaseQuery = searchQuery.toLowerCase()
            filteredexpenses = maintainenceBook.filter((expense: any) =>
                expense.expenseType.toLowerCase().includes(lowercaseQuery) ||
                expense.paymentMode.toLowerCase().includes(lowercaseQuery) ||
                new Date(expense.date).toLocaleDateString().includes(lowercaseQuery) ||
                expense.amount.toString().includes(lowercaseQuery) ||
                expense.notes.toString().includes(lowercaseQuery) ||
                expense.shopName.toString().includes(lowercaseQuery)
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
    }, [maintainenceBook, sortConfig, searchQuery]);

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


    useEffect(() => {
        getBook();
    }, [month, year]);

    


    if (loading) return <Loading />;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="w-full h-full">
            <ExpenseHeader visibleColumns={visibleColumns} handleSearch={handleSearch} handleSelectAll={handleSelectAll} handleToggleColumn={handleToggleColumn} sortedExpense={sortedExpense} setSelected={setSelected} setModalOpen={setModalOpen} setFilterModalOpen={setFilterModalOpen} />

            <div className="">
                <ExpenseTable
                    sortedExpense={sortedExpense}
                    handleDelete={handleDelete}
                    visibleColumns={visibleColumns}
                    requestSort={requestSort}
                    getSortIcon={getSortIcon}
                    setSelected={setSelected}
                    setTruckExpenseBook={setMaintainenceBook}
                    setModalOpen={setModalOpen}
                />
            </div>
            <AddExpenseModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelected(null);
                }}
                onSave={handleExpense}
                selected={selected} driverId={''} categories={['Truck Expense', 'Trip Expense', 'Office Expense']} 
                />
            <ExpenseFilterModal
                isOpen={filterModalOpen}
                paymentModes={['Online', 'Cash', 'Credit']}
                handleFilter={handleFilter}
                monthYearOptions={generateMonthYearOptions()}
                onClose={() => setFilterModalOpen(false)}
            />
        </div>
    );
};

const OfficeExpenseWrapper: React.FC = () => (
    <Suspense fallback={<Loading />}>
        <OfficeExpense />
    </Suspense>
);

export default OfficeExpenseWrapper;
