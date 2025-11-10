'use client'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'
import { useTruck } from '@/context/truckContext'
import RecentDocuments from '@/components/documents/RecentDocuments'
import { loadingIndicator } from '@/components/ui/LoadingIndicator'
import TruckDocumentUpload from '@/components/documents/TruckDocumentUpload'
import { CloudUpload } from 'lucide-react'

const documentTypes = ["RC", "Insurance", "Permit", "Pollution Certificate"]

const TruckDocuments = () => {
  const { truck, setTruck, loading } = useTruck()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (loading) {
    return <div>{loadingIndicator}</div>
  }


  return (
    <div className="container mx-auto px-4">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Truck Documents</h1>
        <Button onClick={() => setIsModalOpen(true)} className='rounded-full h-full py-2'><CloudUpload size={30} />
        </Button>
      </div>

      <RecentDocuments docs={truck?.documents} />


      <TruckDocumentUpload truckNo={truck?.truckNo} open={isModalOpen} setOpen={setIsModalOpen} setTruck={setTruck} />

    </div>
  )
}

export default TruckDocuments
