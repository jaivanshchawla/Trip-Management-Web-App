import { FaCalendarAlt, FaTruck } from "react-icons/fa";
import { ITrip } from "./interface";
import { statuses } from "./schema";
import { formatNumber } from "./utilArray";

export function renderCellContent(columnValue: string, trip: ITrip | any) {
    switch (columnValue) {
        case 'startDate':
            return (
                <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-orange-600" />
                    <span>{new Date(trip?.startDate).toLocaleDateString()}</span>
                </div>
            );
        case 'date':
            return (
                <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-orange-600" />
                    <span>{new Date(trip?.date).toLocaleDateString('en-IN')}</span>
                </div>
            );
        case 'LR':
            return trip?.LR;
        case 'truck':
            return (
                <div className="flex items-center space-x-2">
                    <FaTruck className="text-orange-600" />
                    <span>{trip?.truck}</span>
                </div>
            );
        case 'party':
            return trip?.partyName;
        case 'route':
            return `${trip?.route.origin.split(',')[0]} → ${trip?.route.destination.split(',')[0]}`;
        case 'description':
            return `${trip?.description.origin.split(',')[0]} → ${trip?.description.destination.split(',')[0]}`;
        case 'status':
            return (
                <div className="flex flex-col items-center space-x-2">
                    <span>{statuses[trip?.status as number]}</span>
                    <div className="relative w-full bg-gray-200 h-1 rounded">
                        <div
                            className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip?.status === 0 ? 'bg-red-500' :
                                trip?.status === 1 ? 'bg-yellow-500' :
                                    trip?.status === 2 ? 'bg-blue-500' :
                                        trip?.status === 3 ? 'bg-green-500' :
                                            'bg-green-800'
                                }`}
                            style={{ width: `${trip?.status as number * 25}%` }}
                        />
                    </div>
                </div>
            );
        case 'invoice':
            return <p className='text-green-600 font-semibold'>₹{formatNumber(trip?.amount)}</p>;
        case 'truckCost':
            return (
                <p className='text-red-500 font-semibold'>
                    {trip?.truckHireCost ? '₹' + formatNumber(trip?.truckHireCost) : 'NA'}
                </p>
            );
        default:
            return null;
    }
}