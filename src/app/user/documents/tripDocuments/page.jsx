'use client';


import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { FaChevronRight, FaFolder, FaList } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import ewbIcon from '@/assets/ewb-icon.png';
import podIcon from '@/assets/pod-icon.png';
import otherIcon from '@/assets/others.png';
import Image from 'next/image';
import biltyIcon from '@/assets/bilty-icon.png';
import folderIcon from '@/assets/folder-icon.png'
import { FaThLarge } from 'react-icons/fa';
import TripDocumentUpload from '@/components/documents/TripDocumentUpload';
import { CloudUpload } from 'lucide-react';
import { useExpenseData } from '@/components/hooks/useExpenseData';
import { motion } from 'framer-motion';

const TripDocumentsLanding = () => {
  const TripDocArray = [
    {
      title: 'E-Way Bill',
      icon: ewbIcon, // Icon representing an invoice-like document for E-Way Bill
    },
    {
      title: 'POD',
      icon: podIcon, // Icon representing proof of delivery (contract-like document)
    },
    {
      title: 'Bilty',
      icon: biltyIcon, // Icon representing a truck loading document (Bilty)
    },
    {
      title: 'FM/Challan',
      icon: biltyIcon
    },
    {
      title: 'Other',
      icon: otherIcon, // Folder icon for "Other" category
    },
  ];

  const { trips, isLoading } = useExpenseData();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [type, setType] = useState('');

  const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'), { ssr: false });

  const fetchDocuments = useCallback(async () => {
    if (type) {
      try {
        setLoading(true)
        setMessage('Fetching documents...');
        const res = await fetch(`/api/trips/documents?type=${encodeURIComponent(type as string)}`);
        const data = res.ok ? await res.json() : setMessage('Failed to fetch documents');
        setDocuments(data.documents);
        setMessage('');
        if (data.documents.length === 0) {
          setMessage('No documents found');
        }
      } catch (error) {
        console.error(error);
        alert('Failed to fetch documents');
        setMessage('Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    }
  }, [type]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredTrips = trips.filter(
    (trip) =>
      trip.route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(trip.startDate).toLocaleDateString().includes(searchTerm.toLowerCase()) ||
      trip.LR.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.truck.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocs = documents.filter(
    (doc) =>
      doc.route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.LR.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.truck.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(doc.startDate).toLocaleDateString().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#FBFBFB] min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-2xl font-semibold text-black flex items-center space-x-2">
          <Button variant="link" className="p-0 m-0">
            <Link href={`/user/documents`} className="text-2xl font-semibold hover:underline">
              Docs
            </Link>
          </Button>
          <FaChevronRight className="text-lg text-gray-500" />
          <span>Trip Docs</span>
        </h1>

        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300"
          />
          {!type && (
            <Button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? (
                <FaList className="text-xl" />
              ) : (
                <FaThLarge className="text-xl" />
              )}
            </Button>
          )}
          <div className='flex justify-end my-2 fixed right-4 bottom-4'>
            <Button onClick={() => setModalOpen(true)} className='rounded-full h-full py-2'><CloudUpload size={40} /></Button>
          </div>
        </div>
      </div>

      <div className="my-4">
        <h1 className="text-lg font-semibold text-black my-4">Select Document Type</h1>
        <div className="grid grid-cols-5 gap-4">
          {TripDocArray.map((item: any, index: number) => (
            <motion.div
              key={index}
              onClick={() => setType((prev) => (prev === item.title ? '' : item.title))}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div
                className={`flex flex-col items-center justify-center border border-gray-300 gap-4 bg-[#FBFBFB] rounded-lg p-6 transition-all cursor-pointer ${type === item.title ? 'bg-lightOrange' : ''
                  }`}
              >
                <Image src={item.icon} alt={item.title} width={100} height={100} priority />
                <h2 className="text-xl font-semibold text-black text-center">{item.title}</h2>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {!type ? (
        <div>
          <h1 className="text-lg font-semibold text-black py-4 mt-4">Or Select Trip</h1>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col space-y-4'}>
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => (
                <Link
                  href={{
                    pathname: `/user/documents/tripDocuments/${trip.trip_id}`,
                  }}
                  key={trip.trip_id}
                >
                  <motion.div
                    initial={{ opacity: 0 }} // Initial state: fully transparent
                    animate={{ opacity: 1 }} // Final state: fully visible
                    transition={{ duration: 1 }} // Optional: transition duration in seconds
                    className={`bg-white p-6 rounded-xl hover:shadow-lg border border-gray-300 transition-all duration-300 ease-in-out hover:bg-gray-50 cursor-pointer ${viewMode === 'grid' ? 'h-full' : 'flex justify-between items-center w-full px-8 py-6'
                      }`}
                  >
                    {/* Folder icon */}
                    <Image src={folderIcon} alt='folder icon' width={48} height={48} priority className={viewMode === 'list' ? 'mr-6' : ''} />

                    {/* Trip Details */}
                    <div className="flex flex-col flex-grow">
                      <span className="font-semibold text-black">{trip.route.origin} &rarr; {trip.route.destination}</span>
                      <span className="text-gray-500">Start Date: {new Date(trip.startDate).toLocaleDateString()}</span>

                      {/* Additional Information */}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-500">LR: {trip.LR}</span>
                        <span className="text-gray-700">Truck: {trip.truck}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <span className="text-center col-span-3 text-gray-500">
                {(isLoading || loading) && loadingIndicator} {message}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className='py-4'>
          {loading ? (
            <p className='text-center'>{loadingIndicator} {message}</p>
          ) : (
            filteredDocs.length > 0 ? <RecentDocuments docs={filteredDocs} /> : <p>No documents found</p>
          )}
        </div>
      )}

      <TripDocumentUpload open={modalOpen} setOpen={setModalOpen} />

    </div>
  );
};

export default TripDocumentsLanding;
