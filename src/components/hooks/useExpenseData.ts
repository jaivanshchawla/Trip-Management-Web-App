import {
    useGetTripsQuery,
    useGetDriversQuery,
    useGetTrucksQuery,
    useGetShopsQuery,
    useGetPartiesQuery,
    useGetSuppliersQuery,
    useGetDashboardQuery,
    useGetRecentDocumentsQuery,
    useGetInvoiceQuery
  } from '@/store/api'
  
  export const useExpenseData = () => {
    const { data: tripsData, error: tripsError, isLoading: tripsLoading, refetch: refetchTrips } = useGetTripsQuery(undefined)
    const { data: driversData, error: driversError, isLoading: driversLoading, refetch: refetchDrivers } = useGetDriversQuery()
    const { data: trucksData, error: trucksError, isLoading: trucksLoading, refetch: refetchTrucks } = useGetTrucksQuery()
    const { data: shopsData, error: shopsError, isLoading: shopsLoading, refetch: refetchShops } = useGetShopsQuery()
    const { data: partiesData, error: partiesError, isLoading: partiesLoading, refetch: refetchParties } = useGetPartiesQuery()
    const { data: suppliersData, error: suppliersError, isLoading: suppliersLoading, refetch: refetchSuppliers } = useGetSuppliersQuery()
    const { data: dashboardData, error: dashError, isLoading: dashLoading, refetch: refetchDashboard } = useGetDashboardQuery()
    const { data: recentDocumentsData, error: docError, isLoading: docLoading, refetch: refetchRecentDocuments } = useGetRecentDocumentsQuery()
    const { data: invoiceData, error: invoiceError, isLoading: invoiceLoading, refetch: refetchInvoice } = useGetInvoiceQuery()
  
    const isLoading = tripsLoading || driversLoading || trucksLoading || shopsLoading || partiesLoading || suppliersLoading || dashLoading || docLoading || invoiceLoading
    const error = tripsError || driversError || trucksError || shopsError || partiesError || suppliersError || dashError
  
    const refetchAll = () => {
      refetchTrips()
      refetchDrivers()
      refetchTrucks()
      refetchShops()
      refetchParties()
      refetchSuppliers()
      refetchDashboard()
      refetchRecentDocuments()
    }
  
    return {
      trips: tripsData?.trips || [],
      drivers: driversData?.drivers || [],
      trucks: trucksData?.trucks || [],
      shops: shopsData?.shops || [],
      parties: partiesData?.parties || [],
      suppliers: suppliersData?.suppliers || [],
      dashboardData: dashboardData || { expenses: [], trips: [], recentActivities: {}, profit: 0 },
      invoices : invoiceData?.invoices,
      isLoading,
      error,
      refetchAll,
      refetchTrips,
      refetchDrivers,
      refetchTrucks,
      refetchShops,
      refetchParties,
      refetchSuppliers,
      refetchDashboard,
      refetchRecentDocuments,
      refetchInvoice
    }
  }
  
  