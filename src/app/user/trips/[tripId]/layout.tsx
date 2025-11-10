'use client'
import { TripProvider } from '@/context/tripContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import React from 'react'

interface props {
    children: React.ReactNode
}

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { tripId } = useParams()
    const pathname = usePathname()
    const tabs = [
        { name: 'Summary', path: `/user/trips/${tripId}` },
        { name: 'Documents', path: `/user/trips/${tripId}/documents` }
    ]
    return (
        <div>
            <TripProvider tripId={tripId as string} >
                <div className="flex items-center justify-around " style={{ scrollbarWidth: 'thin' }}>
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.path}
                            prefetch={true}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-md text-black hover:bg-hoverColor cursor-pointer ${pathname === tab.path
                                    ? 'border-b-2 border-[#3190F5] rounded-b-none bg-hoverColor'
                                    : 'border-transparent'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <span>{tab.name}</span>
                                </div>
                            </motion.div>

                        </Link>
                    ))}
                </div>
                {children}
            </TripProvider>
        </div>
    )
}

export default Layout;