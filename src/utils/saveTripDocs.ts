import jsPDF from "jspdf";
import { invData, ITrip } from "./interface";

export const savePDFToBackend = async (pdf: jsPDF, filename: string, docType: string, trip: ITrip | any, date: string | Date) => {
  const pdfBlob = pdf.output('blob');
  const file = new File([pdfBlob], `Bilty-${trip.LR}-${trip.truck}.pdf`, {
    type: 'application/pdf',
  });

  const formdata = new FormData();
  formdata.append('file', file);
  formdata.append('docType', docType);
  formdata.append('validityDate', new Date(date)?.toISOString().split('T')[0]);
  formdata.append('filename', filename);

  const response = await fetch(`/api/trips/${trip.trip_id}/documents`, {
    method: 'PUT',
    body: formdata,
  });

  if (!response.ok) {
    throw new Error('Failed to save bilty to documents');
  }

  const data = await response.json();
  return data

};


export const saveInvoice = async (invData: Partial<invData>, invoiceId?: string) => {
  try {

    let response
    if (invoiceId) {
      delete invData['invoiceNo']
      delete invData['dueDate']
      delete invData['date']
      response = await fetch(`/api/invoices/${invoiceId.toString()}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invData)
      })
    } else {
      response = await fetch(`/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invData)
      });
    }



    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save invoice: ${errorText}`);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in saveInvoice:", error);
    throw error; // Rethrow to be handled by the calling function
  }
};
