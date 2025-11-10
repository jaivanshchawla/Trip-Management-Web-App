"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { FMDataType, ITrip } from "@/utils/interface"
import { useToast } from "../hooks/use-toast"
import { FMemo } from "@/utils/DocGeneration"
import "jspdf/dist/polyfills.es.js"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { savePDFToBackend } from "@/utils/saveTripDocs"
import { useTrip } from "@/context/tripContext"
import { fetchDriverName } from '@/helpers/driverOperations';

type Props = {
  isOpen: boolean
  onClose: () => void
}

const placeholders: { [key: string]: string } = {
  gstNumber: "Enter GST Number",
  pan: "Enter PAN Number",
  companyName: "Enter Company Name",
  address: "Enter Full Address",
  city: "Enter City Name",
  pincode: "Enter Pincode/ZIP Code",
  contactNumber: "Enter Contact Number",
  email: "Enter Email Address",
  date: "Select Date",
  from: "Enter Starting Location",
  to: "Enter Destination Location",
  truckHireCost: "Enter Truck Hire Cost",
  totalFreight : "Enter Total Freight",
  weight: "Enter Total Weight of Goods",
  material: "Enter Material Name",
  unit: "Enter Unit (e.g., Kg, Tons)",
  noOfBags: "Enter Number of Bags",
  amount: "Enter Total Amount",
  advance: "Enter Advance Amount Paid",
  balance: "Enter Remaining Balance",
  commision: "Enter Commission Amount",
  hamali: "Enter Hamali Charges",
  extraWeight: "Enter Extra Weight (if any)",
  cashAC: "Enter Dasti Account Charges",
  extra: "Enter Extra Charges",
  TDS: "Enter TDS Amount",
  tyre: "Enter Tire Charges (if applicable)",
  spareParts: "Enter Spare Parts Cost (if applicable)",
  truckNo: "Enter Truck Number",
  logo: "Upload Company Logo",
  challanNo: "Enter Challan Number",
  lrdate: "Enter LR Rec. Date (if applicable)",
}

const steps = [
  {
    title: "Company Details",
    fields: ["gstNumber", "pan", "companyName", "address", "city", "pincode", "contactNumber", "email"],
  },
  {
    title: "Frieght Memo Details",
    fields: ["date", "challanNo", "lrdate"],
  },
  {
    title: "Trip Details",
    fields: [
      "from",
      "to",
      "truckNo",
      "totalFreight",
      "material",
      "weight",
      "unit",
      "noOfBags",
      "advance",
      "hamali",
      "commision",
    ],
  },
  {
    title: "Extra Details",
    fields: ["extraWeight", "cashAC", "extra", "TDS", "tyre", "spareParts"],
  },
]

export default function FrieghtMemo({ isOpen, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showBill, setShowBill] = useState(false)
  const [pdfDownloading, setPDFDownloading] = useState(false)
  const [user, setUser] = useState<any>()
  const [payments, setPayments] = useState<any[]>([])
  const { trip, setTrip } = useTrip()
  const [formData, setFormData] = useState<FMDataType>({
    gstNumber: "",
    pan: "",
    companyName: "",
    userName: "",
    address: "",
    city: "",
    pincode: "",
    contactNumber: "",
    email: "",
    date: new Date(trip?.startDate),
    from: trip?.route?.origin || "",
    to: trip?.route?.destination || "",
    totalFreight: trip?.truckHireCost || (trip?.amount ?? ""),
    weight: trip?.weight || "",
    material: trip?.material || [],
    vehicleOwner:
      trip?.supplierName ||
      (trip?.supplier && (trip.supplier.name || "")) ||
      "",
    unit: "",
    billingtype: trip?.billingType || "",
    rate: trip?.rate || "",
    commision: "",
    noOfBags: "",
    advance: "",
    hamali: "",
    extraWeight: "",
    cashAC: "",
    extra: "",
    TDS: "",
    tire: "",
    lrdate: new Date(trip?.dates?.[2] || Date.now()).toISOString().split("T")[0],
    spareParts: "",
    truckNo: trip?.truck || "",
    driverName: trip?.driverName || "",
    challanNo: trip?.fmNo || "",
    logo: "",
    signature: "",
    altPhone: ""
  })

  const { toast } = useToast()

  // --- fetch user only (no payments) ---
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/users")
      if (!res.ok) {
        console.warn("fetchUser: /api/users returned", res.status)
        toast({ description: "Failed to fetch user details", variant: "destructive" })
        return
      }
      const data = await res.json()
      const user = data.user
      setUser(user)
      setFormData((prev) => ({
        ...prev,
        companyName: user.company,
        address: user.address,
        contactNumber: user.phone,
        gstNumber: user.gstNumber,
        logo: user.logoUrl,
        pincode: user.pincode,
        email: user.email,
        city: user.city,
        pan: user.panNumber,
        signature: user.signatureUrl,
        altPhone: user.altPhone || "",
        userName: user.name || user.company,
        vehicleOwner: prev.vehicleOwner || user.name || user.company,
      }))
    } catch (error) {
      console.error("fetchUser error:", error)
      toast({ description: "An unexpected error occurred", variant: "destructive" })
    }
  }

  // --- fetch payments from backend API (only if trip.supplier + trip_id are available) ---
  const fetchPaymentsFromApi = async () => {
    if (!trip?.supplier || !trip?.trip_id) {
      console.log("Skipping payments API fetch — missing trip.supplier or trip.trip_id", { supplier: trip?.supplier, trip_id: trip?.trip_id })
      return
    }
    try {
      console.log("Fetching payments from API for supplier:", trip.supplier, "trip:", trip.trip_id)
      const res = await fetch(`/api/suppliers/${trip.supplier}/payments/trips/${trip.trip_id}`)
      if (!res.ok) {
        console.warn("Payments API returned non-OK:", res.status)
        return
      }
      const paymentsData = await res.json()
      console.log("Payments API response body:", paymentsData)

      const accountsArray = paymentsData?.supplierAccounts ?? paymentsData?.accounts ?? paymentsData?.payments ?? []
      if (!Array.isArray(accountsArray) || accountsArray.length === 0) {
        console.log("Payments API returned no accounts/empty array")
        return
      }

      const normalized = accountsArray.map((p: any, i: number) => ({
        _id: p._id || p.id || `api-${i}`,
        amount: Number(p.amount ?? p.value ?? 0),
        date: p.date || p.createdAt || new Date().toISOString(),
      })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setPayments(normalized)
      const total = normalized.reduce((s: number, it: any) => s + (Number(it.amount) || 0), 0)
      setFormData(prev => ({ ...prev, advance: String(total) }))
      console.log("Payments state set from API, total advances:", total)
    } catch (err) {
      console.warn("fetchPaymentsFromApi error:", err)
    }
  }

  // When modal opens or trip changes, load user + try payments API
  useEffect(() => {
    if (!isOpen) return;
    fetchUser();
    fetchPaymentsFromApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, trip?.supplier, trip?.trip_id]);

  // 🔑 If API payments are not available, mirror from trip.advances first, then trip.accounts
  useEffect(() => {
    if (payments && payments.length > 0) {
      console.log("Skipping fallback, API payments already loaded:", payments);
      return;
    }

    const source =
      Array.isArray(trip?.advances) && trip.advances.length
        ? trip.advances
        : Array.isArray(trip?.accounts) && trip.accounts.length
        ? trip.accounts
        : null;

    if (!source) {
      console.log("No trip.advances or trip.accounts to mirror");
      return;
    }

    console.log("Mirroring advances into payments state:", source);

    const adv = source
      .filter((a: any) => a && (a.amount ?? a.value ?? a.amt) != null)
      .map((a: any, i: number) => ({
        _id: a._id || a.id || `adv-${i}`,
        amount: Number(a.amount ?? a.value ?? a.amt ?? 0),
        date: a.date || a.createdAt || new Date().toISOString(),
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    if (adv.length === 0) {
      console.log("Advances list empty after normalization");
      return;
    }

    setPayments(adv);
    const total = adv.reduce(
      (sum: number, item: any) => sum + (Number(item.amount) || 0),
      0
    );
    setFormData((prev) => ({ ...prev, advance: String(total) }));
    console.log("Payments set from advances, total:", total);
  }, [trip?.accounts, trip?.advances, payments.length]);

  // keep driverName in sync when trip updates
  useEffect(() => {
    if (!trip) return;
    setFormData((prev) => ({
      ...prev,
      driverName: trip.driverName || prev.driverName || "",
    }));
  }, [trip?.driverName, trip?.driver]);

  // optional: fetch driver name from API if only driver id is available
  useEffect(() => {
    if (!trip?.driver || trip?.driverName) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/drivers/${trip.driver}`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          setFormData((prev) => ({
            ...prev,
            driverName:
              data?.driver?.name ||
              data?.name ||
              prev.driverName ||
              "",
          }));
        }
      } catch (err) {
        console.warn("Could not fetch driver name", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [trip?.driver, trip?.driverName]);

  // debug output
  useEffect(() => {
    console.log("Payments state updated (FreightMemo):", payments);
  }, [payments]);

  const addMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      material: [...prev.material, { name: "", weight: "", unit: "" }],
    }))
  }

  const handleMaterialChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedMaterials = [...prev.material]
      updatedMaterials[index] = { ...updatedMaterials[index], [field]: value }
      return { ...prev, material: updatedMaterials }
    })
  }

  const downloadAllPDFs = async () => {
    const element = document.getElementById("pdf-fmemo");
    if (!element) {
      console.error('Element with id "fmemo" not found')
      return
    }

    setPDFDownloading(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: true,
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/jpeg")
      const padding = 10
      const imgWidth = canvas.width / 2
      const imgHeight = canvas.height / 2
      const pdfWidth = (imgWidth * 25.4) / 96 + padding * 2
      const pdfHeight = (imgHeight * 25.4) / 96 + padding * 2

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      })

      const imgX = padding
      const imgY = padding

      pdf.addImage(imgData, "JPEG", imgX, imgY, pdfWidth - padding * 2, pdfHeight - padding * 2)
      pdf.save(`Challan-${trip?.LR || ""}-${formData.truckNo}.pdf`)

      const filename = `FM-${trip?.LR || ""}-${trip?.truck || ""}.pdf`
      const docData = await savePDFToBackend(pdf, filename, "FM/Challan", trip, formData.date)
      setTrip((prev: ITrip | any) => ({
        ...prev,
        documents: docData.documents,
      }))
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF")
    } finally {
      setPDFDownloading(false)
    }

    // sync user details back if missing in DB
    if (
      (!user?.company && formData.companyName) ||
      (!user?.address && formData.address) ||
      (!user?.gstNumber && formData.gstNumber) ||
      (!user?.panNumber && formData.pan) ||
      (!user?.pincode && formData.pincode) ||
      (!user?.city && formData.city) ||
      (!user?.email && formData.email)
    ) {
      const data = new FormData()
      data.append(
        "data",
        JSON.stringify({
          companyName: user?.company || formData.companyName,
          address: user?.address || formData.address,
          gstNumber: user?.gstNumber || formData.gstNumber,
          pincode: user?.pincode || formData.pincode,
          email: user?.email || formData.email,
          city: user?.city || formData.city,
          panNumber: user?.panNumber || formData.pan,
        }),
      )
      try {
        const res = await fetch("/api/users", {
          method: "PUT",
          body: data,
        })
        if (!res.ok) {
          alert("Failed to update user details")
        }
      } catch (error) {
        alert("Failed to update user details")
      }
    }
  }

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".")
        return { ...prev, [parent]: { ...prev[parent], [child]: value } }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 15 }}
        className="bg-white p-6 rounded-lg shadow-lg max-w-5xl w-full max-h-[700px] overflow-y-auto thin-scrollbar"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-semibold text-xl text-black">Frieght Memo</h1>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>

        {!showBill ? (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <motion.div
                className="bg-lightOrange h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-2 gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="col-span-2"
                >
                  <h2 className="text-lg font-semibold text-black mt-2 mb-4">{steps[currentStep].title}</h2>

                  <div className="grid grid-cols-2 gap-4">
                    {steps[currentStep].fields.map((field: string) => {
                      if (field === "date") {
                        return (
                          <div className="mb-4" key={field}>
                            <Label htmlFor="date">Date</Label>
                            <input
                              id="date"
                              name="date"
                              type="date"
                              value={new Date(formData.date).toISOString().split("T")[0]}
                              onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                              onChange={handleInputChange}
                              className="mt-1 w-full p-2 border rounded"
                            />
                          </div>
                        )
                      }

                      if (field === "material") {
                        return (
                          <div className="col-span-2" key={field}>
                            <label className="text-xs text-gray-500">Materials</label>
                            {formData.material.map((mat, index) => (
                              <div key={index} className="flex gap-2 mt-2">
                                <Input
                                  placeholder="Material Name"
                                  value={mat.name}
                                  onChange={(e) => handleMaterialChange(index, "name", e.target.value)}
                                />
                                <Input
                                  placeholder="Weight"
                                  value={mat.weight}
                                  onChange={(e) => handleMaterialChange(index, "weight", e.target.value)}
                                />
                              </div>
                            ))}
                            <Button type="button" onClick={addMaterial} className="mt-2">
                              Add Material
                            </Button>
                          </div>
                        )
                      }

                      return (
                        <div key={field} className="mb-1">
                          <label htmlFor={field} className="text-xs text-gray-500">
                            {placeholders[field]}
                          </label>
                          <Input
                            id={field}
                            name={field}
                            value={(formData[field as keyof FMDataType] as string) || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-between mt-6 col-span-2">
                    {currentStep > 0 && (
                      <Button variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                    )}
                    {currentStep < steps.length - 1 ? (
                      <Button onClick={handleNext}>Next</Button>
                    ) : (
                      <Button onClick={() => setShowBill(true)}>Generate</Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </form>
          </>
        ) : (
          <div className="w-full">
            <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-b border-gray-200">
              <div className="flex justify-between max-w-5xl mx-auto">
                <Button variant="outline" onClick={() => setShowBill(false)}>
                  Edit Form
                </Button>
                <Button disabled={pdfDownloading} onClick={() => downloadAllPDFs()}>
                  {pdfDownloading ? <Loader2 className="text-white animate-spin" /> : "Download as PDF"}
                </Button>
              </div>
            </div>

            <div className="p-2">
              <FMemo formData={formData} payments={payments} />
            </div>

            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', height: 0, overflow: 'hidden' }}>
              <div id="pdf-fmemo">
                <FMemo formData={formData} payments={payments} isPdfExport={true} />
              </div>
            </div>

          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
