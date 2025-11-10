'use client';

import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import dynamic from 'next/dynamic';


interface TripDocumentProps {
    ewbValidityDate: Date;
    route: {
        origin: string;
        destination: string;
    };
    startDate: Date;
    documents : any[]
}

const TripDocuments: React.FC<TripDocumentProps> = ({ documents, ewbValidityDate, route, startDate }) => {
    const RecentDocuments = dynamic(()=>import('@/components/documents/RecentDocuments'), {ssr : false})
    // Helper function to check validity of e-way bill
    const isValid = (ewbValidityDate: Date) => {
        const today = new Date();
        return ewbValidityDate >= today;
    };


    return (
        <div className="p-6 min-h-screen">
            
            <div className="flex items-center space-x-2 text-gray-600 mb-2 text-md">
                <span className="font-semibold">{route.origin.split(',')[0]}</span>
                <FaArrowRight className="text-sm text-gray-500" />
                <span className="font-semibold">{route.destination.split(',')[0]}</span>
            </div>

            <p className="text-gray-500">Start Date: {new Date(startDate).toLocaleDateString()}</p>
            <p className={`text-gray-500 ${isValid(ewbValidityDate) ? 'text-green-600' : 'text-red-600'}`}>
                Validity Date: {new Date(ewbValidityDate).toLocaleDateString()}
            </p>

            {/* Grid Layout for E-way Bill and POD */}
            <RecentDocuments docs={documents} />

        </div>
    );
};

export default TripDocuments;
