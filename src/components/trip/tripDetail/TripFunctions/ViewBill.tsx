'use client'

import { Button } from '@/components/ui/button'
import { ITrip } from '@/utils/interface'
import React, { useEffect, useState } from 'react'
import { useTrip } from '@/context/tripContext'
import Link from 'next/link'
import InvoiceForm from './InvoiceForm'
import { useToast } from '@/components/hooks/use-toast'

type Props = {
  trips: ITrip[] | any[]
}

type FormDataType = {
  logourl: string
  billNo: string
  date: string
  from: string
  to: string
  address: string
  branch: string
  material: string
  partyName: string
  frieghtCharges: {
    lr: string
    truckNo: string
    material: string
    weight: string
    charged: string
    rate: string
    amount: number
  }[]
  additonalCharges: {
    truckNo: string
    material: string
    remarks: string
    amount: number
  }[]
  partyDetails: {
    msmeNo: string
    gstNumber: string
    pan: string
    accNo: string
    ifscCode: string
    bankBranch: string
    bankName: string
  }[]
  paymentDetails: {
    date: string
    paymentMode: string
    notes: string
    amount: number
  }[]
}

const ViewBillButton: React.FC<Props> = () => {
  const { trip } = useTrip()

  const [open, setOpen] = useState(false)
  const [invoice, setInvoice] = useState<any>(null)
  const { toast } = useToast()


  const fetchInvoiceData = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`)
      if (res.status === 401) {
        await fetch(`/api/logout`)
      }
      if (!res.ok) {
        toast({
          description: 'Failed to Fetch Invoice',
          variant: 'destructive'
        })
        return
      }
      const data = await res.json()
      setInvoice(data.invoice)
    } catch (error) {
      toast({
        description: 'Failed to Fetch Invoice',
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    if (trip.invoice_id) {
      fetchInvoiceData(trip.invoice_id)
    }
  }, [trip])


  return (
    <div>
      {
        trip.invoice_id ?
          <Link href={`/user/trips/invoice?party=${encodeURIComponent(invoice?.party_id)}&route=${encodeURIComponent(JSON.stringify(invoice?.route))}&trips=${encodeURIComponent(JSON.stringify(invoice?.trips))}&invoiceId=${encodeURIComponent(trip.invoice_id)}`}>
            <Button variant="outline" onClick={() => setOpen(true)}>
              <span className="truncate">Generate Bill/Invoice</span>
            </Button>
          </Link> :
          <Button variant="outline" onClick={() => setOpen(true)}>
            <span className="truncate">Generate Bill/Invoice</span>
          </Button>
      }


      <InvoiceForm open={open} setOpen={setOpen} party={trip.party} route={trip.route} tripIds={[trip.trip_id]} />

    </div>
  )
}

export default ViewBillButton

