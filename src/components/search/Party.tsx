import { IParty } from '@/utils/interface';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaUserTie, FaPhone, FaAddressBook } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
// import PartyBalance from '../party/PartyBalance';
import { motion } from 'framer-motion';

interface PartyProps {
    parties: IParty[];
}

const Party: React.FC<PartyProps> = ({ parties }) => {
    const router = useRouter();

    return (
        <div className='flex flex-col space-y-4 w-full'>
            <h1 className='text-bottomNavBarColor text-2xl font-semibold'>Parties</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {parties.map((party) => (
                    <motion.div
                        key={party.party_id as string}
                        
                        onClick={() => router.push(`/user/parties/${party.party_id}/trips`)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="border border-gray-200 rounded-lg shadow-md p-4 bg-lightOrangeButtonColor text-buttonTextColor cursor-pointer transform transition-transform duration-300 ease-out hover:shadow-lg hover:scale-105">

                        
                        <div className='flex items-center gap-2'>
                            <GoOrganization className="text-bottomNavBarColor" />
                            <span className='font-semibold text-lg'>{party.name}</span>
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                            <FaUserTie className="text-bottomNavBarColor" />
                            <span>{party.contactPerson}</span>
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                            <FaPhone className="text-green-500" />
                            <span>{party.contactNumber}</span>
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                            <FaAddressBook className="text-bottomNavBarColor" />
                            <span>{party.address}</span>
                        </div>
                        <div className='mt-2 text-sm'>
                            GST: {party.gstNumber || 'N/A'}
                        </div>
                        <div className='mt-4 text-xl font-semibold'>
                            {/* <PartyBalance partyId={party.party_id} /> */}
                        </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(Party);
