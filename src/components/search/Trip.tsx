import { ITrip } from '@/utils/interface';
import { statuses } from '@/utils/schema';
import React from 'react';
import { FaCalendarAlt, FaTruck, FaRoute, FaFileInvoiceDollar } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
import PartyName from '../party/PartyName';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaNoteSticky } from 'react-icons/fa6';

interface tripProps {
    trips: ITrip[];
}

const Trip: React.FC<tripProps> = ({ trips }) => {
    const router = useRouter();

    return (
        <div className='flex flex-col space-y-4 w-full'>
            <h1 className='text-bottomNavBarColor text-2xl font-semibold'>Trips</h1>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {trips.map((trip, index) => (
                    <motion.div
                        key={index}

                        onClick={() => router.push(`/user/trips/${trip.trip_id}`)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className='border border-gray-200 rounded-lg shadow-md p-4 bg-lightOrangeButtonColor text-buttonTextColor cursor-pointer transform transition-transform duration-300 ease-out hover:shadow-lg hover:scale-105'>
                            <div className='flex items-center space-x-2 mb-2'>
                                <FaCalendarAlt className="text-bottomNavBarColor" />
                                <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className='mb-2'>
                                <span className='font-medium'>LR: </span>{trip.LR}
                            </div>
                            <div className='flex items-center space-x-2 mb-2'>
                                <FaTruck className="text-bottomNavBarColor" />
                                <span>{trip.truck}</span>
                            </div>
                            <div className='flex items-center space-x-2 mb-2'>
                                <GoOrganization className="text-bottomNavBarColor" />
                                <span><PartyName partyId={trip.party} /></span>
                            </div>
                            <div className='flex items-center space-x-2 mb-2'>
                                <FaRoute className="text-bottomNavBarColor" />
                                <span>{trip.route.origin.split(',')[0]} -&gt; {trip.route.destination.split(',')[0]}</span>
                            </div>
                            <div className='mb-2'>
                                <span className='font-medium'>Status: </span>
                                <div className='relative w-full bg-gray-200 h-1 rounded'>
                                    <div className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`} style={{ width: `${(trip.status as number / 4) * 100}%` }}></div>
                                </div>
                                <span className='text-sm ml-2'>{statuses[trip.status as number]}</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <FaNoteSticky className="text-bottomNavBarColor" />
                                <span>{trip.notes}</span>
                            </div>
                            <div className="bg-lightOrange shadow-lg rounded-lg divide-y divide-gray-200 mt-4">
                                {trip.accounts.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col px-4 py-2 transition duration-300 ease-out transform hover:scale-105 rounded-lg cursor-pointer text-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-buttonTextColor">{item.paymentType}</p>
                                                <p className="text-xs text-buttonTextColor">Amount: {item.amount}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-buttonTextColor">Date: {new Date(item.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 bg-gray-100 p-2 rounded-md border border-gray-300 text-xs">
                                            <p className="text-gray-600">
                                                Received by Driver: {item.receivedByDriver ? 'Yes' : 'No'}
                                            </p>
                                            {item.notes && (
                                                <p className="text-gray-600 mb-2">Notes: {item.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default Trip;
