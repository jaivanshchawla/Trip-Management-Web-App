import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  visibleColumns: ['Start Date', 'LR Number', 'Truck Number', 'Party Name', 'Route', 'Status', 'Invoice Amt', 'Truck Hire Cost'],
  sortConfig: { key: null, direction: 'asc' },
  searchQuery: '',
  selectedStatus: undefined,
}

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setVisibleColumns: (state, action) => {
      state.visibleColumns = action.payload
    },
    setSortConfig: (state, action) => {
      state.sortConfig = action.payload
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload
    },
  },
})

export const { setVisibleColumns, setSortConfig, setSearchQuery, setSelectedStatus } = tripsSlice.actions
export default tripsSlice.reducer
