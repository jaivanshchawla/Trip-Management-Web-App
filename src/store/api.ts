import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ITrip, IDriver, TruckModel, IParty, ISupplier, IExpense, invData } from "@/utils/interface"

export interface DashboardData {
    expenses: ExpenseData[]
    trips: TripData[]
    recentActivities: ITrip | IExpense | TruckModel | IDriver | ISupplier | any
    profit: number
}

export interface ExpenseData {
    _id: string
    totalExpenses: number
    totalAmount: number
}

export interface TripData {
    _id: number
    count: number
    month: string
}

export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Trips'],
    endpoints: (builder) => ({
        getTrips: builder.query<{ trips: ITrip[] }, number | undefined>({
            query: (status) => status !== undefined ? `trips?status=${status}` : 'trips',
            providesTags: ['Trips'],
        }),
        getDrivers: builder.query<{ drivers: IDriver[] | any[] }, void>({
            query: () => 'drivers',
        }),
        getInvoice: builder.query<{ invoices: invData[] | any[] }, void>({
            query: () => 'invoices',
        }),
        getTrucks: builder.query<{ trucks: TruckModel[] | any[] }, void>({
            query: () => 'trucks',
        }),
        getShops: builder.query<{ shops: any[] | any[] }, void>({
            query: () => 'shopkhata',
        }),
        getParties: builder.query<{ parties: IParty[] | any[] }, void>({
            query: () => 'parties',
        }),
        getSuppliers: builder.query<{ suppliers: ISupplier[] | any[] }, void>({
            query: () => 'suppliers',
        }),
        getDashboard: builder.query<DashboardData, void>({
            query: () => 'dashboard',
        }),
        getRecentDocuments: builder.query<DashboardData, void>({
            query: () => 'documents/recent',
        }),
        // New trip methods
        updateTripStatus: builder.mutation<ITrip, {
            tripId: string;
            podImage?: string;
            status: number;
            dates: (string | null)[];
            notes?: string
        }>({
            query: ({ tripId, ...data }) => ({
                url: `trips/${tripId}`,
                method: 'PATCH',
                body: {data},
            }),
            invalidatesTags: ['Trips'],
        }),
        updateTrip: builder.mutation<ITrip, { tripId: string; tripData: Partial<ITrip> }>({
            query: ({ tripId, tripData }) => ({
                url: `trips/${tripId}`,
                method: 'PUT',
                body: tripData,
            }),
            invalidatesTags: ['Trips'],
        }),
        deleteTrip: builder.mutation<void, string>({
            query: (tripId) => ({
                url: `trips/${tripId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Trips'],
        }),
        editTrip: builder.mutation<ITrip, { tripId: string; tripData: Partial<ITrip> }>({
            query: ({ tripId, tripData }) => ({
                url: `trips/${tripId}`,
                method: 'PUT',
                body: {data : tripData},
            }),
            invalidatesTags: ['Trips'],
        }),
    }),
})

export const {
    useGetTripsQuery,
    useGetDriversQuery,
    useGetTrucksQuery,
    useGetShopsQuery,
    useGetPartiesQuery,
    useGetSuppliersQuery,
    useGetDashboardQuery,
    useUpdateTripStatusMutation,
    useUpdateTripMutation,
    useDeleteTripMutation,
    useEditTripMutation,
    useGetRecentDocumentsQuery,
    useGetInvoiceQuery
} = api

