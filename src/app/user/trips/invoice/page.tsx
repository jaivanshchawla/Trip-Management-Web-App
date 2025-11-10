'use client'

import { useToast } from '@/components/hooks/use-toast'
import { ITrip } from '@/utils/interface'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Loading from '../loading'
import InvoiceForm from '@/components/trip/tripDetail/TripFunctions/InoiveForm'
import FreightInvoice from '@/components/trip/tripDetail/TripFunctions/FrieghtInvoice'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { InvoiceFormData as FormData } from '@/utils/interface'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { loadingIndicator } from '@/components/ui/LoadingIndicator'
import { saveInvoice } from '@/utils/saveTripDocs'
import { useExpenseData } from '@/components/hooks/useExpenseData'

const InvoiceGenerationPage: React.FC = () => {
  const params = useSearchParams()
  const paramtrips = JSON.parse(params.get('trips') as string)
  const party = params.get('party') as string
  const invoiceId = params.get('invoiceId') as string
  const route = JSON.parse(params.get('route') as string)

  const issuedDate = params.get('issuedDate') as string
  const dueDate = params.get('dueDate') as string
  const gst = parseFloat(params.get('gst') as string)


  const router = useRouter()
  const { toast } = useToast()

  const { invoices } = useExpenseData()

  const [trips, setTrips] = useState<ITrip[] | any[]>([])
  const [loading, setLoading] = useState(true)
  const invoiceRef = useRef<HTMLDivElement | null>(null)
  const [deletedPaymentIds, setDeletedPaymentIds] = useState<string[]>([])
  const [deletedChargeIds, setDeletedChargeIds] = useState<string[]>([])
  const [downloading, setDownloading] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    logoUrl: '',
    color : '#d1d5db',
    partygst : "",
    partyAddress : "",
    billNo: '',
    companyName: '',
    gst : gst || 0,
    email: '',
    phone: '',
    date: new Date(issuedDate || Date.now()).toISOString().split('T')[0],
    dueDate: new Date(dueDate || Date.now()).toISOString().split('T')[0],
    to: '',
    from: '',
    branch: '',
    address: '',
    particulars: '',
    signatureUrl: '',
    rate: '',
    billingtype: '',
    stampUrl: '',
    party: '',
    freightCharges: [],
    additionalCharges: [],
    partyDetails: {
      msmeNo: '',
      gstin: '',
      pan: '',
      accNo: '',
      ifscCode: '',
      bankName: '',
      bankBranch: ''
    },
    paymentDetails: [],
    extraAdditionalCharges: [],
    extraPaymentDetails: []
  })

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/trips/invoice?trips=${encodeURIComponent(JSON.stringify(paramtrips))}`)
      const data = await res.json()
      setTrips(data.trips)
      setFormData({
        ...formData,
        to: data.trips[0]?.route?.origin || '',
        from: data.trips[0]?.route?.destination || '',
        party: data.trips[0]?.partyName || '',
        partygst : data.trips[0].partyDetails.gstNumber || "",
        partyAddress : data.trips[0].partyDetails.address || "",
        freightCharges: data.trips?.map((trip: ITrip) => ({
          lrNo: trip.LR,
          truckNo: trip.truck,
          material: trip?.material ? trip.material?.map(item=>item.name) : [],
          date: new Date(trip.startDate).toISOString().split('T')[0],
          weight: trip.guaranteedWeight || 'FTL',
          charged: trip.units || '',
          rate: trip.rate || 'Fixed',
          amount: trip.amount
        })),
        additionalCharges: data.trips?.flatMap((trip: any) =>
          trip.tripCharges?.map((charge: any, index: number) => ({
            id: charge._id,
            sNo: index + 1,
            date: charge.date ? new Date(charge.date).toISOString().split('T')[0] : '',
            notes: charge.notes || '',
            expenseType: charge.expenseType || '',
            amount: charge.amount,
            edited: false
          })) || []
        ) || [],
        partyDetails: {
          msmeNo: data.trips[0]?.partyDetails?.msmeNo || '',
          gstin: data.trips[0]?.partyDetails?.gstNumber || '',
          pan: data.trips[0]?.partyDetails?.pan || '',
          accNo: '',
          ifscCode: '',
          bankName: '',
          bankBranch: ''
        },
        paymentDetails: data.trips?.flatMap((trip: any) =>
          trip.tripAccounts?.map((charge: any, index: number) => ({
            id: charge._id,
            sNo: index + 1,
            date: charge.date ? new Date(charge.date).toISOString().split('T')[0] : '',
            notes: charge.notes || '',
            paymentType: charge.paymentType || '',
            amount: charge.amount,
            edited: false
          })) || []
        ) || [],
      })
    } catch (error) {
      console.log(error)
      toast({
        description: 'Failed to fetch trips. Please try again later.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchData()
  }, [])

  const handleDownload = async () => {
  try {
    setDownloading(true);

    // 1️⃣ Tell the hidden FreightInvoice to render in PDF mode
    // If using a state in parent to control this, set it here
    // Example: setIsPdfExport(true);
    // But if you always render hidden FreightInvoice with isPdfExport={true}, skip this

    // 2️⃣ Wait for base64 images to be ready inside FreightInvoice
    //    We poll until all 3 base64 image strings are non-empty, or timeout after 5s
    await new Promise<void>((resolve) => {
      const maxWaitTime = 5000; // ms
      let waited = 0;
      const interval = setInterval(() => {
        // @ts-ignore - You can pass refs or use a parent state to check readiness
        const invoiceEl = invoiceRef.current;
        const imgs = invoiceEl?.querySelectorAll("img") || [];
        const allHaveSrc = Array.from(imgs).every(img => img.getAttribute("src"));
        if (allHaveSrc) {
          clearInterval(interval);
          resolve();
        } else if (waited >= maxWaitTime) {
          console.warn("Timeout: continuing PDF creation without confirming all images");
          clearInterval(interval);
          resolve();
        }
        waited += 100;
      }, 100);
    });

    // 3️⃣ Generate the PDF from the prepared DOM
    if (!invoiceRef.current) throw new Error("Invoice reference not found");

    const scale = 2; // Adjust scale to control resolution
    const canvas = await html2canvas(invoiceRef.current, { scale, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 4️⃣ Fit content to A4
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = canvas.width / scale;
    const imgHeight = canvas.height / scale;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = (pdfHeight - imgHeight * ratio) / 2;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${formData.party}-${new Date().toLocaleDateString('en-IN')}-invoice.pdf`);

    toast({ description: 'Invoice downloaded successfully.' });

    // 5️⃣ Save invoice data in backend
    const totalFreight = formData.freightCharges.reduce((total, charge) => total + Number(charge.amount), 0);
    const totalAdditionalCharges =
      formData.additionalCharges.reduce((total, charge) => total + Number(charge.amount), 0) +
      formData.extraAdditionalCharges.reduce((total, charge) => total + Number(charge.amount), 0);
    const totalPayments =
      formData.paymentDetails.reduce((total, payment) => total + Number(payment.amount), 0) +
      formData.extraPaymentDetails.reduce((total, payment) => total + Number(payment.amount), 0);

    const balance = Number(totalFreight) + Number(totalAdditionalCharges) - Number(totalPayments);

    const invData = {
      balance,
      dueDate: new Date(formData.dueDate),
      date: new Date(formData.date),
      invoiceNo: invoices?.length || 1,
      route: { origin: route.origin, destination: route.destination },
      party_id: party,
      gst: formData.gst || 0,
      invoiceStatus: balance === 0 ? 'Paid' : 'Due',
      trips: paramtrips,
      advance: totalPayments,
      total: totalFreight + totalAdditionalCharges,
    };

    await saveInvoice(invData, invoiceId);
    toast({ description: 'Invoice saved successfully.' });

    // 6️⃣ Navigate after success
    setTimeout(() => router.push('/user/trips'), 500);

  } catch (error) {
    console.error("Error in handleDownload:", error);
    toast({
      description: 'Failed to download invoice.',
      variant: 'destructive',
    });
  } finally {
    setDownloading(false);
    // If you control PDF mode with state, reset it here
    // setIsPdfExport(false);
  }
};




  if (loading) {
    return <Loading />
  }

  if (!trips) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No Trips Found</h2>
          <Button onClick={() => router.push('/user/trips')}>Back to Trips</Button>
        </div>
      </div>
    )
  }

  return (
  <div className="h-screen flex flex-col">
    <ResizablePanelGroup
      direction="horizontal"
      className="flex-grow"
    >
      <ResizablePanel defaultSize={60} minSize={40}>
        <div className="h-full overflow-y-auto p-4 thin-scrollbar">
          <InvoiceForm
            trips={trips}
            formData={formData}
            setFormData={setFormData}
            setDeletedChargeIds={setDeletedChargeIds}
            setDeletedPaymentIds={setDeletedPaymentIds}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={40}
        minSize={20}
        maxSize={60}
        collapsible={true}
        collapsedSize={0}
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
      >
        <div className="h-full flex flex-col">
          <div className="flex-grow overflow-y-auto p-4 thin-scrollbar">
            <div>
              <FreightInvoice formData={formData} />
            </div>
          </div>
          <div className="p-4">
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading ? 'Downloading...' : 'Download Invoice'}
            </Button>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>

    {/* Only ONE modal block, not nested or duplicated */}
    <div className={`${!downloading ? 'hidden' : 'modal-class'}`}>
      <div className='z-50 fixed flex items-center justify-center modal-class text-white'>
        {loadingIndicator}
        <p>downloading pdf...</p>
      </div>
      <div
        style={{
          position: 'fixed',
          top: '-10000px',
          left: '-10000px',
        }}
        className="bg-white max-w-lg mx-auto"
        ref={invoiceRef}
      >
        <FreightInvoice formData={formData} isPdfExport={true} />
      </div>
    </div>
  </div>
  )
}

export default InvoiceGenerationPage

