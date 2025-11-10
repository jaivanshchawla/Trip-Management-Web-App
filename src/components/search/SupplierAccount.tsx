import { ISupplierAccount } from '@/utils/interface';
import { motion } from 'framer-motion';
import React from 'react';
import { FaCalendarAlt, FaWallet, FaRoute } from 'react-icons/fa';
import TripRoute from '../trip/TripRoute';
import SupplierName from '../supplier/SupplierName';

interface props {
    accounts: ISupplierAccount[];
}

const SupplierAccount: React.FC<props> = ({ accounts }) => {
    return (
        <div className='flex flex-col space-y-4 w-full'>
            <h1 className='text-bottomNavBarColor text-2xl font-semibold'>Supplier Accounts</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {accounts && accounts.map((acc: ISupplierAccount, index: number) => (
                    <motion.div
                        key={index}
                        
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                      <div className="border border-gray-200 rounded-lg shadow-md p-4 bg-lightOrangeButtonColor text-buttonTextColor cursor-pointer transform transition-transform duration-300 ease-out hover:shadow-lg hover:scale-105">
                        <div className='flex items-center gap-2'>
                            <SupplierName supplierId={acc.supplier_id} />
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                            <FaCalendarAlt className="text-bottomNavBarColor" />
                            <span>{new Date(acc.date).toLocaleDateString()}</span>
                        </div>
                        <div className='flex flex-col space-y-2 mt-4'>
                            <div className='flex items-center gap-2'>
                                <FaWallet className="text-bottomNavBarColor" />
                                <span>Trip Payment</span>
                            </div>
                            <hr className='text-gray-200'/>
                            <div className='flex items-center gap-2'>
                                <FaRoute className="text-bottomNavBarColor" />
                                <TripRoute tripId={acc.trip_id} />
                            </div>
                        </div>
                        <div className='mt-4 text-green-600 font-semibold'>
                            {acc.amount}
                        </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SupplierAccount;
