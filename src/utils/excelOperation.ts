import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { IDriver, IParty, ITrip, TruckModel } from './interface';

type excelData = ITrip | IDriver | IParty | TruckModel

export const handleExportToExcel = (arr: excelData[], selectedColumns: string[], fileName: string) => {

    // Map the sortedTrips data to include only the selected columns
    const filteredData = arr.map(item =>
        Object.fromEntries(
            selectedColumns.map(col => [col, item[col as keyof excelData] || ""]) // Ensure missing values are empty
        )
    );

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(data, fileName);
};
