"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import debounce from "lodash.debounce"
import { FaTruck, FaCalendarAlt, FaSort, FaSortDown, FaSortUp } from "react-icons/fa"
import { SlOptionsVertical } from "react-icons/sl"
import { MdDelete, MdEdit } from "react-icons/md"
import { IoDuplicateOutline } from "react-icons/io5"
import { IoMdUndo } from "react-icons/io"
import { Loader2 } from "lucide-react"
import type { ITrip } from "@/utils/interface"
import { statuses } from "@/utils/schema"
import { formatNumber } from "@/utils/utilArray"
import Loading from "./loading"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import dynamic from "next/dynamic"
import { useToast } from "@/components/hooks/use-toast"
import { ewbColor } from "@/utils/EwayBillColor"
import { useGetTripsQuery, useDeleteTripMutation, useUpdateTripStatusMutation, useEditTripMutation } from "@/store/api"
import { useExpenseData } from "@/components/hooks/useExpenseData"
import Link from "next/link"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import ExcelJS from "exceljs";

interface TripWithAdvanceTotal extends ITrip {
  advanceTotal: number;
  supplierBalance: number;
  [key: string]: any;
}



function hasKey<O>(obj: O, key: PropertyKey): key is keyof O {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

const EditTripForm = dynamic(() => import("@/components/trip/EditTripForm"), {
  ssr: false,
  loading: () => (
    <div className="modal-class">
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin text-bottomNavBarColor" />
      </div>
    </div>
  ),
})

const InvoiceForm = dynamic(() => import("@/components/trip/tripDetail/TripFunctions/InvoiceForm"), {
  ssr: false,
  loading: () => (
    <div className="modal-class">
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin text-bottomNavBarColor" />
      </div>
    </div>
  ),
})

const columnOptions = [
  { label: "Start Date", value: "startDate" },
  { label: "LR/FM Number", value: "LR" },
  { label: "Truck Number", value: "truck" },
  { label: "Party Name", value: "party" },
  { label: "Route", value: "route" },
  { label: "Status", value: "status" },
  { label: "Invoice Amt", value: "amount" },
  { label: "Advance", value: "advance" },
  { label: "Supplier Balance", value: "supplierBalance" },
  { label: "Truck Hire Cost", value: "truckHireCost" },
]

export default function TripsPage() {
  const router = useRouter()
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columnOptions.map((col) => col.label))
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
  key: null,
  direction: "asc",
});
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>()
  const [startDateFilter, setStartDateFilter] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const [endDateFilter, setEndDateFilter] = useState<Date>(new Date())
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null)
  const [edit, setEdit] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<ITrip | null>(null)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const { toast } = useToast()

  const { data: trips, isLoading, error } = useGetTripsQuery(selectedStatus)
  const [deleteTrip] = useDeleteTripMutation()
  const [updateTripStatus] = useUpdateTripStatusMutation()
  const [editTrip] = useEditTripMutation()
  const { refetchTrips } = useExpenseData()

  useEffect(() => {
    refetchTrips()
  }, [refetchTrips])

  useEffect(() => {
    const storedColumns = localStorage.getItem("visibleColumns")

    if (storedColumns) {
      try {
        const parsedColumns = JSON.parse(storedColumns)
        if (Array.isArray(parsedColumns) && parsedColumns.length > 0) {
          setVisibleColumns(parsedColumns)
          return // Exit early if valid stored columns are found
        }
      } catch (error) {
        console.error("Error parsing visibleColumns from localStorage:", error)
      }
    }

    // If no valid stored columns, set default visible columns
    setVisibleColumns(columnOptions.map((col) => col.label))
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setSelectedStatus(value === "all" ? undefined : Number.parseInt(value))
  }, [])

  const handleDelete = useCallback(
    async (tripId: string) => {
      try {
        await deleteTrip(tripId).unwrap()
        toast({
          description: "Trip deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting trip:", error)
        toast({
          description: "Error deleting trip",
          variant: "destructive",
        })
      }
    },
    [deleteTrip, toast],
  )

  const handleUndoStatus = useCallback(
    async (trip: ITrip) => {
      if (trip.status === 0) {
        toast({
          description: "Cannot undo status change for this trip. It's already in the initial status",
          variant: "warning",
        })
        return
      }
      const newStatus = (trip.status as number) - 1
      const newDates = trip.dates.map((date, index, array) => (index === array.length - 1 ? null : date))
      try {
        await updateTripStatus({
          tripId: trip.trip_id,
          status: newStatus,
          dates: newDates as (string | null)[],
        }).unwrap()
        toast({
          description: "Status updated successfully",
        })
      } catch (error) {
        console.error("Error updating status:", error)
        toast({
          description: "Error updating status",
          variant: "destructive",
        })
      }
    },
    [updateTripStatus, toast],
  )

  const handleDuplicate = useCallback(
    (e: React.MouseEvent, trip: ITrip) => {
      e.stopPropagation()
      router.push(`/user/trips/create?trip=${encodeURIComponent(JSON.stringify(trip))}`)
      setOpenOptionsId(null)
    },
    [router],
  )

  const debouncedSearch = useMemo(() => debounce((query: string) => setSearchQuery(query), 300), [])

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value.toLowerCase())
    },
    [debouncedSearch],
  )

  const toggleColumn = useCallback((column: string) => {
    setVisibleColumns((prev) => {
      const updatedColumns = prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]

      // Save to localStorage
      localStorage.setItem("visibleColumns", JSON.stringify(updatedColumns))
      return updatedColumns
    })
  }, [])

// const sortedTrips = useMemo(() => {
//   if (!trips) return [];
//   let filteredTrips = [...trips.trips].filter((trip) => {
//     const tripDate = new Date(trip.startDate);
//     return tripDate >= startDateFilter && tripDate <= endDateFilter;
//   });

//   if (searchQuery) {
//     const lowercaseQuery = searchQuery.toLowerCase();

//     // Attempt to parse the search query as a number
//     const numericQuery = Number(searchQuery);
//     const isNumericQuery = !isNaN(numericQuery);

//     // Split the query for route matching
//     const routeParts = lowercaseQuery.split(/\s*->\s*|\s+/).filter(Boolean);
//     const queryOrigin = routeParts[0] || "";
//     const queryDestination = routeParts[1] || "";

//     // Route-based matching
//     const routeMatches = filteredTrips.filter((trip) => {
//       const origin = trip.route?.origin?.toLowerCase() || "";
//       const destination = trip.route?.destination?.toLowerCase() || "";

//       if (queryOrigin && queryDestination) {
//         return (
//           (origin.includes(queryOrigin) && destination.includes(queryDestination)) ||
//           (origin.includes(queryDestination) && destination.includes(queryOrigin))
//         );
//       }

//       return origin.includes(queryOrigin) || destination.includes(queryOrigin);
//     });

//     // Match other fields (strings and numbers)
//     const otherFieldMatches = filteredTrips.filter((trip) =>
//       Object.values(trip).some((value) => {
//         if (typeof value === "string") {
//           return value.toLowerCase().includes(lowercaseQuery);
//         } else if (typeof value === "number" && isNumericQuery) {
//           return value === numericQuery || value.toString().includes(searchQuery);
//         }
//         return false;
//       })
//     );

//     // Combine results
//     const combinedResults = [...new Set([...routeMatches, ...otherFieldMatches])];
//     filteredTrips = combinedResults;
//   }

//   // Default safeguard: sort by startDate descending (latest trips first)
//   filteredTrips.sort((a, b) => {
//     const aDate = new Date(a.startDate).getTime();
//     const bDate = new Date(b.startDate).getTime();
//     return bDate - aDate; // descending order
//   });

//   // Preserve manual sort (if user clicked a column)
//   if (sortConfig.key) {
//   filteredTrips.sort((a, b) => {
//     // Assert to any for dynamic property access
//     const aValue = (a as any)[sortConfig.key!];
//     const bValue = (b as any)[sortConfig.key!];
//     if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
//     if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
//     return 0;
//   });
// }



//   // Compute advanceTotal for each trip
//   // const processedTrips = filteredTrips.map(trip => {
//   //   const advanceSum = (trip.tripAccounts ?? [])
//   //     .filter(acc => acc.accountType === 'Advances')
//   //     .reduce((sum, acc) => sum + (acc.amount ?? 0), 0);
//   //   return { ...trip, advanceTotal: advanceSum };
//   // });
//   const processedTrips = filteredTrips.map(trip => {
//   const advanceSum = (trip.tripAccounts ?? [])
//     .filter(acc => acc.accountType === 'Advances')
//     .reduce((sum, acc) => sum + (acc.amount ?? 0), 0);

//   const paymentTotal = (trip.tripAccounts ?? [])
//     .filter(acc => acc.accountType === 'Payments')
//     .reduce((sum, acc) => sum + (acc.amount ?? 0), 0);

//   const supplierBalance = (trip.truckHireCost || 0) - paymentTotal;

//   return { ...trip, advanceTotal: advanceSum, supplierBalance };
// });


//   // <-- Return the processed trips with advanceTotal
//   return processedTrips as TripWithAdvanceTotal[];
// }, [trips, sortConfig, searchQuery, startDateFilter, endDateFilter]);
const sortedTrips = useMemo(() => {
  if (!trips) return [];


  let filteredTrips = [...trips.trips].filter((trip) => {
    const tripDate = new Date(trip.startDate);
    return tripDate >= startDateFilter && tripDate <= endDateFilter;
  });


  if (searchQuery) {
    const lowercaseQuery = searchQuery.toLowerCase();

    const numericQuery = Number(searchQuery);
    const isNumericQuery = !isNaN(numericQuery);

    const routeParts = lowercaseQuery.split(/\s*->\s*|\s+/).filter(Boolean);
    const queryOrigin = routeParts[0] || "";
    const queryDestination = routeParts[1] || "";

    const routeMatches = filteredTrips.filter((trip) => {
      const origin = trip.route?.origin?.toLowerCase() || "";
      const destination = trip.route?.destination?.toLowerCase() || "";

      if (queryOrigin && queryDestination) {
        return (
          (origin.includes(queryOrigin) && destination.includes(queryDestination)) ||
          (origin.includes(queryDestination) && destination.includes(queryOrigin))
        );
      }

      return origin.includes(queryOrigin) || destination.includes(queryOrigin);
    });

    const otherFieldMatches = filteredTrips.filter((trip) =>
      Object.values(trip).some((value) => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(lowercaseQuery);
        } else if (typeof value === "number" && isNumericQuery) {
          return value === numericQuery || value.toString().includes(searchQuery);
        }
        return false;
      })
    );

    const combinedResults = [...new Set([...routeMatches, ...otherFieldMatches])];
    filteredTrips = combinedResults;
  }


  const processedTrips = filteredTrips.map((trip) => {
    const advanceSum = (trip.tripAccounts ?? [])
      .filter((acc) => acc.accountType === "Advances")
      .reduce((sum, acc) => sum + (acc.amount ?? 0), 0);

    const paymentTotal = (trip.tripAccounts ?? [])
      .filter((acc) => acc.accountType === "Payments")
      .reduce((sum, acc) => sum + (acc.amount ?? 0), 0);

    const supplierBalance = (trip.truckHireCost || 0) - paymentTotal;

    return { ...trip, advanceTotal: advanceSum, supplierBalance };
  });

  processedTrips.sort((a, b) => {
    const aDate = new Date(a.startDate).getTime();
    const bDate = new Date(b.startDate).getTime();
    return bDate - aDate;
  });


  if (sortConfig.key) {
    processedTrips.sort((a, b) => {
      const aValue = (a as any)[sortConfig.key!];
      const bValue = (b as any)[sortConfig.key!];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }


  return processedTrips as TripWithAdvanceTotal[];
}, [trips, sortConfig, searchQuery, startDateFilter, endDateFilter]);


  const requestSort = useCallback((key: string) => {
  setSortConfig((prevConfig) => ({
    key,
    direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
  }))
}, []);

  const getSortIcon = useCallback(
  (columnName: string) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
    }
    return <FaSort />
  },
  [sortConfig],
);


  const handleEdit = useCallback(
    async (data: Partial<ITrip>) => {
      if (!selectedTrip) return
      try {
        await editTrip({ tripId: selectedTrip.trip_id, tripData: data }).unwrap()
        toast({
          description: "Trip Edited Successfully",
        })
      } catch (error) {
        console.error("Error editing trip:", error)
        toast({
          description: "Error Editing Trip",
          variant: "destructive",
        })
      } finally {
        setSelectedTrip(null)
        setEdit(false)
      }
    },
    [selectedTrip, editTrip, toast],
  )

  const handleExportToExcel = async () => {
  const selectedColumns = [
    "startDate",
    "LR",
    "truck",
    "from",
    "to",
    "partyName",
    "amount",
    "advance",
    "supplierBalance",
    "truckHireCost",
    "balance"
  ];

  const columnHeaders: Record<string, string> = {
    startDate: "Start Date",
    LR: "LR & FM Number",
    truck: "Truck Number",
    from: "Origin",
    to: "Destination",
    partyName: "Party Name",
    amount: "Amount",
    advance: "Advance Amount",
    supplierBalance: "Supplier Balance",
    truckHireCost: "Truck Hire Cost",
    balance: "Party Balance"
  };

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Trips");

  // Define columns with headers and keys
  worksheet.columns = selectedColumns.map(col => ({
    header: columnHeaders[col] || col,
    key: col,
    width: 25
  }));

  // Add rows with mapped data
  sortedTrips.forEach(trip => {
    worksheet.addRow({
      startDate: trip.startDate ? new Date(trip.startDate).toLocaleDateString("en-IN") : "~",
      LR: `${trip.LR ?? "~"}${trip.LR && trip.fmNo ? ", " : "~"}${trip.fmNo ?? "~"}`,
      truck: trip.truck ?? "~",
      from: trip.route?.origin ?? "~",
      to: trip.route?.destination ?? "~",
      partyName: trip.partyName ?? "~",
      amount: trip.amount ?? "~",
      advance: trip.advanceTotal ?? "~",
      supplierBalance: trip.supplierBalance ?? "~",
      truckHireCost: trip.truckHireCost ?? "~",
      balance: trip.balance ?? "~",
    });
  });

  // Style header row (bright orange background, bold text)
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill = {
      type: "pattern",
      pattern:"solid",
      fgColor:{argb:"FFFFA500"} // Bright orange
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White bold text
    cell.border = {
      top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
    }
  });

  // Style data rows: alternate light grey and light orange background
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const fillColor = rowNumber % 2 === 0 ? "FFF5F5F5" : "FFFFFBE5"; // grey / light orange
    row.eachCell(cell => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillColor }
      };
      cell.border = {
        top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
      };
    });
  });

  // Generate buffer and save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  // Generate date in DD-MM-YYYY format
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const dateStr = `${day}-${month}-${year}`;
  const fileName = `Trips_${dateStr}.xlsx`;

  saveAs(blob, fileName);
};







//   const handleExportToExcel = () => {
//   const selectedColumns = [
//     "startDate",
//     "LR/FM",
//     "truck",
//     "from",
//     "to",
//     "partyName",
//     "amount",
//     "advance",
//     "truckHireCost",
//     "balance"
//   ]; // Define the columns you want

//   const columnHeaders: Record<string, string> = {
//     startDate: "Start Date",
//     "LR/FM": "LR/FM Number",
//     truck: "Truck Number",
//     from: "Origin",
//     to: "Destination",
//     partyName: "Party Name",
//     amount: "Amount",
//     advance: "Advance Amount",
//     truckHireCost: "Truck Hire Cost",
//     balance: "Party Balance"
//   };

//   // Map trips to export rows with custom headers and formatted date
//   const filteredData = sortedTrips.map(trip => {
//     const baseData = Object.fromEntries(
//       selectedColumns.map(col => {
//         if (col.toLowerCase() === "advance") {
//           return [columnHeaders[col] || col, trip.advanceTotal ?? 0];
//         }
//         if (col === "from") {
//           return [columnHeaders[col] || col, trip.route?.origin || ""];
//         }
//         if (col === "to") {
//           return [columnHeaders[col] || col, trip.route?.destination || ""];
//         }
//         if (hasKey(trip, col)) {
//           return [columnHeaders[col] || col, trip[col] ?? ""];
//         }
//         return [columnHeaders[col] || col, ""];
//       })
//     );

//     return {
//       ...baseData,
//       [columnHeaders["startDate"] || "startDate"]: new Date(trip.startDate).toLocaleDateString('en-IN') || "",
//     };
//   });

//   const worksheet = XLSX.utils.json_to_sheet(filteredData);

//   // Ensure worksheet range is set
//   if (!worksheet['!ref']) {
//     worksheet['!ref'] = XLSX.utils.encode_range({
//       s: { c: 0, r: 0 },
//       e: { c: selectedColumns.length - 1, r: filteredData.length - 1 },
//     });
//   }

//   // Apply orange background and borders to all cells
//   const range = XLSX.utils.decode_range(worksheet['!ref']);
//   for (let rowNum = range.s.r; rowNum <= range.e.r; ++rowNum) {
//     for (let colNum = range.s.c; colNum <= range.e.c; ++colNum) {
//       const cellRef = XLSX.utils.encode_cell({ c: colNum, r: rowNum });
//       if (!worksheet[cellRef]) continue;
//       worksheet[cellRef].s = {
//         fill: {
//           patternType: "solid",
//           fgColor: { rgb: "FFFFA500" }, // Bright Orange (RGBA)
//         },
//         border: {
//           top: { style: "thin", color: { rgb: "000000" } },
//           bottom: { style: "thin", color: { rgb: "000000" } },
//           left: { style: "thin", color: { rgb: "000000" } },
//           right: { style: "thin", color: { rgb: "000000" } }
//         }
//       };
//     }
//   }

//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");

//   const excelBuffer = XLSX.write(workbook, {
//     bookType: "xlsx",
//     type: "array",
//     cellStyles: true, // Enable style preservation
//   });

//   const data = new Blob([excelBuffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   });

//   saveAs(data, "trips.xlsx");
// };



  
  

  if (isLoading) return <Loading />
  if (error) return <div className="flex justify-center items-center h-full text-red-500">Error loading trips</div>

  return (
    <div className="w-full p-4 h-full bg-white">
      <div className="flex w-full px-4 md:px-60">
        <input
          type="text"
          placeholder={`Search from ${trips?.trips.length || 0} trips...`}
          onChange={handleSearch}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between mt-4">
  <div className="flex items-center bg-orange-100 rounded-sm text-orange-800 p-2 mb-2 md:mb-0">
    <span>Total Balance:</span>
    <span className="ml-2 text-lg font-bold">
      {trips ? formatNumber(trips.trips.reduce((acc, trip) => acc + trip.balance, 0)) : "Calculating..."}
    </span>
  </div>

  <div className="flex items-end space-x-2 p-2">
    {/* ✅ Date Range Filter */}
    <div className="flex items-center space-x-2 p-2">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">From</label>
        <input
          type="date"
          value={startDateFilter.toISOString().split("T")[0]}
          onChange={(e) => setStartDateFilter(new Date(e.target.value))}
          onClick={(e) => (e.target as HTMLInputElement).showPicker()}
          className="border rounded p-1"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">To</label>
        <input
          type="date"
          value={endDateFilter.toISOString().split("T")[0]}
          onChange={(e) => setEndDateFilter(new Date(e.target.value))}
          onClick={(e) => (e.target as HTMLInputElement).showPicker()}
          className="border rounded p-1"
        />
      </div>
    </div>
    {/* ✅ End Date Range Filter */}

    <Select value={selectedStatus?.toString() ?? "all"} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        {statuses.map((status, index) => (
          <SelectItem key={index} value={index.toString()}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Select Columns</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {columnOptions.map((col) => (
          <DropdownMenuItem key={col.value} asChild>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.label)}
                onChange={() => toggleColumn(col.label)}
              />
              <span>{col.label}</span>
            </label>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>

    <Button onClick={() => setInvoiceOpen(true)}>Generate Invoice</Button>
    <Button onClick={handleExportToExcel}>Export to Excel</Button>
  </div>
</div>


      {!trips || trips.trips.length === 0 ? (
        <div className="flex justify-center items-center h-full text-gray-500">No trips found</div>
      ) : (
        <div className="w-full overflow-x-auto">
          {edit && (
            <EditTripForm
              isOpen={edit}
              onClose={() => {
                setEdit(false)
                setSelectedTrip(null)
              }}
              trip={selectedTrip as ITrip}
              onSubmit={handleEdit}
            />
          )}

          <Table>
            {/* <TableHeader>
              <TableRow>
                {columnOptions.map(
  (col) =>
    visibleColumns.includes(col.label) && (
      <TableHead key={col.value} onClick={() => requestSort(col.value as keyof ITrip)}>
        <div className="flex justify-center items-center">
          {col.label} {col.value !== "route" && getSortIcon(col.value as keyof ITrip)}
        </div>
      </TableHead>
    ),
)}
<TableHead onClick={() => requestSort("supplierBalance")}>
  <div className="flex justify-center items-center">
    Supplier Balance {getSortIcon("supplierBalance")}
  </div>
</TableHead>
<TableHead onClick={() => requestSort("balance")}>
  <div className="flex justify-center items-center">Party Balance {getSortIcon("balance")}</div>
</TableHead>

              </TableRow>
            </TableHeader> */}
           <TableHeader>
  <TableRow>
    {columnOptions.map(
      (col) =>
        visibleColumns.includes(col.label) && (
          <TableHead
            key={col.value}
            onClick={() => requestSort(col.value as keyof ITrip)}
          >
            <div className="flex justify-center items-center">
              {col.label}{" "}
              {col.value !== "route" && getSortIcon(col.value as keyof ITrip)}
            </div>
          </TableHead>
        )
    )}
    {/* ✅ Only Party Balance added manually */}
    <TableHead onClick={() => requestSort("balance")}>
      <div className="flex justify-center items-center">
        Party Balance {getSortIcon("balance")}
      </div>
    </TableHead>
  </TableRow>
</TableHeader>


            <TableBody>
              {sortedTrips.map((trip: typeof sortedTrips[number], index: number) => (
                <TableRow
                  key={trip.trip_id}
                  className="hover:bg-orange-50 cursor-pointer transition-colors duration-200"
                  onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
                  index={index + 1}
                >
                  {columnOptions.map(
                    (col) =>
                      visibleColumns.includes(col.label) && (
                        <TableCell key={col.value}>{renderCellContent(col.value, trip)}</TableCell>
                      ),
                  )}
                  <TableCell>
                    <div className="flex items-center justify-between">
                      <p className="text-green-600 font-semibold">₹{formatNumber(trip.balance)}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="rounded-full p-1 bg-transparent hover:bg-lightOrangeButtonColor hover:text-white transition-all duration-300 ease-in-out border-none"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenOptionsId(openOptionsId === trip.trip_id ? null : trip.trip_id)
                            }}
                          >
                            <SlOptionsVertical />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={(e) => handleDuplicate(e, trip as ITrip)}
                            className="cursor-pointer hover:bg-orange-100 transition-colors duration-200"
                          >
                            <IoDuplicateOutline className="mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUndoStatus(trip as ITrip)
                            }}
                            className="cursor-pointer hover:bg-orange-100 transition-colors duration-200"
                          >
                            <IoMdUndo className="mr-2" />
                            Undo Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setEdit(true)
                              setSelectedTrip(trip as ITrip)
                            }}
                            className="cursor-pointer hover:bg-orange-100 transition-colors duration-200"
                          >
                            <MdEdit className="mr-2" /> Edit Trip
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(trip.trip_id)
                            }}
                            className="cursor-pointer hover:bg-orange-100 transition-colors duration-200"
                          >
                            <MdDelete className="mr-2" /> Delete Trip
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <InvoiceForm open={invoiceOpen} setOpen={setInvoiceOpen} />
    </div>
  )
}

function renderCellContent(columnValue: string, trip: ITrip | any) {
  switch (columnValue) {
    case "startDate":
      return (
        <div>
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-orange-600" />
            <span>{new Date(trip.startDate).toLocaleDateString("en-IN")}</span>
          </div>
          <div>
            <span className="font-medium flex gap-[1px] text-xs text-gray-500 whitespace-nowrap">
              EWB Validity :{ewbColor(trip)}
            </span>
          </div>
        </div>
      )
    case "LR":
  return (
    <>
      {trip.LR}
      <br />
      {trip.fmNo}
    </>
  );
    case "truck":
      return (
        <>
          <div className="flex items-center space-x-2">
            <FaTruck className="text-orange-600" />
            <span>{trip.truck}</span>
          </div>
          <Link onClick={(e) => e.stopPropagation()} href={`/user/drivers/${trip.driver}`}>
            <Button variant={"link"} className="text-xs">
              {trip.driverName}
            </Button>
          </Link>
        </>
      )
    case "party":
      return trip.partyName
    case "route":
      return `${trip.route.origin.split(",")[0]} → ${trip.route.destination.split(",")[0]}`
    case "status":
      return (
        <div className="flex flex-col items-center space-y-1">
          <span>{statuses[trip.status as number]}</span>
          <div className="relative w-full bg-gray-200 h-2 rounded">
            <div
              className={`absolute top-0 left-0 h-2 rounded transition-all duration-500 ${
                trip.status === 0
                  ? "bg-red-500"
                  : trip.status === 1
                    ? "bg-yellow-500"
                    : trip.status === 2
                      ? "bg-blue-500"
                      : trip.status === 3
                        ? "bg-green-500"
                        : "bg-green-800"
              }`}
              style={{ width: `${((trip.status as number) + 1) * 20}%` }}
            />
          </div>
        </div>
      )
    case "amount":
      return <p className="text-green-600 font-semibold">₹{formatNumber(trip.amount)}</p>
    case "advance":
  return (
    <p className="text-blue-600 font-semibold">
      {trip.advanceTotal ? formatNumber(trip.advanceTotal) : "0"}
    </p>
  );
  case "supplierBalance":
  return (
    <p className="text-purple-600 font-semibold">
      ₹{formatNumber(trip.supplierBalance)}
    </p>
  );
    case "truckHireCost":
      return (
        <p className="text-red-500 font-semibold">
          {trip.truckHireCost ? "₹" + formatNumber(trip.truckHireCost) : "NA"}
        </p>
      )
    default:
      return null
  }
}

