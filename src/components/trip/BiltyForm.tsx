"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { ConsignerConsigneeType, EWBFormDataType, ITrip } from "@/utils/interface"
import { Bilty } from "@/utils/DocGeneration"
import "jspdf/dist/polyfills.es.js"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "../hooks/use-toast"
import { savePDFToBackend } from "@/utils/saveTripDocs"

type Props = {
  isOpen: boolean
  onClose: () => void
  trip: ITrip | any
  setTrip: React.Dispatch<React.SetStateAction<any>>
}

const placeholders: { [key: string]: string } = {
  gstNumber: "Enter GST Number",
  pan: "Enter PAN",
  companyName: "Enter Company Name",
  address: "Enter Address",
  city: "Enter City",
  pincode: "Enter Pincode",
  contactNumber: "Enter Contact Number",
  email: "Enter Email Address",
  date: "Select Date",
  LR: "Enter LR Number",
  from: 'Enter origin',
  to: 'Enter destination',
  consigner: "Enter Consigner Details",
  consignee: "Enter Consignee Details",
  material: "Enter Material Name",
  weight: "Enter Weight",
  unit: "Enter Unit",
  paidBy: "Enter Payment Responsible Party",
  ewayBillNo: "Enter E-Way Bill Number",
  invoiceNo: "Enter Invoice Number",
  name: "Enter Name",
  value: "Value",
}

const steps = [
  {
    title: "Company Details",
    fields: ["gstNumber", "pan", "companyName", "address", "city", "pincode", "contactNumber", "email"],
  },
  {
    title: "Consigner/Consignee Details",
    fields: ["from", "to", "date", "LR", "consigner", "consignee"],
  },
  {
    title: "Trip Details",
    fields: ["material", "weight", "unit", "paidBy"],
  },
  {
    title: "E-Way Bill Details",
    fields: ["ewayBillNo", "invoiceNo"],
  },
]

const tabs = ["Consigner", "Consignee", "Office", "Driver"]

export default function BiltyForm({ isOpen, onClose, trip, setTrip }: Props) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [showBill, setShowBill] = useState(false)
  const [user, setUser] = useState<any>()
  const [pdfDownloading, setPDFDownloading] = useState(false)
  const [formData, setFormData] = useState<EWBFormDataType>({
    gstNumber: "",
    pan: "",
    companyName: "",
    address: "",
    city: "",
    pincode: "",
    contactNumber: "",
    email: "",
    from: trip.route.origin || '',
    to: trip.route.destination || "",
    date: new Date(trip.startDate),
    LR: trip.LR || "",
    consigner: {
      gstNumber: "",
      name: "",
      address: '',
      city: trip.route.origin,
      pincode: "",
      contactNumber: "",
    },
    consignee: {
      gstNumber: "",
      name: "",
      address: '',
      city: trip.route.destination,
      pincode: "",
      contactNumber: "",
    },
    weight: "",
    unit: "",
    paidBy: "consigner",
    ewayBillNo: "",
    invoiceNo: "",
    value: "",
    truckNo: trip.truck || "",
    logo: "",
    signature: "",
    materials: trip.material || [],
    grtdWeight: trip.guaranteedWeight || '',
    altPhone : ""
  })
  const billRef = useRef<HTMLDivElement>(null)

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/users")
      if (!res.ok) {
        alert("Failed to fetch details")
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
        signature: user.signatureUrl,
        pincode: user.pincode,
        pan: user.panNumber,
        city: user.city,
        email: user.email,
        altPhone : user.altPhone || ""
      }))
    } catch (error) {
      alert("Failed to fetch User Details")
    }
  }

  useEffect(() => {
    if (isOpen) fetchUser()
  }, [isOpen])

  const biltyColor = (copy: string) => {
    switch (copy) {
      case "Consigner":
        return "bg-red-100"
      case "Consignee":
        return "bg-blue-100"
      case "Driver":
        return "bg-yellow-100"
      case "Office":
        return "bg-green-100"

      default:
        break
    }
  }

  const downloadAllPDFs = async () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    setPDFDownloading(true)

    try {
      // Remove the initial blank page
      pdf.deletePage(1)

      // Generate PDF pages for all tabs
      for (const tab of tabs) {
        const element = document.getElementById(`pdf-bilty-${tab}`)
        if (element) {
          const canvas = await html2canvas(element, { scale: 2 })
          const imgData = canvas.toDataURL("image/jpeg")

          const padding = 10 // 10mm padding on each side
          const imgWidth = canvas.width / 2 // Divide by 2 because of scale: 2
          const imgHeight = canvas.height / 2

          // Set the PDF page size to match the image size plus padding
          pdf.addPage([imgWidth + padding * 2, imgHeight + padding * 2], "landscape")
          pdf.addImage(imgData, "JPEG", padding, padding, imgWidth, imgHeight)
        }
      }

      // Save the generated PDF to the user's local device
      pdf.save(`Bilty-${trip.LR}-${formData.truckNo}.pdf`)

      // Update user details if necessary
      if (
        (!user.companyName && formData.companyName) ||
        (!user.address && formData.address) ||
        (!user.gstNumber && formData.gstNumber) ||
        (!user.panNumber && formData.pan) ||
        (!user.pincode && formData.pincode) ||
        (!user.city && formData.city) ||
        (!user.email && formData.email)
      ) {
        await updateUserDetails()
      }

      // Save the PDF file to the backend
      const filename = `Bilty-${trip.LR}-${trip.truck}.pdf`
      const docData = await savePDFToBackend(pdf, filename, "Bilty", trip, formData.date)

      setTrip((prev: ITrip | any) => ({
        ...prev,
        documents: docData.documents,
      }))

      toast({
        description: "Bilty saved successfully to documents",
      })
    } catch (error) {
      console.error("Error processing PDF:", error)
      toast({
        description: "An error occurred while saving bilty",
        variant: "destructive",
      })
    } finally {
      setPDFDownloading(false)
    }
  }

  const updateUserDetails = async () => {
    const formdata = new FormData()
    formdata.append(
      "data",
      JSON.stringify({
        companyName: user.companyName || formData.companyName,
        address: user.address || formData.address,
        gstNumber: user.gstNumber || formData.gstNumber,
        panNumber: user.panNumber || formData.pan,
        pincode: user.pincode || formData.pincode,
        city: user.city || formData.city,
        email: user.email || formData.email,
      }),
    )

    const response = await fetch("/api/users", {
      method: "PUT",
      body: formdata,
    })

    if (!response.ok) {
      throw new Error("Failed to update user details")
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

  const handleMaterialChange = (index: number, field: "name" | "weight", value: string | number) => {
    setFormData((prev) => {
      const newMaterials = [...prev.materials]
      newMaterials[index] = { ...newMaterials[index], [field]: value }
      return { ...prev, materials: newMaterials }
    })
  }

  const addMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [...prev.materials, { name: "", weight: "" }],
    }))
  }

  const removeMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }))
  }

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
        className={`bg-white p-6 rounded-lg shadow-lg ${!showBill ? "max-w-5xl" : "max-w-7xl"} w-full max-h-[700px] overflow-y-auto thin-scrollbar`}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-semibold text-xl text-black">Bilty Details</h1>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>

        {!showBill ? (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <motion.div
              className="bg-lightOrange h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ) : (
          <div className="flex items-start gap-16 mb-4"></div>
        )}
        {!showBill ? (
          <form onSubmit={(e) => e.preventDefault()}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <h2 className="text-lg font-semibold text-black mt-2 mb-4">{steps[currentStep].title}</h2>

                {currentStep === 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {(steps[currentStep].fields as (keyof EWBFormDataType)[]).map((field) => (
                        <div key={field} className="mb-1">
                          <label htmlFor={field} className="text-xs text-gray-500">
                            {placeholders[field]}
                          </label>
                          <Input
                            id={field}
                            name={field}
                            value={formData[field] as string}
                            onChange={handleInputChange}
                            className="mt-[1px]"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {currentStep === 1 && (
                  <>
                    <div className="mb-4">
                      <Label htmlFor="date">Date</Label>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        value={new Date(formData.date).toISOString().split("T")[0]}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="LR">LR</Label>
                      <Input
                        id="LR"
                        name="LR"
                        value={formData.LR}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="LR"
                      />
                    </div>
                    {/* Add From and To fields */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="from">From</Label>
                        <Input
                          id="from"
                          name="from"
                          value={formData.from}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder={placeholders["from"]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="to">To</Label>
                        <Input
                          id="to"
                          name="to"
                          value={formData.to}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder={placeholders["to"]}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Consigner Details</h3>
                        {Object.keys(formData.consigner).map((field) => (
                          <div key={field} className="mb-1">
                            <label htmlFor={`consigner.${field}`} className="text-xs text-gray-500">
                              {placeholders[field]}
                            </label>
                            <Input
                              id={`consigner.${field}`}
                              name={`consigner.${field}`}
                              value={formData.consigner[field as keyof ConsignerConsigneeType]}
                              onChange={handleInputChange}
                              className="mt-[1px]"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Consignee Details</h3>
                        {Object.keys(formData.consignee).map((field) => (
                          <div key={field} className="mb-1">
                            <label htmlFor={`consignee.${field}`} className="text-xs text-gray-500">
                              {placeholders[field]}
                            </label>
                            <Input
                              id={`consignee.${field}`}
                              name={`consignee.${field}`}
                              value={formData.consignee[field as keyof ConsignerConsigneeType]}
                              onChange={handleInputChange}
                              className="mt-[1px]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="mb-4">
                      <Label>Materials</Label>
                      {formData.materials.map((material, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <Input
                            name={`materials[${index}].name`}
                            value={material.name}
                            onChange={(e) => handleMaterialChange(index, "name", e.target.value)}
                            placeholder="Material name"
                          />
                          <Input
                            type="text"
                            name={`materials[${index}].weight`}
                            value={material.weight}
                            onChange={(e) => handleMaterialChange(index, "weight", e.target.value)}
                            placeholder="Weight"
                          />
                          <Button type="button" variant="outline" size="sm" onClick={() => removeMaterial(index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addMaterial} className="mt-2">
                        Add Material
                      </Button>
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="guaranteedWeight">Guaranteed Weight</Label>
                      <Input
                        id="guaranteedWeight"
                        name="grtdWeight"
                        type="text"
                        value={formData.grtdWeight}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="Guaranteed Weight"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        name="unit"
                        type="number"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="Unit"
                      />
                    </div>
                    <div className="my-4">
                      <Label>Freight Amount paid by</Label>
                      <RadioGroup
                        value={formData.paidBy}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, paidBy: value as "consigner" | "consignee" | "agent" }))
                        }
                        className="flex space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="consigner" id="consigner" />
                          <Label htmlFor="consigner">Consigner</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="consignee" id="consignee" />
                          <Label htmlFor="consignee">Consignee</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="agent" id="agent" />
                          <Label htmlFor="agent">Agent</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="ewayBillNo">E-Way Bill No.</label>
                      <Input
                        id="ewayBillNo"
                        name="ewayBillNo"
                        value={formData.ewayBillNo}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder={placeholders["ewayBillNo"]}
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="invoiceNo">Goods Invoice No.</label>
                      <Input
                        id="invoiceNo"
                        name="invoiceNo"
                        value={formData.invoiceNo}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder={placeholders["invoiceNo"]}
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="value">Value</label>
                      <Input
                        id="value"
                        name="value"
                        value={formData.value}
                        placeholder="As Per Invoice"
                        className="mt-1"
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-between mt-6">
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
        ) : (
          <div className="w-full">
            {showBill && (
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
            )}
            {/* Visible preview for users */}
<div ref={billRef} className="pb-4">
  {tabs.map((tab) => (
    <div key={tab} id={`bilty-${tab}`} className="my-10">
      <Bilty formData={formData} color={biltyColor(tab) as string} selectedCopy={tab} />
    </div>
  ))}
</div>

{/* Hidden container for PDF generation */}
<div style={{ position: 'fixed', top: '-10000px', left: '-10000px', height: 0, overflow: 'hidden' }}>
  {tabs.map((tab) => (
    <div key={tab} id={`pdf-bilty-${tab}`} className="my-10">
      <Bilty
        formData={formData}
        color={biltyColor(tab) as string}
        selectedCopy={tab}
        isPdfExport={true}
      />
    </div>
  ))}
</div>

          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

