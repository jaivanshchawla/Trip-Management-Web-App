'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaRoute, FaTruck } from 'react-icons/fa';
import { PiSteeringWheel } from 'react-icons/pi';
import { GoOrganization } from 'react-icons/go';
import dynamic from 'next/dynamic';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import { useRecentDocsCtx } from '@/context/recentDocs';
import { BiCloudUpload } from 'react-icons/bi';
import { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import { CloudUpload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import TruckDocumentUpload from '@/components/documents/TruckDocumentUpload';
import TripDocumentUpload from '@/components/documents/TripDocumentUpload';
import DriverDocumentUpload from '@/components/documents/DriverDocumentUpload';
import CompanyDocumentUpload from '@/components/documents/CompanyDocumentUpload';
import OtherDocumentUpload from '@/components/documents/OtherDocumentUpload';

const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'), { ssr: false });

const DocumentsPage = () => {
  const { documents, counts, docsLoading } = useRecentDocsCtx()
  const [error, setError] = useState('');
  const { mutate } = useSWRConfig()
  const [open, setOpen] = useState(false)
  const [tripOpen, setTripOpen] = useState(false);
  const [truckOpen, setTruckOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);


  useEffect(() => {
    mutate('/api/documents/recent')
  }, [mutate])

  // const fetchRecentDocuments = async () => {
  //   try {
  //     const res = await fetch(`/api/documents/recent`);
  //     if (!res.ok) {
  //       throw new Error('Failed to fetch recent documents');
  //     }
  //     const data = await res.json();
  //     if (data.documents.length === 0) {
  //       setError('No recent documents found');
  //       return;
  //     }

  //     // Update both recentDocs and counts
  //     setRecentDocs(data.documents);
  //     setCounts(data.counts);  // Assuming `data.counts` contains {tripDocuments, driverDocuments, truckDocuments}
  //   } catch (error: any) {
  //     console.log(error);
  //     setError('Failed to load documents');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const documentTypes = [
    {
      title: 'Trip Documents',
      link: '/user/documents/tripDocuments',
      icon: <FaRoute className='text-bottomNavBarColor' size={40} />
    },
    {
      title: 'Driver Documents',
      link: '/user/documents/driverDocuments',
      icon: <PiSteeringWheel className='text-bottomNavBarColor' size={40} />
    },
    {
      title: 'Lorry Documents',
      link: '/user/documents/truckDocuments',
      icon: <FaTruck className='text-bottomNavBarColor' size={40} />
    },
    {
      title: 'Company Documents',
      link: '/user/documents/companyDocuments',
      icon: <GoOrganization className='text-bottomNavBarColor' size={40} />
    },
    {
      title: 'Quick Uploads',
      link: '/user/documents/otherDocuments',
      icon: <BiCloudUpload className='text-bottomNavBarColor' size={40} />
    }
  ];

  const openModal = (title: string) => {
    setOpen(false)
    switch (title) {
      case 'Trip Documents':
        setTripOpen(!tripOpen);
        break;
      case 'Truck Documents':
        setTruckOpen(!truckOpen);
        break;
      case 'Driver Documents':
        setDriverOpen(!driverOpen);
        break;
      case 'Company Documents':
        setCompanyOpen(!companyOpen);
        break;
      case 'Quick Uploads':
        setOtherOpen(!otherOpen);
        break;
      default:
        break;
    }
  }

  // useEffect(() => {
  //   fetchRecentDocuments();
  // }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-2xl font-semibold text-black">Documents</h1>
      </div>

      <div className='flex justify-end my-2 fixed right-4 bottom-4'>
        <Button onClick={() => setOpen(true)} className='rounded-full h-full py-2'><CloudUpload size={40} /></Button>
      </div>

      <div className="grid grid-cols-5 gap-4 border-b-2 border-gray-300 py-4">
        {documentTypes.map((type) => (
          <Link href={type.link} key={type.title}>
            <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-lightOrangeButtonColor hover:bg-lightOrange cursor-pointer">
              <div className="flex flex-col items-start">
                {type.icon}
                <h1 className="text-left text-lg font-semibold text-black mt-4">
                  {type.title}
                </h1>
                <p className="text-gray-400">
                  {/* Display the counts from the state */}
                  {type.title === 'Trip Documents' && counts.tripDocuments + ' files'}
                  {type.title === 'Driver Documents' && counts.driverDocuments + ' files'}
                  {type.title === 'Lorry Documents' && counts.truckDocuments + ' files'}
                  {type.title === 'Company Documents' && counts.companyDocuments + ' files'}
                  {type.title === 'Quick Uploads' && counts.otherDocuments + ' files'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-2">
          <h1 className="text-xl text-black font-semibold my-4">Recently Uploaded</h1>
        </div>
        {docsLoading && <div>{loadingIndicator}</div>}
        {error && <p className="text-red-500">{error}</p>}
        {documents && <RecentDocuments docs={documents} />}
      </div>
      {
        open &&
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Select Document Type</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-5 gap-6">
              {documentTypes.map(({ title, icon }) => (
                <Button
                  key={title}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-32 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => openModal(title)}
                >
                  {/* Replace with your actual icon component */}
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="text-sm font-medium">{title.split(' ')[0]}</p>
                </Button>
              ))}
            </div>


          </motion.div>

        </div>
      }

      <TruckDocumentUpload open={truckOpen} setOpen={setTruckOpen} />



      <TripDocumentUpload open={tripOpen} setOpen={setTripOpen} />


      <DriverDocumentUpload open={driverOpen} setOpen={setDriverOpen} />


      <CompanyDocumentUpload open={companyOpen} setOpen={setCompanyOpen} />


      <OtherDocumentUpload open={otherOpen} setOpen={setOtherOpen} />

    </div>
  );
};

export default DocumentsPage;
