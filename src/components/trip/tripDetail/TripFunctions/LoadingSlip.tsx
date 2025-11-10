'use client'
import { useToast } from '@/components/hooks/use-toast'
import { useExpenseData } from '@/components/hooks/useExpenseData'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ITrip } from '@/utils/interface'
import { formatNumber } from '@/utils/utilArray'
import { DialogTrigger } from '@radix-ui/react-dialog'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'


/**
 * Converts an image URL to a base64 Data URL for safe use in html2canvas or PDF export.
 * @param url - Image URL string
 * @returns Promise<string> - resolves to base64 Data URL string
 */
async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

type Props = {
    trip : ITrip | any,
    charges : number | undefined,
    haltingCharges : number | undefined
}
const LoadingSlip: React.FC<Props> = ({trip, charges,haltingCharges}) => {
    const {parties} = useExpenseData()
    const [user, setUser] = useState<any>()
    const { toast } = useToast()
    const slipRef = useRef<HTMLDivElement | null>(null)
    const [pdfDownloading, setPDFDownloading] = useState(false)
    const [isPdfExport, setIsPdfExport] = useState(false);
    const [base64Logo, setBase64Logo] = useState('');
    const [base64Signature, setBase64Signature] = useState('');
    useEffect(() => {
  if (isPdfExport && user?.logoUrl) {
    urlToBase64(user.logoUrl)
      .then(setBase64Logo)
      .catch(() => setBase64Logo(''));
  }
}, [isPdfExport, user?.logoUrl]);

useEffect(() => {
  if (isPdfExport && user?.signatureUrl) {
    urlToBase64(user.signatureUrl)
      .then(setBase64Signature)
      .catch(() => setBase64Signature(''));
  }
}, [isPdfExport, user?.signatureUrl]);



    const fetchUser = async () => {
        try {
            const res = await fetch('/api/users')
            const data = await res.json()
            setUser(data.user)
        } catch (error) {
            toast({
                description: "Failed to fetch user details",
                variant: "destructive"
            })
        }
    }

    const downloadPdf = async () => {
  if (!slipRef.current) {
    console.error('Element not found');
    return;
  }

  // 1. Set PDF export mode to true to trigger Base64 image conversion
  setIsPdfExport(true);

  // 2. Wait until base64Logo and base64Signature are loaded (max 5 seconds timeout)
  await new Promise<void>((resolve) => {
    const maxWaitTime = 5000; // 5 seconds
    let waited = 0;
    const interval = setInterval(() => {
      if (base64Logo && base64Signature) {
        clearInterval(interval);
        resolve();
      } else if (waited >= maxWaitTime) {
        // Timeout to prevent infinite wait
        clearInterval(interval);
        resolve();
      }
      waited += 100;
    }, 100);
  });

  setPDFDownloading(true);

  try {
    console.log('Capturing element as image...');
    const canvas = await html2canvas(slipRef.current, {
      scale: 2,
      logging: true,
      useCORS: true,
    });

    console.log('Canvas generated. Dimensions:', canvas.width, 'x', canvas.height);
    const imgData = canvas.toDataURL('image/jpeg');
    console.log('Image data URL length:', imgData.length);

    const padding = 10; // mm padding on all sides
    const imgWidth = canvas.width / 2;
    const imgHeight = canvas.height / 2;
    const pdfWidth = (imgWidth * 25.4) / 96 + padding * 2;
    const pdfHeight = (imgHeight * 25.4) / 96 + padding * 2;

    console.log('Calculated PDF dimensions:', pdfWidth, 'x', pdfHeight, 'mm');

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    });

    const imgX = padding;
    const imgY = padding;

    console.log('Adding image to PDF...');
    pdf.addImage(imgData, 'JPEG', imgX, imgY, pdfWidth - padding * 2, pdfHeight - padding * 2);

    console.log('Saving PDF...');
    pdf.save(`Loading Slip-${trip.LR}-${trip.truck}.pdf`);
  } catch (error) {
    toast({
      description: "Failed to generate PDF",
      variant: "destructive",
    });
  } finally {
    setPDFDownloading(false);

    // 4. Reset PDF export mode once done
    setIsPdfExport(false);
  }
};


    function numberToWordsIndian(num: number): string {
    if (num === 0) return "Zero";

    const units = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    const teens = [
        "eleven", "twelve", "thirteen", "fourteen", "fifteen",
        "sixteen", "seventeen", "eighteen", "nineteen"
    ];
    const tens = ["", "ten", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const scales = ["", "thousand", "lakh", "crore"];

    const getBelowThousand = (n: number): string => {
        let str = "";
        if (n > 99) {
            str += units[Math.floor(n / 100)] + " hundred ";
            n %= 100;
        }
        if (n >= 11 && n <= 19) {
            str += teens[n - 11] + " ";
        } else {
            if (n >= 10) {
                str += tens[Math.floor(n / 10)] + " ";
                n %= 10;
            }
            if (n > 0) {
                str += units[n] + " ";
            }
        }
        return str.trim();
    };

    const parts: string[] = [];
    let scaleIndex = 0;

    while (num > 0) {
        const divisor = scaleIndex === 0 ? 1000 : 100;
        const part = num % divisor;

        if (part > 0) {
            const scale = scales[scaleIndex];
            parts.unshift(getBelowThousand(part) + (scale ? " " + scale : ""));
        }

        num = Math.floor(num / divisor);
        scaleIndex++;
    }

    // Capitalize first letter of each word
    const result = parts.join(" ").trim();
    return result.replace(/\b\w/g, (c) => c.toUpperCase());
}



    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <Dialog>
            <DialogTrigger><Button className='w-full'>Loading Slip</Button></DialogTrigger>
            <DialogContent className='max-w-4xl p-8 h-[95vh] overflow-y-auto thin-scrollbar'>
                <div ref={slipRef} className="max-3-4xl w-full mx-auto p-4 border-2 border-black">
                    <div className="text-center spacing-large relative">
    <div className="absolute top-0 right-0 text-right">
        <p className="text-sm m-0">
            <i className="fas fa-phone-alt"></i>
            📞{user?.phone}
        </p>
        <p className="text-sm m-0">
            <i className="fas fa-phone-alt"></i>
            📞{user?.altPhone}
        </p>
    </div>

    <h2 className="text-blue-500">Loading Slip</h2>

    <div className="flex items-center spacing-large relative">
        <div className="absolute left-4">
  {isPdfExport ? (
    base64Logo ? (
      <img src={base64Logo} alt="logo" width={80} height={80} style={{ objectFit: 'contain' }} />
    ) : (
      <div style={{ width: 80, height: 80, backgroundColor: '#ccc' }} />
    )
  ) : (
    <Image src={user?.logoUrl || ''} alt="logo" width={80} height={80} />
  )}
</div>

        <div className="flex-grow text-center">
            <h1 className="text-4xl font-bold">{user?.company}</h1>
        </div>
    </div>
    <div className="text-sm mt-2 spacing-large">
        <p>{user?.address}, {user?.city}, {user?.pincode}</p>
        <p>{user?.email}</p>
    </div>
</div>




                    <div className="spacing-large bg-blue-500 bg-opacity-45 p-2 mt-2">
                        <div className="flex justify-between">
                            <p>No: {trip?.LR || 'N/A'}</p>
                            <p>Date: {new Date(trip?.startDate).toLocaleDateString('en-IN')}</p>
                        </div>
                    </div>
                    <div className="spacing-large mt-2">
                        <p>Party/Customer: <strong>{parties.length > 0 ? parties?.find(party=>party.party_id === trip.party)?.name || '' : ''}</strong> </p>
                        <p>As per discussion with {trip?.partyName}</p>
                        <p>We are sending</p>
                    </div>
                    <div className="spacing-large mt-2">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-500 bg-opacity-45">
                                    <th className="p-2 text-center border">Vehicle No.</th>
                                    <th className="p-2 text-center border">Load</th>
                                    <th className="p-2 text-center border">From</th>
                                    <th className="p-2 text-center border">To</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-2 text-center border">{trip?.truck}</td>
                                    <td className="p-2 text-center border">{trip.material && trip?.material?.map((item : {name : string, weight : string})=>item.name + ',')}</td>
                                    <td className="p-2 text-center border">{trip?.route?.origin}</td>
                                    <td className="p-2 text-center border">{trip?.route?.destination}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="spacing-large grid grid-cols-2 gap-8 mt-2">
                        <div>
                            <div className="flex justify-between">
                                <p>Length:</p>
                                <p>{trip?.loadingSlipDetails?.length || '-'}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Width:</p>
                                <p>{trip?.loadingSlipDetails?.width || '-'}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Height:</p>
                                <p>{trip?.loadingSlipDetails?.height || '-'}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Rate:</p>
                                <p>{trip?.rate} {trip?.billingType}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Halting Charges:</p>
                                <p>₹{haltingCharges || 0}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Total Freight:</p>
                                <p>₹{formatNumber(trip?.amount) || 0}</p>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <p>Other Charges:</p>
                                <p>₹{charges || 0}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Advance:</p>
                                <p>₹{formatNumber(trip?.loadingSlipDetails?.advance) || 0}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Balance Amount:</p>
                                <p>₹{formatNumber(trip?.loadingSlipDetails?.balance || trip?.balance || 0)}</p>
                            </div>

                            <div className="flex justify-between">
                                <p>Min Guaranteed Weight(M.T.):</p>
                                <p>{trip?.guaranteedWeight}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Maximum Weight(M.T.):</p>
                                <p></p>
                            </div>
                        </div>
                    </div>
                    <div className="spacing-large mt-2">
                        <div className="border border-black p-2 h-16">
                            <p><strong>Amount in Words:</strong> {numberToWordsIndian(trip?.amount)} Rupees Only</p>
                        </div>
                    </div>
                    <div className="mt-16 flex justify-between items-start">
                        <div className="max-w-md">
  <div className="space-y-2">
    <div className="grid grid-cols-[10rem,1fr] gap-x-8"> {/* 10rem ≈ 160px */}
      <p className="font-medium">PAN No.:</p>
      <p>{user?.panNumber}</p>

      <p className="font-medium">GST No.:</p>
      <p>{user?.gstNumber}</p>

      <p className="font-medium">MSME No.:</p>
      <p>{user?.bankDetails?.msmeNo}</p>

      <p className="font-medium">Account No.:</p>
      <p>{user?.bankDetails?.accountNo}</p>

      <p className="font-medium">Bank Name:</p>
      <p>{user?.bankDetails?.bankName}</p>

      <p className="font-medium">Branch:</p>
      <p>{user?.bankDetails?.bankBranch}</p>

      <p className="font-medium">IFSC Code:</p>
      <p>{user?.bankDetails?.ifscCode}</p>
    </div>
  </div>
</div>

                        <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  }}
>
  <p style={{ margin: 0, textAlign: "center" }}>For <strong>{user?.company}</strong></p>
  {isPdfExport ? (
  base64Signature ? (
    <img src={base64Signature} alt="signature" width={80} height={80} style={{ display: 'block' }} />
  ) : (
    <div style={{ width: 80, height: 80, backgroundColor: '#ccc' }} />
  )
) : (
  user?.signatureUrl && (
    <Image src={user.signatureUrl} alt="Signature" width={80} height={80} style={{ display: 'block' }} />
  )
)}

  <p style={{ margin: 0, textAlign: "center" }}>Thank You</p>
</div>

                    </div>
                    <div className="text-center text-xs mt-4 py-4">
                        <p className="flex items-center justify-center">
                            Powered by
                            <Image
                                src="data:image/png;base64,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"
                                alt="Awajahi logo"
                                width={20}
                                height={20}
                                className="mx-1"
                            />
                            Awajahi
                        </p>
                    </div>
                </div>
                <div className='flex justify-end'>
                    <Button onClick={() => downloadPdf()} disabled={pdfDownloading}>{pdfDownloading ? <Loader2 className='text-white animate-spin' /> : 'Download PDF'}</Button>
                </div>
                
            </DialogContent>
        </Dialog>
        
    )
}

export default LoadingSlip

