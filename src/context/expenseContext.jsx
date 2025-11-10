'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ExpenseContext = createContext(null);

export const useExpense = () => useContext(ExpenseContext);

export const ExpenseProvider = ({ children }) => {
  const [sum, setSum] = useState(null);
  const [allExpense, setAllExpense] = useState([]);
  const [truckExpense, setTruckExpense] = useState([]);
  const [tripExpense, setTripExpense] = useState([]);
  const [officeExpense, setOfficeExpense] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if data already exists in state
    const isDataLoaded =
      allExpense.length > 0 &&
      truckExpense.length > 0 &&
      tripExpense.length > 0 &&
      officeExpense.length > 0 &&
      sum !== null;

    if (isDataLoaded) {
      // If data is already present, don't fetch
      setLoading(false);
      return;
    }

    // Fetch expenses data if not already present
    async function fetchExpense() {
      try {
        const [allRes, truckRes, tripRes, officeRes, summaryRes] = await Promise.all([
          fetch(`/api/expenses`),
          fetch(`/api/expenses/truckExpense`),
          fetch(`/api/expenses/tripExpense`),
          fetch(`/api/expenses/officeExpense`),
          fetch(`/api/expenses/calculate`),
        ]);

        if (!allRes.ok || !truckRes.ok || !tripRes.ok || !officeRes.ok) return;

        const [allData, truckData, tripData, officeData, summaryData] = await Promise.all([
          allRes.json(),
          truckRes.json(),
          tripRes.json(),
          officeRes.json(),
          summaryRes.json(),
        ]);

        // Set data to state
        setAllExpense(allData.expenses);
        setTruckExpense(truckData.truckExpense);
        setTripExpense(tripData.tripExpense);
        setOfficeExpense(officeData.expenses);
        setSum(summaryData.expenses);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExpense();
  }, [allExpense, truckExpense, tripExpense, officeExpense, sum]);

  return (
    <ExpenseContext.Provider
      value={{
        allExpense,
        setAllExpense,
        truckExpense,
        setTruckExpense,
        tripExpense,
        setTripExpense,
        officeExpense,
        setOfficeExpense,
        sum,
        setSum,
        loading,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
