import { createContext, useContext, useState } from "react";
import useSWR from "swr";

const ExpenseCtx = createContext({
    trips: [],
    drivers: [],
    shops: [],
    trucks: [],
    suppliers: [],
    parties: [],
    dashboardData: {
        expenses: [],
        trips: [],
        recentActivities: {},
        profit: 0,
    },
    isLoading: false,
    error: null,
});

export const useExpenseCtx = () => useContext(ExpenseCtx);

const fetcher = (url) => fetch(url).then((res) => res.json());

const config = {
    revalidateOnFocus: false,
    refreshInterval: 0, 
}

export const ExpenseProvider = ({ children }) => {

    const { data: tripsData, error: tripsError, isLoading: tripsLoading } = useSWR("/api/trips", fetcher, config);
    const { data: driversData, error: driversError, isLoading: driversLoading } = useSWR("/api/drivers", fetcher, config);
    const { data: trucksData, error: trucksError, isLoading: trucksLoading } = useSWR("/api/trucks", fetcher, config);
    const { data: shopsData, error: shopsError, isLoading: shopsLoading } = useSWR("/api/shopkhata", fetcher, config);
    const { data: partiesData, error: partiesError, isLoading: partiesLoading } = useSWR("/api/parties", fetcher, config);
    const { data: suppliersData, error: suppliersError, isLoading: suppliersLoading } = useSWR("/api/suppliers", fetcher, config);
    const { data: dashData, error: dashError, isLoading: dashLoading } = useSWR('/api/dashboard', fetcher, config);
    

    const isLoading = tripsLoading || driversLoading || trucksLoading || shopsLoading || partiesLoading || suppliersLoading || dashLoading;
    const error = tripsError || driversError || trucksError || shopsError || partiesError || suppliersError || dashError;

    const trips = tripsData?.trips || [];
    const drivers = driversData?.drivers || [];
    const trucks = trucksData?.trucks || [];
    const shops = shopsData?.shops || [];
    const parties = partiesData?.parties || [];
    const suppliers = suppliersData?.suppliers || [];
    const dashboardData = dashData || {};

    return (
        <ExpenseCtx.Provider
            value={{
                trips,
                drivers,
                shops,
                trucks,
                parties,
                suppliers,
                dashboardData,
                isLoading,
                error,
            }}
        >
            {children}
        </ExpenseCtx.Provider>
    );
};
