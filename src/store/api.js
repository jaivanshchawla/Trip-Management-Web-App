import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Trips'],
    endpoints: (builder) => ({
        getTrips: builder.query({
            query: (status) => status !== undefined ? `trips?status=${status}` : 'trips',
            providesTags: ['Trips'],
        }),
        getDrivers: builder.query({
            query: () => 'drivers',
        }),
        getInvoice: builder.query({
            query: () => 'invoices',
        }),
        getTrucks: builder.query({
            query: () => 'trucks',
        }),
        getShops: builder.query({
            query: () => 'shopkhata',
        }),
        getParties: builder.query({
            query: () => 'parties',
        }),
        getSuppliers: builder.query({
            query: () => 'suppliers',
        }),
        getDashboard: builder.query({
            query: () => 'dashboard',
        }),
        getRecentDocuments: builder.query({
            query: () => 'documents/recent',
        }),
        // New trip methods
        updateTripStatus: builder.mutation({
            query: ({ tripId, ...data }) => ({
                url: `trips/${tripId}`,
                method: 'PATCH',
                body: {data},
            }),
            invalidatesTags: ['Trips'],
        }),
        updateTrip: builder.mutation({
            query: ({ tripId, tripData }) => ({
                url: `trips/${tripId}`,
                method: 'PUT',
                body: tripData,
            }),
            invalidatesTags: ['Trips'],
        }),
        deleteTrip: builder.mutation({
            query: (tripId) => ({
                url: `trips/${tripId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Trips'],
        }),
        editTrip: builder.mutation({
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
