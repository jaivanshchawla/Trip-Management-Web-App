import { createContext, useContext, useState } from "react";
import useSWR from "swr";
import { ITrip, IDriver, TruckModel, IParty, ISupplier, IExpense } from "@/utils/interface";

interface DashboardData {
    expenses: ExpenseData[] | [];
    trips: TripData[] | [];
    recentActivities: ITrip | IExpense | TruckModel | IDriver | ISupplier | any | {}
    profit : number
  }


  interface ExpenseData {
    _id: string;
    totalExpenses: number;
    totalAmount: number;
   
  }
  
  interface TripData {
    _id: number;
    count: number;
    month: string;
  }

const ExpenseCtx = createContext<{
    trips: ITrip[];
    drivers: IDriver[] | any[];
    shops: any[];
    trucks: TruckModel[] | any[];
    suppliers: ISupplier[] | any[];
    parties: IParty[] | any[];
    dashboardData: DashboardData;
    isLoading: boolean;
    error: any;
}>({
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
        profit: 0, // Add your dashboard data here
    },  // Add your dashboard data here
    isLoading: false,
    error: null,
});

export const useExpenseCtx = () => useContext(ExpenseCtx);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Props = {
    children: React.ReactNode;
};

const config = {
    revalidateOnFocus: false,
    refreshInterval: 0, 
}

export const ExpenseProvider = ({ children }: Props) => {

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
