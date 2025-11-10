import { Idoc, ITrip } from "./interface";

export function ewbColor(trip : ITrip | any) {
    const eWayBillDoc = trip.documents?.find((doc : Idoc) => doc.type === 'E-Way Bill');
    if (!eWayBillDoc?.validityDate) {
      return 'N/A';
    }

    const validityDate = new Date(eWayBillDoc.validityDate);
    const currentDate = new Date(Date.now());
    const timeDifference = validityDate.getTime() - currentDate.getTime(); // Difference in milliseconds
    const daysRemaining = timeDifference / (1000 * 60 * 60 * 24); // Convert to days

    let textColorClass = ''; // Class for text color
    if(trip.status >= 1){
      textColorClass = 'text-gray-500'
    }
    else if (daysRemaining < 0) {
      textColorClass = 'text-red-500'; // Expired
    } else if (daysRemaining <= 2) {
      textColorClass = 'text-yellow-500'; // Near expiry
    } else {
      textColorClass = 'text-green-500'; // Valid
    }

    return (
      <p className={textColorClass}>
        {validityDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })}
      </p>
    );
  }