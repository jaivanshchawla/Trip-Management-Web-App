import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ITrip } from '@/utils/interface'

interface TripsState {
  visibleColumns: string[]
  sortConfig: {
    key: keyof ITrip | null
    direction: 'asc' | 'desc'
  }
  searchQuery: string
  selectedStatus: number | undefined
}

const initialState: TripsState = {
  visibleColumns: ['Start Date', 'LR Number', 'Truck Number', 'Party Name', 'Route', 'Status', 'Invoice Amt', 'Truck Hire Cost'],
  sortConfig: { key: null, direction: 'asc' },
  searchQuery: '',
  selectedStatus: undefined,
}

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setVisibleColumns: (state, action: PayloadAction<string[]>) => {
      state.visibleColumns = action.payload
    },
    setSortConfig: (state, action: PayloadAction<{ key: keyof ITrip | null; direction: 'asc' | 'desc' }>) => {
      state.sortConfig = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSelectedStatus: (state, action: PayloadAction<number | undefined>) => {
      state.selectedStatus = action.payload
    },
  },
})

export const { setVisibleColumns, setSortConfig, setSearchQuery, setSelectedStatus } = tripsSlice.actions
export default tripsSlice.reducer

