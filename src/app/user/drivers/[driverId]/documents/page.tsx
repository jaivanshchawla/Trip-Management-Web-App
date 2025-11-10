'use client'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'
import DriverDocumentUpload from '@/components/documents/DriverDocumentUpload'
import { useDriver } from '@/context/driverContext'
import { loadingIndicator } from '@/components/ui/LoadingIndicator'
import RecentDocuments from '@/components/documents/RecentDocuments'
import { CloudUpload } from 'lucide-react'

// Define allowed document types
const allowedDocuments = ["License", "Aadhar", "PAN", "PoliceVerification"];
type Document = {
  _id: string,
  filename: string,
  docType: string,
  uploadedDate: string,
  validityDate: string,
  url: string
}
const DriverDocuments = () => {
  const { driver, setDriver, loading } = useDriver()
  const [isModalOpen, setIsModalOpen] = useState(false)




  if (loading) {
    return <div>{loadingIndicator}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Driver Documents</h1>
        <Button onClick={() => setIsModalOpen(true)} className='rounded-full h-full py-2'><CloudUpload size={40} />
        </Button>
      </div>

      
          <DriverDocumentUpload open={isModalOpen} setOpen={setIsModalOpen} setDriver={setDriver} driverId={driver.driver_id} />

      <div>
        <RecentDocuments docs={driver?.documents} />
      </div>
    </div>
  )
}

export default DriverDocuments
