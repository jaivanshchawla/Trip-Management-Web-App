'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation';


const DriverDocumentsPage = () => {
    const DriverDocument = dynamic(() => import('@/components/driver/DriverDocument'), { ssr: false });
    const {driverId} = useParams()
  return (
    <div><DriverDocument driverId={driverId as string} /></div>
  )
}

export default DriverDocumentsPage