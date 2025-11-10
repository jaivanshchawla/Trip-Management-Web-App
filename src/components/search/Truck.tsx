import { TruckModel } from '@/utils/interface';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React from 'react';
import { truckTypesIcons } from '@/utils/utilArray';

interface props {
    trucks: TruckModel[];
}

const Truck: React.FC<props> = ({ trucks }) => {
    const router = useRouter();

    return (
        <div className='flex flex-col w-full space-y-4'>
            <h1 className='text-bottomNavBarColor text-2xl font-semibold'>Trucks</h1>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            >
                {trucks.map((truck, index) => {
                    const Icon = truckTypesIcons.find(item => item.type === truck.truckType)?.Icon;
                    return (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg shadow-md p-4 bg-lightOrangeButtonColor text-buttonTextColor cursor-pointer transform transition-transform duration-300 ease-out hover:shadow-lg hover:scale-105"
                            onClick={() => router.push(`/user/trucks/${truck.truckNo}`)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">{truck.truckNo}</h2>
                                {Icon && <Icon className="inline-block h-8 w-8 text-bottomNavBarColor" />}
                            </div>
                            <div className="mb-2">
                                <span className="font-medium">Type: </span>
                                <span>{truck.truckType}</span>
                            </div>
                            <div className="mb-2">
                                <span className="font-medium">Ownership: </span>
                                <span>{truck.ownership}</span>
                            </div>
                            <div>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${truck.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}
                                >
                                    {truck.status}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
}

export default Truck;
