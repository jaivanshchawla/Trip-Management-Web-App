'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation';


const TruckDocumentsPage = () => {
    const TruckDocument = dynamic(() => import('@/components/truck/TruckDocument'), { ssr: false });
    const {truckNo} = useParams()
  return (
    <div><TruckDocument truckNo={truckNo as string} /></div>
  )
}

export default TruckDocumentsPage