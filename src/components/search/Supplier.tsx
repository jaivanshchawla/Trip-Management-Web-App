import { ISupplier } from '@/utils/interface';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaUserTie, FaPhone } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface props {
    suppliers: ISupplier[];
}

const Supplier: React.FC<props> = ({ suppliers }) => {
    const router = useRouter();

    return (
        <div className='flex flex-col space-y-4 w-full'>
            <h1 className='text-bottomNavBarColor text-2xl font-semibold'>Suppliers</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {suppliers.map((supplier) => (
                    <motion.div
                        key={supplier.supplier_id as string}
                        
                        onClick={() => router.push(`suppliers/${supplier.supplier_id}/trips`)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="border border-gray-200 rounded-lg shadow-md p-4 bg-lightOrangeButtonColor text-buttonTextColor cursor-pointer transform transition-transform duration-300 ease-out hover:shadow-lg hover:scale-105">
                        <div className='flex items-center gap-2'>
                            <FaUserTie className="text-bottomNavBarColor" />
                            <span className='font-semibold text-lg'>{supplier.name}</span>
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                            <FaPhone className="text-green-500" />
                            <span>{supplier.contactNumber}</span>
                        </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Supplier;
