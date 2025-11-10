'use client'
import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useParams, useSearchParams } from 'next/navigation';
import RecentDocuments from '@/components/documents/RecentDocuments';
import { useTrip } from '@/context/tripContext';
import { Button } from '@/components/ui/button';
import TripDocumentUpload from '@/components/documents/TripDocumentUpload';
import { CloudUpload, Frown } from 'lucide-react';

const Page = () => {
  const {tripId} = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const {trip, setTrip, loading} = useTrip()

  if(!trip){
    return <div className='flex items-center justify-center space-x-2'><Frown className='text-bottomNavBarColor' /> Trip Not Found</div>
  }

  return (
    <div className='mx-auto p-4'>
      <div className='flex justify-end my-2 fixed right-4 bottom-4'>
      <Button onClick={()=>setIsOpen(true)} className='rounded-full h-full py-2'><CloudUpload size={40}/></Button>
      </div>

      <RecentDocuments docs={trip?.documents || []} />
      
          <TripDocumentUpload open={isOpen} setOpen={setIsOpen} tripId={tripId as string} setTrip={setTrip}/>
        
    </div>
  );
};

export default Page;
