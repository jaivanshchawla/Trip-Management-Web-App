import React, { useState, useEffect } from "react";
import Image from "next/image";
import { InvoiceFormData as FormData } from "@/utils/interface";
import { formatNumber } from "@/utils/utilArray";
import { useMemo } from "react";


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

const FreightInvoice: React.FC<{ formData: FormData; isPdfExport?: boolean }> = ({ formData, isPdfExport = false }) => {
  const [base64Logo, setBase64Logo] = useState('');
  const [base64Signature, setBase64Signature] = useState('');
  const [base64Stamp, setBase64Stamp] = useState('');
    // const {trip} = useTrip()

    useEffect(() => {
  if (isPdfExport && formData.logoUrl) {
    urlToBase64(formData.logoUrl)
      .then(setBase64Logo)
      .catch(() => setBase64Logo(''));
  }
}, [isPdfExport, formData.logoUrl]);

useEffect(() => {
  if (isPdfExport && formData.signatureUrl) {
    urlToBase64(formData.signatureUrl)
      .then(setBase64Signature)
      .catch(() => setBase64Signature(''));
  }
}, [isPdfExport, formData.signatureUrl]);

useEffect(() => {
  if (isPdfExport && formData.stampUrl) {
    urlToBase64(formData.stampUrl)
      .then(setBase64Stamp)
      .catch(() => setBase64Stamp(''));
  }
}, [isPdfExport, formData.stampUrl]);

    function formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    const totalAmount = formData.freightCharges.reduce(
        (total, charge) => {
            const amount = parseFloat(charge.amount as any); // Safely convert to a number
            return total + (isNaN(amount) ? 0 : amount); // Add only valid numbers
        },
        0
    ) + formData.additionalCharges.reduce((total, charge)=>total + Number(charge.amount),0) + formData.extraAdditionalCharges.reduce((total,charge)=>total + Number(charge.amount),0);

    const totalBalance = useMemo(() => {
        // Combine paymentDetails and extraPaymentDetails into a single array
        const allPayments = [
            ...(formData.paymentDetails || []),
            ...(formData.extraPaymentDetails || []),
        ];

        // Calculate the total payment amount
        const paymentTotal = allPayments.reduce((total, charge) => {
            const amount = parseFloat(charge.amount as any); // Safely convert to a number
            return total + (isNaN(amount) ? 0 : amount); // Add only valid numbers
        }, 0);

        // Return the total balance
        return totalAmount - paymentTotal;
    }, [formData, totalAmount]);



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


    return (
        <div className="w-full mx-auto my-2 border border-black relative font-sans text-[8px] pb-4">
            <div className="text-center mb-2">FREIGHT INVOICE</div>
            <div className="flex items-center justify-between w-full px-6 mb-2">
  {/* Logo on the left */}
  <div className="flex-shrink-0">
    {formData.logoUrl ? (
  isPdfExport ? (
    base64Logo ? (
      <img src={base64Logo} alt="Company Logo" width={45} height={45} className="object-contain" />
    ) : (
      <div style={{ width: 45, height: 45, backgroundColor: '#ccc' }} />
    )
  ) : (
    <Image src={formData.logoUrl} alt="Company Logo" width={45} height={45} className="object-contain" />
  )
) : null}
  </div>

  {/* Company Info centered */}
  <div className="flex-1 text-center">
    <h2 className="text-sm font-semibold text-gray-800">{formData.companyName}</h2>
    <p className="text-xs font-normal uppercase text-gray-700">
      Fleet Owners and Transport Contractors
    </p>
  </div>

  {/* Optional empty div to balance out the flex layout */}
  <div className="w-[45px]" />
</div>


            <div className="text-center mb-1">{formData.address}</div>
            <div className="absolute right-1 top-1">
                <div>📞{formData.phone}</div>
                <div>📞{formData.altPhone}</div>
            </div>
            <table className="w-full border-collapse text-[6px]">
                <tbody>
                    <tr>
                        <td colSpan={3} className="text-center font-bold border border-l-0 border-black p-1">Bill No. {formData.billNo}</td>
                        <td className="border border-black p-1">Branch: {formData.branch}</td>
                        <td className="border border-r-0 border-black p-1">Date: {new Date(formData.date).toLocaleDateString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td colSpan={1} className="font-bold border border-l-0 border-black p-1">CONSIGNMENT<br />No. </td>
                        <td colSpan={1} className="font-bold border border-black p-1"> Start Date</td>
                        <td className="font-bold border border-black p-1">PARTICULARS</td>
                        <td colSpan={1} className="border border-black p-1">From: {formData.to}</td>
                        <td colSpan={1} className="border border-r-0 border-black p-1">To: {formData.from}</td>
                    </tr>
                    <tr>
                        <td className="border border-l-0 border-black p-1">{formData.freightCharges.map((charge, index)=><span key={index}>{charge.lrNo}{index === formData.freightCharges.length -1 ? '' : ', '}</span>)}</td>
                        <td className="border border-black p-1">
  {formData.dueDate
    ? new Date(formData.dueDate).toLocaleDateString("en-GB") // dd/mm/yyyy
    : ""}
</td>

                        <td className="border border-black p-1">{formData.particulars}</td>
                        <td colSpan={2} className="border border-r-0 border-black p-1">
                            <div>Party: {formData.party}</div>
                            <div>GSTIN: {formData.partygst }</div>
                            <div>{formData.partyAddress}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <h2 className=" text-center text-xs font-bold p-2 mt-2 mb-1" style={ {background : formData.color}}>Freight Charges</h2>
            <table className="w-full border-collapse text-[6px]">
                <thead>
                    <tr className="">
                        <td className="font-bold text-center border border-black p-2">S.N</td>
                        <td className="font-bold text-center border border-black p-2">Lorry No.</td>
                        <td className="font-bold text-center border border-black p-2" colSpan={2}>Particulars</td>
                        <td className="font-bold text-center border border-black p-2">Weight (MT)</td>
                        <td className="font-bold text-center border border-black p-2">Charged (MT)</td>
                        <td className="font-bold text-center border border-black p-2">Rate (PMT)</td>
                        <td className="font-bold text-center border border-black p-2">Amount</td>
                    </tr>
                </thead>
                <tbody>
                    {formData.freightCharges.map((charge, index) => (
                        <tr key={index}>
                            <td className="border border-black p-2">{index + 1}</td>
                            <td className="border border-black p-2">{charge.truckNo}</td>
                            <td colSpan={2} className="border border-black p-2">{charge.material?.map((item,i)=>item + (i === charge.material.length - 1 ? '' : ', ')) || ''}</td>
                            <td className="border border-black p-2">{charge.weight}</td>
                            <td className="border border-black p-2">{charge.charged}</td>
                            <td className="border border-black p-2">{formData.rate}{formData.billingtype}{charge.rate}</td>
                            <td className="border border-black p-2">{formatNumber(charge.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {(formData.additionalCharges.length !== 0 || formData.extraAdditionalCharges.length !== 0) &&
                <>
                    <h2 className="text-center text-xs font-bold p-2 mt-4 mb-2" style={{background : formData.color}}>Additional Charges</h2>

                    <table className="w-full ">
                        <thead>
                            <tr className="">
                                <td className="font-bold text-center border border-black p-2">S.N</td>
                                <td className="font-bold text-center border border-black p-2">Lorry No.</td>
                                <td className="font-bold text-center border border-black p-2">Particulars</td>
                                <td className="font-bold text-center border border-black p-2">Remarks</td>
                                <td className="font-bold text-center border border-black p-2">Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.additionalCharges.map((charge, index) => (
                                <tr key={index}>
                                    <td className="border border-black p-2">{index + 1}</td>
                                    <td className="border border-black p-2">{charge.truckNo}</td>
                                    <td className="border border-black p-2">{charge.expenseType}</td>
                                    <td className="border border-black p-2">{charge.notes}</td>
                                    <td className="border border-black p-2">{formatNumber(charge.amount)}</td>
                                </tr>
                            ))}
                            {formData.extraAdditionalCharges.map((charge, index) => (
                                <tr key={index}>
                                    <td className="border border-black p-2">{index + 1}</td>
                                    <td className="border border-black p-2">{charge.truckNo}</td>
                                    <td className="border border-black p-2">{charge.expenseType}</td>
                                    <td className="border border-black p-2">{charge.notes}</td>
                                    <td className="border border-black p-2">{formatNumber(charge.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table></>}

            <table className="w-full border-collapse border-t border-black">
                <tbody>
                    <tr className="p-0">
                        <td className="border-r border-black p-2">
                            <div>UDYAM/MSME No. {formData.partyDetails.msmeNo}</div>
                            <div>GSTIN {formData.partyDetails.gstin}</div>
                        </td>
                        <td className="font-bold text-center p-2">TOTAL</td>
                        <td className="font-bold text-right p-2 pr-2.5">{formatNumber(totalAmount)}</td>
                    </tr>
                    <tr className="p-0">
                        <td className="border-r border-black p-2">
                            <div>PAN No {formData.partyDetails.pan}</div>
                            <div>Bank Acc No {formData.partyDetails.accNo}</div>
                        </td>
                        <td className="font-bold text-center p-2">ADVANCE</td>
                        <td className="font-bold text-right p-2 pr-2.5">{formatNumber(totalAmount - totalBalance)}</td>
                    </tr>
                    <tr className="p-0">
                        <td className="border-r border-black p-2">
                        </td>
                        <td className="font-bold text-center p-2">
  {(formData.gstType ? formData.gstType : "GST")} ({formData.gst}%)
</td>

                        <td className="font-bold text-right p-2 pr-2.5">{formatNumber((totalBalance * (formData?.gst ?? 0)) / 100)}</td>
                    </tr>
                    <tr className="p-0">
                        <td className="border-r border-black p-2">
                            <div>IFSC Code {formData.partyDetails.ifscCode}</div>
                            <div>Bank Name {formData.partyDetails.bankName}</div>
                            <div>Branch Name {formData.partyDetails.bankBranch}</div>
                        </td>
                        <td className="font-bold text-center p-2">BALANCE</td>
                        <td className="font-bold text-right p-2 pr-2.5">{formatNumber(!formData.gst ? totalBalance :  totalBalance + (totalBalance * formData.gst)/100)}</td>
                    </tr>
                    
                    <tr>
                        <td colSpan={3} className="text-center font-bold text-xs p-2.5 border-t border-b border-black">
                            Total amount in words :- {numberToWordsIndian(!formData.gst ? totalBalance :  totalBalance + (totalBalance * formData.gst)/100)} Rupees Only
                        </td>
                    </tr>
                </tbody>
            </table>

            {(formData.paymentDetails.length !== 0 || formData.extraPaymentDetails.length !== 0) && <>
                <h2 className="text-center text-sm font-bold p-1 mt-4 mb-2" style={{background : formData.color}}>Received Payment Details</h2>

                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-black">
                            <td className="font-bold text-center border border-black p-2">S.N</td>
                            <td className="font-bold text-center border border-black p-2">Date</td>
                            <td className="font-bold text-center border border-black p-2">Payment Mode</td>
                            <td className="font-bold text-center border border-black p-2">Notes</td>
                            <td className="font-bold text-center border border-black p-2">Amount (-)</td>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.paymentDetails.map((payment, index) => (
                            <tr key={index}>
                                <td className="border border-black p-2">{index + 1}</td>
                                <td className="border border-black p-2">{new Date(payment.date).toLocaleDateString('en-IN')}</td>
                                <td className="border border-black p-2">{payment.paymentType}</td>
                                <td className="border border-black p-2">{payment.notes}</td>
                                <td className="border border-black p-2">{formatNumber(payment.amount)}</td>
                            </tr>
                        ))}
                        {formData.extraPaymentDetails.map((payment, index) => (
                            <tr key={index}>
                                <td className="border border-black p-2">{index + 1}</td>
                                <td className="border border-black p-2">{new Date(payment.date).toLocaleDateString('en-IN')}</td>
                                <td className="border border-black p-2">{payment.paymentType}</td>
                                <td className="border border-black p-2">{payment.notes}</td>
                                <td className="border border-black p-2">{formatNumber(payment.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table></>}

            <div className="mt-4 text-sm">For, <strong>{formData.companyName}</strong></div>

<div className="flex items-center justify-evenly text-xs mt-2">
  {/* Logo / Checked by
  <div className="flex flex-col items-center text-center">
    <div className="w-[60px] h-[60px] flex justify-center items-center">
      {formData.logoUrl ? (
        <Image
          src={formData.logoUrl}
          alt="Logo"
          width={50}
          height={50}
          className="object-contain"
        />
      ) : (
        <div className="w-full h-full bg-gray-200" />
      )}
    </div>
    <p className="mt-1">Checked by</p>
  </div> */}

  {/* Signature / Bill Incharge */}
  <div className="flex flex-col items-center text-center">
    <div className="w-[70px] h-[70px] flex justify-center items-center">
      {formData.signatureUrl ? (
  isPdfExport ? (
    base64Signature ? (
      <img src={base64Signature} alt="Signature" width={70} height={70} className="object-contain" />
    ) : (
      <div style={{ width: 70, height: 70, backgroundColor: '#ccc' }} />
    )
  ) : (
    <Image src={formData.signatureUrl} alt="Signature" width={70} height={70} className="object-contain" />
  )
) : null}

    </div>
    <p className="mt-1">Bill Incharge</p>
  </div>

  {/* Stamp / Verified Stamp */}
  <div className="flex flex-col items-center text-center">
    <div className="w-[70px] h-[70px] flex justify-center items-center">
      {formData.stampUrl ? (
  isPdfExport ? (
    base64Stamp ? (
      <img src={base64Stamp} alt="Verified Stamp" width={70} height={70} className="object-contain" />
    ) : (
      <div style={{ width: 70, height: 70, backgroundColor: '#ccc' }} />
    )
  ) : (
    <Image src={formData.stampUrl} alt="Verified Stamp" width={70} height={70} className="object-contain" />
  )
) : null}

    </div>
    <p className="mt-1">Verified Stamp</p>
  </div>
</div>




            <div className="text-xs font-bold mt-2">
                NOTE:
                <span className="font-normal text-xs">
                    We are not liable to accept or pay GST as Goods Transport Agency
                    (GTA) fall under Reverse Charge Mechanism (RCM).
                </span>
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
    );
};

export default FreightInvoice