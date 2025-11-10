'use client'

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useExpenseCtx } from '@/context/context'
import { fuelAndDriverChargeTypes, maintenanceChargeTypes, officeExpenseTypes } from '@/utils/utilArray'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useToast } from './hooks/use-toast'

type Props = {
    monthYearOptions: string[]
    paymentModes: string[]
    onClose: () => void
    isOpen: boolean
    handleFilter: (filter: any) => void
}

const ExpenseFilterModal: React.FC<Props> = ({ onClose, isOpen, monthYearOptions, paymentModes, handleFilter }) => {
    const { trips, drivers, shops, trucks } = useExpenseCtx()
    const pathname = usePathname()
    const modalRef = useRef<HTMLDivElement | null>(null)
    const [userExpenseTypes, setUserExpenseTypes] = useState<string[]>([])
    const {toast} = useToast()

        const fetchUserExpenseTypes = async () => {
            try {
                const res = await fetch('/api/expenses/expenseType')
                const data = await res.json()
                setUserExpenseTypes(data.expenseTypes)
    
            } catch (error) {
                toast({
                    description: "Failed to fetch some expense types",
                    variant: "destructive"
                })
            }
        }
    
        useEffect(() => {
            fetchUserExpenseTypes()
        }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose(); // Close modal if clicked outside
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const [selectedFilters, setSelectedFilters] = useState({
        trucks: [] as string[],
        monthYear: [] as string[],
        paymentModes: [] as string[],
        drivers: [] as string[],
        shops: [] as string[],
        trips: [] as string[],
        expenseTypes: [] as string[]
    })

    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('Month and Year')

    const filterCategories = useMemo(() => {
        let categories = ['Month and Year', 'Expense Type', 'Payment Mode', 'Shop']
        if (pathname !== '/user/expenses/officeExpense') {
            categories.unshift('Trucks', 'Driver')
        }
        if (pathname === '/user/expenses/tripExpense' || pathname === '/user/expenses') {
            categories.push('Trips')
        }
        return categories
    }, [pathname])

    const expenseTypes = useMemo(() => {
        if (pathname === '/user/expenses/tripExpense') {
            return Array.from(fuelAndDriverChargeTypes)
        } else if (pathname === '/user/expenses/truckExpense') {
            return Array.from(maintenanceChargeTypes)
        } else if (pathname === '/user/expenses/officeExpense') {
            return Array.from(officeExpenseTypes)
        } else {
            return [...fuelAndDriverChargeTypes, ...maintenanceChargeTypes, ...officeExpenseTypes,]
        }
    }, [pathname])

    const handleCheckboxChange = useCallback((category: string, value: string) => {
        setSelectedFilters(prev => ({
            ...prev,
            [category]: prev[category as keyof typeof selectedFilters].includes(value)
                ? prev[category as keyof typeof selectedFilters].filter(item => item !== value)
                : [...prev[category as keyof typeof selectedFilters], value]
        }))
    }, [])

    const filterItems = useCallback((items: any[], key: string) => {
        return items.filter(item =>
            item[key].toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    const handleSelectAll = useCallback((category: string, items: string[]) => {
        setSelectedFilters(prev => ({
            ...prev,
            [category]: prev[category as keyof typeof selectedFilters].length === items.length ? [] : items
        }))
    }, [])

    const isAllSelected = useCallback((category: string, items: string[]) => {
        return selectedFilters[category as keyof typeof selectedFilters].length === items.length
    }, [selectedFilters])

    if (!isOpen) return null

    return (
        <div className="modal-class">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] flex flex-col"
                ref={modalRef}
            >
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-lg font-semibold">Expense Filter</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>

                <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4"
                />

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/4 space-y-2">
                        {filterCategories.map((category) => (
                            <Button
                                key={category}
                                variant={activeCategory === category ? "newyork" : "outline"}
                                className="w-full justify-start"
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>

                    <div className="w-full md:w-3/4 border rounded-lg p-4 max-h-[300px] overflow-y-auto thin-scrollbar">
                        {activeCategory === 'Trucks' && trucks && (
                            <>
                                <div className="flex items-center space-x-2 py-2 border-b mb-2">
                                    <Checkbox
                                        id="select-all-trucks"
                                        checked={isAllSelected('trucks', trucks.map(truck => truck.truckNo))}
                                        onCheckedChange={() => handleSelectAll('trucks', trucks.map(truck => truck.truckNo))}
                                    />
                                    <label htmlFor="select-all-trucks">Select All</label>
                                </div>
                                {filterItems(trucks, 'truckNo').map(truck => (
                                    <div key={truck.truckNo} className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            id={`truck-${truck.truckNo}`}
                                            checked={selectedFilters.trucks.includes(truck.truckNo)}
                                            onCheckedChange={() => handleCheckboxChange('trucks', truck.truckNo)}
                                        />
                                        <label htmlFor={`truck-${truck.truckNo}`}>{truck.truckNo}</label>
                                    </div>
                                ))}
                            </>
                        )}
                        {activeCategory === 'Month and Year' && (
                            <>
                                <div className="flex items-center space-x-2 py-2 border-b mb-2">
                                    <Checkbox
                                        id="select-all-month-year"
                                        checked={isAllSelected('monthYear', monthYearOptions)}
                                        onCheckedChange={() => handleSelectAll('monthYear', monthYearOptions)}
                                    />
                                    <label htmlFor="select-all-month-year">Select All</label>
                                </div>
                                {monthYearOptions.filter(monYear => monYear.toLowerCase().includes(searchQuery.toLowerCase())).map((monYear, index) => (
                                    <div key={index} className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            id={`month-year-${index}`}
                                            checked={selectedFilters.monthYear.includes(monYear)}
                                            onCheckedChange={() => handleCheckboxChange('monthYear', monYear)}
                                        />
                                        <label htmlFor={`month-year-${index}`}>{monYear}</label>
                                    </div>
                                ))}
                            </>
                        )}
                        {activeCategory === 'Payment Mode' && (
                            <>
                                <div className="flex items-center space-x-2 py-2 border-b mb-2">
                                    <Checkbox
                                        id="select-all-payment-modes"
                                        checked={isAllSelected('paymentModes', paymentModes)}
                                        onCheckedChange={() => handleSelectAll('paymentModes', paymentModes)}
                                    />
                                    <label htmlFor="select-all-payment-modes">Select All</label>
                                </div>
                                {paymentModes.filter(mode => mode.toLowerCase().includes(searchQuery.toLowerCase())).map((mode, index) => (
                                    <div key={index} className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            id={`payment-mode-${index}`}
                                            checked={selectedFilters.paymentModes.includes(mode)}
                                            onCheckedChange={() => handleCheckboxChange('paymentModes', mode)}
                                        />
                                        <label htmlFor={`payment-mode-${index}`}>{mode}</label>
                                    </div>
                                ))}
                            </>
                        )}
                        {activeCategory === 'Driver' && drivers && (
                            <>
                                <div className="flex items-center space-x-2 py-2 border-b mb-2">
                                    <Checkbox
                                        id="select-all-drivers"
                                        checked={isAllSelected('drivers', drivers.map(driver => driver.driver_id))}
                                        onCheckedChange={() => handleSelectAll('drivers', drivers.map(driver => driver.driver_id))}
                                    />
                                    <label htmlFor="select-all-drivers">Select All</label>
                                </div>
                                {filterItems(drivers, 'name').map(driver => (
                                    <div key={driver.driver_id} className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            id={`driver-${driver.driver_id}`}
                                            checked={selectedFilters.drivers.includes(driver.driver_id)}
                                            onCheckedChange={() => handleCheckboxChange('drivers', driver.driver_id)}
                                        />
                                        <label htmlFor={`driver-${driver.driver_id}`}>{driver.name} • {driver.contactNumber}</label>
                                    </div>
                                ))}
                            </>
                        )}
                        {activeCategory === 'Shop' && shops && (
                            <>
                                <div className="flex items-center space-x-2 py-2 border-b mb-2">
                                    <Checkbox
                                        id="select-all-shops"
                                        checked={isAllSelected('shops', shops.map(shop => shop.shop_id))}
                                        onCheckedChange={() => handleSelectAll('shops', shops.map(shop => shop.shop_id))}
                                    />
                                    <label htmlFor="select-all-shops">Select All</label>
                                </div>
                                {filterItems(shops, 'name').map(shop => (
                                    <div key={shop.shop_id} className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            id={`shop-${shop.shop_id}`}
                                            checked={selectedFilters.shops.includes(shop.shop_id)}
                                            onCheckedChange={() => handleCheckboxChange('shops', shop.shop_id)}
                                        />
                                        <label htmlFor={`shop-${shop.shop_id}`}>{shop.name}</label>
                                    </div>
                                ))}
                            </>
                        )}
                        {activeCategory === 'Trips' && trips && (
                            <>
                                <div className="flex items-center space-x-2 py-2 border-b mb-2">
                                    <Checkbox
                                        id="select-all-trips"
                                        checked={isAllSelected('trips', trips.map(trip => trip.trip_id))}
                                        onCheckedChange={() => handleSelectAll('trips', trips.map(trip => trip.trip_id))}
                                    />
                                    <label htmlFor="select-all-trips">Select All</label>
                                </div>
                                {filterItems(trips, 'LR').map(trip => (
                                    <div key={trip.trip_id} className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            id={`trip-${trip.trip_id}`}
                                            checked={selectedFilters.trips.includes(trip.trip_id)}
                                            onCheckedChange={() => handleCheckboxChange('trips', trip.trip_id)}
                                        />
                                        <label htmlFor={`trip-${trip.trip_id}`} className="flex-1 grid grid-cols-4 gap-2 items-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <p className="text-left truncate">{trip.LR}</p>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{trip.LR}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <p className="text-left truncate">{trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]}</p>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{trip.route.origin} &rarr; {trip.route.destination}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <p className="text-left truncate">{trip.truck}</p>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{trip.truck}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <p className="text-left truncate">{new Date(trip.startDate).toLocaleDateString('en-IN')}</p>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{new Date(trip.startDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </label>
                                    </div>
                                ))}
                            </>
                        )}

                        {activeCategory === 'Expense Type' && (
                            <>
                                <div className="flex items-center space-x-2 py-2 border-b mb-2">
                                    <Checkbox
                                        id="select-all-expense-types"
                                        checked={isAllSelected('expenseTypes', expenseTypes)}
                                        onCheckedChange={() => handleSelectAll('expenseTypes', expenseTypes)}
                                    />
                                    <label htmlFor="select-all-expense-types">Select All</label>
                                </div>
                                {userExpenseTypes.filter(type => type.toLowerCase().includes(searchQuery.toLowerCase())).map((expense, index) => (
                                    <div key={index} className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            id={`expense-type-${index}`}
                                            checked={selectedFilters.expenseTypes.includes(expense)}
                                            onCheckedChange={() => handleCheckboxChange('expenseTypes', expense)}
                                        />
                                        <label htmlFor={`expense-type-${index}`} className="whitespace-nowrap">{expense}</label>
                                    </div>
                                ))}
                                {expenseTypes.filter(type => type.toLowerCase().includes(searchQuery.toLowerCase())).map((expense, index) => (
                                    <div key={index} className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            id={`expense-type-${index}`}
                                            checked={selectedFilters.expenseTypes.includes(expense)}
                                            onCheckedChange={() => handleCheckboxChange('expenseTypes', expense)}
                                        />
                                        <label htmlFor={`expense-type-${index}`} className="whitespace-nowrap">{expense}</label>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            handleFilter(selectedFilters)
                            onClose()
                        }}
                    >
                        Apply Filters
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}

export default React.memo(ExpenseFilterModal)

