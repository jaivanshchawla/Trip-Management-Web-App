import Image from "next/image";
import { useState, useEffect } from "react";
import { getBestLogoColor } from "./imgColor";
import { Card } from "@/components/ui/card";
import { formatNumber } from "./utilArray";
import { EWBFormDataType, FMDataType, PaymentBook } from "./interface";

// ============= ADD THIS FUNCTION BELOW =============
/**
 * Converts an image URL to a base64 Data URL for safe use in html2canvas or PDF export.
 * @param {string} url - The image URL.
 * @returns {Promise<string>} - A promise that resolves to the base64 Data URL.
 */
async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ============= END OF INSERT =============

function CompanyHeader({ formData }: { formData: { logo: string; companyName: string } }) {
  const [dominantColor, setDominantColor] = useState("black");

  useEffect(() => {
    async function fetchDominantColor() {
      try {
        const color = await getBestLogoColor(formData.logo);
        setDominantColor(color);
      } catch (error) {
        console.error("Failed to fetch dominant color:", error);
        setDominantColor("black"); // Fallback color
      }
    }

    if (formData.logo) {
      fetchDominantColor();
    }
  }, [formData.logo]);

  return (
    <h1
      className={`text-3xl font-bold`}
      style={{ color: dominantColor }}
    >
      {formData.companyName}
    </h1>
  );
}


export function Bilty({
  formData,
  color,
  selectedCopy,
  isPdfExport = false  // new optional prop with default false
}: {
  formData: EWBFormDataType;
  color: string;
  selectedCopy: string;
  isPdfExport?: boolean;  // add this line
}) {

  const [base64Logo, setBase64Logo] = useState('');
  const [base64Signature, setBase64Signature] = useState('');

  useEffect(() => {
    if (isPdfExport && formData.logo) {
      urlToBase64(formData.logo)
        .then(setBase64Logo)
        .catch(() => setBase64Logo(""));
    }
  }, [isPdfExport, formData.logo]);

  useEffect(() => {
    if (isPdfExport && formData.signature) {
      urlToBase64(formData.signature)
        .then(setBase64Signature)
        .catch(() => setBase64Signature(""));
    }
  }, [isPdfExport, formData.signature]);

  return (
    <div className={`border-2 border-black  w-full h-auto ${color} relative max-w-7xl`}>
      <section className="px-6 py-2 w-full">
        <div className="flex items-center gap-8 justify-center">
          <div className="flex justify-center">
            {formData.logo ? (
  isPdfExport ? (
    <img
      src={base64Logo}
      alt="Company Logo"
      width={80}
      height={80}
      style={{ objectFit: "contain", display: "block" }}
    />
  ) : (
    <Image src={formData.logo} alt="Company Logo" width={80} height={80} />
  )
) : null}



          </div>
          <div className="text-center py-2 border-b border-black">
            <CompanyHeader formData={formData} />
            <h2 className="text-xl font-normal text-gray-700">FLEET OWNERS & TRANSPORT CONTRACTOR</h2>
            <span className=" text-gray-600 whitespace-nowrap">
              {formData.address}, {formData.city}, {formData.pincode}
            </span>
          </div>

          <div className="text-right text-gray-700 absolute top-2 right-2">
            <div className="flex items-center gap-1">
              <div>
                {/* <Image src="https://img.icons8.com/ios-filled/50/000000/phone.png" alt="Phone Icon"
                  height={20} width={20} /> */}
              </div>
              <div>
                <p className="text-xs">📞{formData.contactNumber}</p>
                <p className="text-xs">📞{formData.altPhone || ""}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="grid grid-cols-4 gap-6 mt-8">
        <div className="col-span-3">
          <section className="">
            <div className="grid grid-cols-3 gap-2">
              <div className=" col-span-1 border-y-2 border-r-2 border-black">
                <p className="text-xs font-semibold text-black text-left mb-2 whitespace-nowrap p-2 border-b-2 border-black ">SCHEDULE OF
                  DEMURRAGE</p>
                <p className="text-xs text-black whitespace-nowrap pl-1">Demurrage chargebl after…………… days</p>
                <p className="text-xs text-black whitespace-nowrap pl-1">from today@RS…….……… perday per Qtl.</p>
                <p className="text-xs text-black whitespace-nowrap pl-1"> On weight charged</p>
              </div >
              <div className="flex flex-col ">
                <span
                  className=" font-semibold text-center p-2 border-b-2 border-black text-[#FF0000] whitespace-nowrap ">{selectedCopy.toUpperCase() + " COPY"}</span>
                <span
                  className=" font-normal text-center p-2 border-b-2 border-black text-black whitespace-nowrap">AT
                  CARRIERS RISK</span>
                <span
                  className="text-black  font-semibold text-center p-2 whitespace-nowrap">INSURANCE</span>
              </div>
              <div className="flex-col w-full col-span-1">
                <div className="border-2 p-2 border-black ">
                  <p className="text-sm text-black text-center font-semibold">Caution</p>
                  <p className="text-xs text-black" style={{ fontSize: "10px" }}>This Consignment will not be
                    detaineddiverted. rerouted or rebooked
                    withoutConsignee Bank&apos;s written permission.Will be delivered at the destination</p>
                </div>

                <div className="py-1 text-black border-b border-black">
                  <span className="text-xs font-semibold ">Address of Delivery Office :</span>
                </div>
                <div className="flex gap-24 text-xs font-semibold">
                  <p>State :</p>
                  <p>Tel : {formData.consignee.contactNumber}</p>
                </div>
              </div>
            </div>
          </section>

          <section className=" mt-4">
            <div className="grid grid-cols-9 gap-2 items-end">
              <div className="border-2 border-[#FF0000] text-[#FF0000] p-2 border-l-0 col-span-3 h-auto pb-2">
                <h3 className="text-xs text-[#FF0000] text-center">NOTICE</h3>
                <p className=" text-[10px]">The consignment covered by this Lorry ceipt shall be stored
                  at the destination Under the control of the Transport Operator
                  and shall be delivered to or to the order of the Consignee
                  Bank whose name is mentioned in the Lorry Receipt. It will
                  under no circumstances be delivered to anyone without the
                  written authority from the Consignee banker or its order.
                  endorsed on the Consignee copy</p>
              </div>
              <div className="col-span-3 border-2 border-black p-2 text-xs text-black h-auto">
                <p>The Customer has stated that:</p>
                <p>He has insured the consignment Company ………………</p>
                <p>Policy No. ……… Date ……</p>
                <p>Amount …………… Date ………</p>
              </div>
              <div className="col-span-3 text-xs text-black p-2 border-2 border-black flex flex-col gap-1 h-auto pb-2">
                <span className="text-xs">CONSIGNMENT NOTE</span>
                <span>No. : <span className='text-red-600 font-semibold'>{formData.LR}</span></span>
                <span>Date : <span className='text-red-600 font-semibold'>{new Date(formData.date).toLocaleDateString('en-IN')}</span></span>
              </div>




            </div>
          </section>

          <section className="mt-4">
            <div className="grid grid-cols-9 gap-2 items-start">

              <div className="col-span-6 font-semibold text-black border-t-2 border-black h-auto text-sm">
                <div className="border-b-2 border-r-2 border-black px-2 pb-6 flex gap-2 items-center">
                  <p>Consigner Name and Address :</p>
                  <p className="text-red-600">{formData.consigner.name + " " + formData.consigner.address + ', ' + formData.consigner.city + ', ' + formData.consigner.pincode}</p>
                </div>
                <div className="border-b-2 border-r-2 border-black px-2 pb-6 flex gap-2 items-center">
                  <p>Consignee Name and Address :</p>
                  <p className="text-red-600">{formData.consignee.name + " " + formData.consignee.address + ', ' + formData.consignee.city + ', ' + formData.consignee.pincode}</p>
                </div>
              </div>


              <div className="col-span-3 text-xs text-black h-auto">
                <div className="space-y-1">
                  <p className="border-2 border-black p-2 text-red-600 flex items-center">
                    <span className="text-black mr-1">From:</span>{formData.from}
                  </p>
                  <p className="border-2 border-black p-2 text-red-600 flex items-center">
                    <span className="text-black mr-1">To:</span>{formData.to}
                  </p>
                </div>
              </div>
            </div>
          </section>


          <section className=" mt-2">
            <table className="table-fixed w-full text-xs border border-black border-collapse">
              <thead className="font-semibold text-center">
                <tr>
                  <th className="border border-black p-2" rowSpan={2}>Packages</th>
                  <th className="border border-black p-2" rowSpan={2}>Description (said to contain)</th>
                  <th className="border border-black p-0" colSpan={2}>
                    <p className="p-2">Weight (MT)</p>
                    <div className="grid grid-cols-2 border-t border-black">
                      <div className="border-r border-black p-2">Actual</div>
                      <div className="border-l border-black p-2">Charged</div>
                    </div>
                  </th>
                  <th className="border border-black p-2" rowSpan={2}>Rate</th>
                  <th className="border border-black p-2" rowSpan={2}>Amount to pay/paid</th>
                </tr>
              </thead>

              <tbody className="text-center text-red-600 font-semibold">
                {formData.materials.map((item, index: number) => (
                  <tr key={index}>
                    <td className="border border-black p-2">{index + 1}</td>
                    <td className="border border-black p-2">{item.name}</td>
                    <td className="border border-black p-2">{item.weight} {['fixed', 'ftl'].includes(item.weight.toLowerCase()) ? "" : "MT"}</td>

                    {index === 0 && <>
                      <td className="border border-black p-2" rowSpan={formData.materials.length}>
                        <div className="h-full flex items-center justify-center">
                          {formData.grtdWeight} {['fixed', 'ftl'].includes(formData.grtdWeight.toString().toLowerCase()) ? "" : "MT"}
                        </div>
                      </td>
                      <td className="border border-black p-2" rowSpan={formData.materials.length}>
                        <div className='flex flex-col gap-3 text-black text-left'>
                          <p>Mazdoor</p>
                          <p>Hire Charges</p>
                          <p>Sur. Ch.</p>
                          <p>St. Ch.</p>
                          <p>Risk Ch.</p>
                          <p className='mt-2 text-xs'>TOTAL</p>
                        </div>
                      </td>
                      <td className="border border-black p-2" rowSpan={formData.materials.length}>
                        <div className='flex flex-col justify-between h-full'>
                          <div className='flex font-semibold gap-4 flex-col items-center py-3 justify-between'>
                            <p>TO</p>
                            <p>BE</p>
                            <p>BILLED</p>
                          </div>
                          <div className='border-t border-black h-1'></div>
                        </div>
                      </td>
                    </>}

                  </tr>
                ))}
              </tbody>
            </table>



          </section>

        </div>
        <div className="col-span-1 border-2 border-black border-r-0">
          <div className="text-[11px] border-b-2 border-black">
            <div className="border-b-2 p-2 border-black flex flex-col">
              <span>Address of Issuing Office : </span>
              <span>Name and Address of Agent : <span className='text-red-600 font-semibold'>{formData.companyName}</span></span>
            </div>
            <div className="flex items-center justify-center text-center p-16 text-3xl font-semibold text-red-600">{formData.city}</div>
          </div>
          <div className="border-b-2 border-black">
            <div className="border-b-2 border-black p-2">
              <p className="text-xs text-black">SERVICE TAX TO BE PAID BY</p>
            </div>
            <div className="grid grid-cols-3 text-[10px] h-[25px]">
              <div className="flex items-center justify-center border-r-2 border-black p-2 overflow-hidden">
                CONSIGNER
              </div>
              <div className="flex items-center justify-center border-r-2 border-black p-2 overflow-hidden">
                CONSIGNEE
              </div>
              <div className="flex items-center justify-center p-2 overflow-hidden">
                SIGNATORY
              </div>
            </div>
          </div>

          <div className="border-b-2 border-black text-xs flex flex-col gap-4 h-auto">
            <h3 className="text-black text-center">Service Tax Reg No.</h3>
            <div>
              <p className="mt-4 text-black p-1 ">GST No. {formData.gstNumber}</p>
              <p className=" text-black mb-2 p-1 ">PAN No. {formData.pan}</p>
            </div>

          </div>
          <div className=" text-black text-sm font-semibold flex flex-col justify-evenly gap-6 p-2">
            <span className="underline text-black">Private Mark</span>
            <div className="flex flex-col gap-2">
              <span>
                ST No :
              </span>
              <span>
                CST No :
              </span>
              <span>
                DO No. :
              </span>
              <span>
                INV No. : <span className='text-red-600'>{formData.invoiceNo}</span>
              </span>
            </div>
            <span>
              Date : <span className='text-red-600'>{new Date(formData.date).toLocaleDateString('en-IN')}</span>
            </span>
            <span>
              Lorry No. : <span className='text-red-600'>{formData.truckNo}</span>
            </span>
          </div>

        </div>
        <div className="text-sm p-2 pt-0 flex items-center justify-between w-full">
  <div className="flex items-center gap-4 whitespace-nowrap">
    <span className="text-black">
      Value: <span className="text-red-600 font-semibold">{formData.value || "As Per Invoice"}</span>
    </span>
    <span className="text-black">Signature of Transport Operator:</span>
  </div>

  {formData.signature ? (
  isPdfExport ? (
    <img
      src={base64Signature}
      alt="user signature"
      width={60}
      height={60}
      style={{ objectFit: "contain", display: "block" }}
    />
  ) : (
    <Image src={formData.signature} alt="user signature" width={60} height={60} />
  )
) : null}

</div>

      </div>
<div className="text-center text-xs mt-4 py-4">
  <p className="flex items-center justify-center">
    <span>Powered to</span>
    <span style={{ display: 'inline-block', margin: '0 0.25rem', verticalAlign: 'middle' }}>
      {isPdfExport ? (
        <img
          src="data:image/png;base64,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"
        alt="Awajahi logo"
        width={20}
        height={20}
        style={{
          verticalAlign: 'middle',
          display: 'inline-block',
          margin: '0 4px',
        }}
      />
    ) : (
      <Image
        src="data:image/png;base64,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"
        alt="Awajahi logo"
        width={20}
        height={20}
        style={{
          verticalAlign: 'middle',
          display: 'inline-block',
          margin: '0 4px',
        }}
      />
    )}
    </span>
    <span>Awajahi</span>
  </p>
</div>



    </div>


  )
}

export function FMemo({
  formData,
  payments = [],
  isPdfExport = false, // Add this optional prop
}: {
  formData: FMDataType;
  payments?: PaymentBook[];
  isPdfExport?: boolean;
}) {
  // State to hold base64 versions of logo and signature for PDF export
  const [base64Logo, setBase64Logo] = useState('');
  const [base64Signature, setBase64Signature] = useState('');

  // Convert logo URL to base64 when exporting to PDF and when formData.logo changes
  useEffect(() => {
    if (isPdfExport && formData.logo) {
      urlToBase64(formData.logo)
        .then(setBase64Logo)
        .catch(() => setBase64Logo(''));
    }
  }, [isPdfExport, formData.logo]);

  // Convert signature URL to base64 under the same conditions
  useEffect(() => {
    if (isPdfExport && formData.signature) {
      urlToBase64(formData.signature)
        .then(setBase64Signature)
        .catch(() => setBase64Signature(''));
    }
  }, [isPdfExport, formData.signature]);

  const netBalance =
    Number(formData.totalFreight) -
    Number(formData.advance) -
    Number(formData.commision) -
    Number(formData.hamali) -
    Number(formData.cashAC) -
    Number(formData.extra) -
    Number(formData.TDS) -
    Number(formData.tire) -
    Number(formData.spareParts);

  // Prefer supplier, else user, else blank
  const displayedVehicleOwner =
    (formData.supplierName && formData.supplierName.trim()) ||
    (formData.userName && formData.userName.trim()) ||
    '';

  return (
    <Card className="relative max-w-[800px] mx-auto font-sans text-sm shadow-md bg-white p-0">
      <div className="border border-black border-b-0 p-2">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-lg font-semibold uppercase text-center border-b-2 border-gray-500 pb-1">
            Challan / Freight Memo
          </h1>
          <div className="text-right text-xs">
            <p>📞 {formData.contactNumber}</p>
            <p>📞 {formData.altPhone || ''}</p>
          </div>
        </div>

        <div className="text-center mb-5">
          <div className="flex items-center justify-center">
            {formData.logo ? (
              isPdfExport ? (
                <img
                  src={base64Logo}
                  alt="Company Logo"
                  width={80}
                  height={80}
                  style={{ objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <Image src={formData.logo} alt="Company Logo" width={80} height={80} />
              )
            ) : null}

            <div className="ml-4">
              <h2 className="text-3xl font-semibold text-gray-800">
                <CompanyHeader formData={formData} />
              </h2>
              <p className="text-lg font-normal uppercase text-gray-700">
                Fleet Owners and Transport Contractors
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formData.address}, {formData.city}, {formData.pincode}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {formData.email && ` ✉️ ${formData.email}`}
          </p>
        </div>
      </div>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="border border-black p-2">
              Trailer No.: <strong>{formData.truckNo}</strong>
            </td>
            <td className="border border-black p-2">
              Challan No.: <strong>{formData.challanNo}</strong>
            </td>
            <td className="border border-black p-2">
              Date:{' '}
              <strong>
                {new Date(formData.date).toLocaleDateString('en-IN')}
              </strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">
              Material:{' '}
              <strong>
                {formData.material.map(
                  (item, i) =>
                    item.name + (i === formData.material.length - 1 ? '' : ',')
                )}
              </strong>
            </td>
            <td className="border border-black p-2">
              From: <strong>{formData.from}</strong>
            </td>
            <td className="border border-black p-2">
              To: <strong>{formData.to}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">
              Vehicle Owner: <strong>{displayedVehicleOwner}</strong>
            </td>

            <td className="border border-black p-2" colSpan={2}>
              PAN No.: <strong>{formData.pan}</strong>
            </td>
          </tr>

          <tr>
  <td className="border border-black p-2" colSpan={1}>
    <strong>Dasti to Driver:</strong>{" "}
    <span>{formData?.driverName || "NA"}</span>
  </td>
  <td className="border border-black p-2">Rate</td>
  <td className="border border-black p-2">
    <strong>{formData.rate} {formData.billingtype}</strong>
  </td>
</tr>

<tr>
  <td
    className="border border-black p-2 align-top"
    rowSpan={14}
  >
    <div className="text-sm font-semibold text-gray-900 mb-2 underline">
      Advance Payments Made
    </div>

    {Array.isArray(payments) && payments.length > 0 ? (
      <div className="whitespace-pre-wrap text-sm flex flex-col gap-3">
        {payments
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() -
              new Date(b.date).getTime()
          )
          .map((payment: any, index: number) => (
            <div
              key={payment._id || `adv-${index}`}
              className="flex items-center gap-3"
            >
              <span>{index + 1}.</span>
              <span>
                {new Date(payment.date).toLocaleDateString("en-IN")}
              </span>
              <span>₹{Number(payment.amount).toLocaleString("en-IN")}/-</span>
            </div>
          ))}
      </div>
    ) : (
      <div className="italic text-gray-500 text-sm">
        
      </div>
    )}
  </td>
</tr>


          <tr>
            <td className="border border-black p-2">Weight</td>
            <td className="border border-black p-2">
              <strong>{formData.weight}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Total Freight</td>
            <td className="border border-black p-2">
              <strong>{formatNumber(formData.totalFreight)}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Advance</td>
            <td className="border border-black p-2">
              <strong>{formatNumber(formData.advance)}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Balance</td>
            <td className="border border-black p-2">
              <strong>{formatNumber(netBalance)}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Commission</td>
            <td className="border border-black p-2">
              <strong>{formatNumber(formData.commision)}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Hamali</td>
            <td className="border border-black p-2">
              <strong>{formatNumber(formData.hamali)}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Extra Weight</td>
            <td className="border border-black p-2">
              <strong>{formData.extraWeight}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Cash DASTI A/C</td>
            <td className="border border-black p-2">
              <strong>{formatNumber(formData.cashAC)}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Extra</td>
            <td className="border border-black p-2">
              <strong>{formData.extra}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">TDS</td>
            <td className="border border-black p-2">
              <strong>{formData.TDS}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Tyre</td>
            <td className="border border-black p-2">
              <strong>{formData.tire}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Spare Parts</td>
            <td className="border border-black p-2">
              <strong>{formData.spareParts}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-bold">
              Net Balance
            </td>
            <td className="border border-black p-2 font-bold">
              <strong>{formatNumber(netBalance)}</strong>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2" colSpan={3}>
              <strong>
                LR Rec. Date:{' '}
                {new Date(formData.lrdate).toLocaleDateString('en-IN')}
              </strong>
              <p>
                <strong>Payment Date:</strong>
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="border border-black border-t-0 p-2">
        <div className="mt-4 text-sm">
          <strong>Conditions:</strong>
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:items-center md:gap-8 mt-2">
            <p className="flex-1 min-w-0 md:text-left text-center">
              Vehicle owner is responsible for the safe and timely delivery of
              the consignment and would be fined in case of late delivery and
              damages.
            </p>
            <span className="whitespace-nowrap md:ml-8 text-center md:text-right">
              For {formData.companyName}
            </span>
          </div>
          <div className="mt-6 flex flex-col items-center md:items-end">
            {formData.signature ? (
              isPdfExport ? (
                <img
                  src={base64Signature}
                  alt="signature"
                  width={100}
                  height={100}
                  style={{ objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <Image
                  src={formData.signature}
                  alt="signature"
                  width={100}
                  height={100}
                />
              )
            ) : null}

            <p>Cashier/Accountant</p>
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
    </Card>
  );
}
