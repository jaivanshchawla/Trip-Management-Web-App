'use client';
import DriverName from '@/components/driver/DriverName';
import PartyName from '@/components/party/PartyName';
import Driver from '@/components/search/Driver';
import Expense from '@/components/search/Expense';
import OfficeExpense from '@/components/search/OfficeExpense';
import Party from '@/components/search/Party';
import Supplier from '@/components/search/Supplier';
import SupplierAccount from '@/components/search/SupplierAccount';
import Trip from '@/components/search/Trip';
import TripCharges from '@/components/search/TripCharges';
import Truck from '@/components/search/Truck';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';


const SearchPage = () => {
    const [query, setQuery] = useState(''); // State to manage the search query
    const [results, setResults] = useState<any>({}); // State to store the search results
    const [error, setError] = useState<string | null>(null); // State to handle errors
    const [loading, setLoading] = useState(false); // State to manage loading state
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    // Debounce the search input to minimize API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500); // Adjust the debounce delay as needed

        return () => {
            clearTimeout(timer);
        };
    }, [query]);

    // Function to handle the search request
    useEffect(() => {
        const handleSearch = async () => {
            if (!debouncedQuery) return;

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedQuery)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }
                const data = await response.json();
                setResults(data); // Update the results state with the data received from the server
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        handleSearch();
    }, [debouncedQuery]);

    // Function to handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDebouncedQuery(query);
    };

    return (
        <div className='container flex flex-col space-y-4 bg-gray-100 rounded-md min-h-screen p-4'>
            <h1 className='text-bottomNavBarColor text-3xl font-bold'>Search anything...</h1>
            <form onSubmit={handleSubmit} className='flex items-center space-x-2'>
                <input
                    type='text'
                    placeholder='Search...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button type='submit'>Search</Button>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p className='text-red-500'>{error}</p>}

            <motion.div
                className='results flex flex-col space-y-4 mt-4 table-container overflow-auto bg-white shadow rounded-lg p-4 min-w-full'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {Object.keys(results).length > 0 ? (
                    <div>
                        {/* Parties */}
                        {results.parties?.length > 0 && (
                            <Party parties={results.parties} />
                        )}
                        
                        {/* Trips */}
                        {results.trips?.length > 0 && (
                            <Trip trips={results.trips} />
                        )}

                        {/* Drivers */}
                        {results.drivers?.length > 0 && (
                            <Driver drivers={results.drivers} />
                        )}

                        {/* Trucks */}
                        {results.trucks?.length > 0 && (
                            <Truck trucks={results.trucks} />
                        )}

                        {/* Suppliers */}
                        {results.suppliers?.length > 0 && (
                           <Supplier suppliers={results.suppliers}/>
                        )}

                        {/* Expenses */}
                        {results.expenses?.length > 0 && (
                            <Expense expenses={results.expenses} />
                        )}

                        {/* Supplier Accounts */}
                        {results.supplierAccounts?.length > 0 && (
                            <SupplierAccount accounts={results.supplierAccounts} />
                        )}

                        {/* Office Expenses */}
                        {results.officeExpenses?.length > 0 && (
                            <OfficeExpense expenses={results.officeExpenses} />
                        )}

                        {/* Trip Charges */}
                        {results.tripCharges?.length > 0 && (
                            <TripCharges charges={results.tripCharges} />
                        )}
                    </div>
                ) : (
                    <p>No results found.</p>
                )}
            </motion.div>
        </div>
    );
};

export default SearchPage;
