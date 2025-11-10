"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { PartySelect } from "./PartySelect"
import TruckSelect from "./TruckSelect"
import DriverSelect from "./DriverSelect"
import RouteInputs from "./RouteInputs"
import { BillingInfo } from "./BillingInfo"
import { DateInputs } from "./DateInputs"
import type { TruckModel } from "@/utils/interface"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { formatNumber } from "@/utils/utilArray"
import { createWorker } from "tesseract.js"
import { Loader2 } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { useExpenseData } from "../hooks/useExpenseData"
import { MaterialInput } from "./MaterialInput"
import LoadingSlip from "./tripDetail/TripFunctions/LoadingSlip"

type Props = {
  lr: string
  duplicate: any
  onSubmit: (trip: any) => void
}

export default function TripForm({ onSubmit, lr, duplicate }: Props = { lr: "", duplicate: null, onSubmit: () => { } }) {
  const { trucks, parties, drivers, isLoading } = useExpenseData()

  const [formData, setFormData] = useState({
    party: duplicate?.party || JSON.parse(localStorage.getItem("tripData") as any)?.party || "",
    truck: duplicate?.truck || JSON.parse(localStorage.getItem("tripData") as any)?.truck || "",
    driver: duplicate?.driver || JSON.parse(localStorage.getItem("tripData") as any)?.driver || "",
    supplierId: duplicate?.supplier || JSON.parse(localStorage.getItem("tripData") as any)?.supplierId || "",
    partyName: '',
    route: {
      origin: duplicate?.route?.origin || "",
      destination: duplicate?.route?.destination || "",
    },
    billingType: duplicate?.billingTpe || "Fixed",
    perUnit: 0,
    totalUnits: 0,
    amount: duplicate?.amount || 0,
    startDate: duplicate?.startDate || new Date(),
    truckHireCost: duplicate?.truckHireCost || 0,
    LR: lr,
    fmNo: lr.replace("LRN", "FM"),
    material: duplicate?.material || [],
    notes: duplicate?.notes || "",
    file: null,
    ewbValidity: duplicate?.ewbValidity || null,
    guaranteedWeight: duplicate?.guaranteedWeight || '',
    loadingSlipDetails: {
      balance: 0,
      charges: undefined,
      haltingCharges: undefined,
      advance: undefined,
      length: undefined,
      width: undefined,
      height: undefined
    }
  })

  const [file, setFile] = useState<File | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState<TruckModel | undefined>(undefined)
  const [hasSupplier, setHasSupplier] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB in bytes
  const [loadingSlip, setLoadingSlip] = useState(false)
  const { toast } = useToast()

  const worker = useRef<null | any>(null)

  useEffect(() => {
    const initWorker = async () => {
      worker.current = await createWorker("eng")
    }
    initWorker()
    return () => {
      if (worker.current) worker.current.terminate()
    }
  }, [])

  useEffect(() => {
    const tripData = localStorage.getItem("tripData")
    if (tripData) {
      const savedItem = JSON.parse(tripData)
      setFormData((prev) => ({
        ...prev,
        ...savedItem,
      }))
    }
  }, [])

  useEffect(() => {
    const updatedTruck = trucks.find((truck) => truck.truckNo === formData.truck)
    setSelectedTruck(updatedTruck)
    setFormData((prev) => ({
      ...prev,
      driver: updatedTruck?.driver_id ? updatedTruck?.driver_id : "",
      supplierId: updatedTruck?.supplier ? updatedTruck?.supplier : "",
    }))
    setHasSupplier(!!updatedTruck?.supplier)
  }, [formData.truck, trucks])

  useEffect(() => {
    if (formData.billingType !== "Fixed") {
      const newAmount = Number.parseFloat(formData.perUnit as any) * Number.parseFloat(formData.totalUnits as any)
      setFormData((prevFormData) => ({
        ...prevFormData,
        amount: newAmount,
      }))
    }
  }, [formData.billingType, formData.perUnit, formData.totalUnits])

  useEffect(() => {
    setFormData((prev) => {
      const { advance = 0, charges = 0, haltingCharges = 0, balance } = prev.loadingSlipDetails ?? {};

      return {
        ...prev,
        loadingSlipDetails: {
          ...prev.loadingSlipDetails,
          balance: Number(sanitizeInput(prev.amount.toString())) - Number(advance) + Number(charges) + Number(haltingCharges),
        },
      };
    });
  }, [
    formData.loadingSlipDetails?.advance,
    formData.loadingSlipDetails?.charges,
    formData.loadingSlipDetails?.haltingCharges,
    formData.amount
  ]);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    if (uploadedFile.size > MAX_FILE_SIZE) {
      toast({
        description: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
        variant: "warning",
      })
      return
    }

    setFile(uploadedFile)
    setFormData((prev: any) => ({
      ...prev,
      file: uploadedFile,
    }))

    await processFileUpload(uploadedFile)
  }

  const processFileUpload = async (file: File) => {
    try {
      setFileLoading(true)
      const isPdf = file.type === "application/pdf"
      const resData = await processFile(file, isPdf)
      processTripData(resData.ewbValidityDate)
    } catch (error: any) {
      toast({
        description: `Failed to extract details from E-Way Bill`,
        variant: "warning",
      })
      console.error("Error processing e-way bill:", error)
    } finally {
      setFileLoading(false)
    }
  }

  const processFile = async (file: File, isPdf: boolean) => {
    if (!isPdf) {
      const text = await extractTextFromImage(file)
      const res = await fetch(`/api/trips/getEwaybillDetails/text`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Accept: "application/json",
        },
        body: text,
      })
      if (!res.ok) throw new Error("Failed to process file")
      return await res.json()
    } else {
      const data = new FormData()
      data.append("file", file)
      const res = await fetch(`/api/trips/getEwaybillDetails`, {
        method: "POST",
        body: data,
      })
      if (!res.ok) throw new Error("Failed to process file")
      return await res.json()
    }
  }

  const extractTextFromImage = async (file: File): Promise<string> => {
    if (!worker.current) return ""
    const {
      data: { text },
    } = await worker.current.recognize(file)
    return text
  }

  const processTripData = (tripData: any) => {
    if (!tripData) return

    const driverId = trucks.find((truck) => truck.truckNo === tripData.truckNo)?.driver_id

    setFormData((prev) => ({
      ...prev,
      startDate: new Date(tripData.startDate),
      route: {
        origin: tripData?.origin?.split("\n")[0],
        destination: tripData?.destination?.split("\n")[0],
      },
      truck: tripData.truckNo,
      ewbValidity: tripData.validity,
      driver: driverId,
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes("route.")) {
      const routeField = name.split(".")[1]
      setFormData((prevState) => ({
        ...prevState,
        route: {
          ...prevState.route,
          [routeField]: value,
        },
      }))
    } else if (name === 'party') {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
        partyName: parties.find(party => party.party_id === value).name || ''
      }))
    }
    else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

  const handleLoadingSlipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      loadingSlipDetails: {
        ...prev.loadingSlipDetails,
        [name]: value,
      }
    }))
  }

  const sanitizeInput = (value: string) => {
    const sanitizedValue = Number.parseFloat(value.replace(/,/g, "").trim())
    return !isNaN(Number(sanitizedValue)) ? sanitizedValue : null
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()


    const sanitizedAmount = sanitizeInput(formData.amount.toString())
    const sanitizedTruckHireCost = sanitizeInput(formData.truckHireCost.toString())
    const sanitizedPerUnit = sanitizeInput(formData.perUnit.toString())
    const sanitizedTotalUnits = sanitizeInput(formData.totalUnits.toString())

    if (sanitizedAmount === null || sanitizedTruckHireCost === null) {
      toast({
        description: "Please enter valid numeric values for Amount and Truck Hire Cost.",
        variant: "warning",
      })
      return
    }

    if (!formData.supplierId && !formData.driver) {
      toast({
        description: "Driver Needs to be assigned!",
        variant: "warning",
      })
      return
    }

    if (
      !formData.party ||
      !formData.truck ||
      !formData.amount ||
      !formData.route.origin ||
      !formData.route.destination ||
      !formData.LR
    ) {
      toast({
        description: "Please fill in the required fields",
        variant: "warning",
      })
      return
    }

    onSubmit({
      ...formData,
      amount: sanitizedAmount,
      truckHireCost: sanitizedTruckHireCost,
      perUnit: sanitizedPerUnit,
      totalUnits: sanitizedTotalUnits,
      material: formData.material,
      guaranteedWeight: formData.guaranteedWeight,
    })

    localStorage.removeItem("tripData")
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="text-bottomNavBarColor animate-spin" />
      </div>
    )

  return (
    <div className="bg-white text-black p-4 max-w-3xl mx-auto shadow-md rounded-md">
      <div className="mb-4">
        <LoadingSlip trip={formData} charges={formData.loadingSlipDetails.charges} haltingCharges={formData.loadingSlipDetails.haltingCharges} />
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div className="flex-grow">
          <label className="block text-xs font-medium text-gray-700 mb-1">E-Way Bill</label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            disabled={fileLoading}
            className="w-full"
          />
          {fileLoading && <Loader2 className="animate-spin mt-2 justify-center text-bottomNavBarColor" />}
        </div>
        <div className="flex-shrink-0 w-1/3">
          <label className="block text-xs font-medium text-gray-700 mb-1">EWB Validity Date</label>
          <input
            type="date"
            name="ewbValidity"
            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
            value={formData.ewbValidity ? new Date(formData.ewbValidity).toISOString().split("T")[0] : ""}
            onChange={handleChange}
            className="w-full"
          />
        </div>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <BillingInfo formData={formData} handleChange={handleChange} setFormData={setFormData} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PartySelect parties={parties} formData={formData} handleChange={handleChange} />
          <TruckSelect trucks={trucks} formData={formData} handleChange={handleChange} setFormData={setFormData} suppliers={[]} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DriverSelect drivers={drivers} formData={formData} handleChange={handleChange} setFormData={setFormData} />
          <DateInputs formData={formData} handleChange={handleChange} />
        </div>
        <div className="z-50">
          <RouteInputs formData={formData} handleChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Lorry Recipt No*</label>
            <Input type="text" name="LR" value={formData.LR} placeholder="LR No" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Freight Memo No</label>
            <Input type="text" name="fmNo" value={formData.fmNo} placeholder="FM No" onChange={handleChange} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="showDetails" checked={showDetails} onCheckedChange={() => setShowDetails(!showDetails)} />
          <label
            htmlFor="showDetails"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Add More Details
          </label>
        </div>



        {showDetails && (
          <>
            <MaterialInput
              materials={formData.material}
              onChange={(materials) => setFormData((prev) => ({ ...prev, material: materials }))}
              guaranteedWeight={formData.guaranteedWeight}
              onGuaranteedWeightChange={(weight) => setFormData((prev) => ({ ...prev, guaranteedWeight: weight }))}
            />
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                placeholder="Notes"
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox id="showDetails" checked={loadingSlip} onCheckedChange={() => setLoadingSlip(!loadingSlip)} />
          <label
            htmlFor="showDetails"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Loading Slip Details
          </label>
        </div>

        {
          loadingSlip && (
            <div className="grid grid-cols-2 gap-2">
              <div className="mb-4">
                <label>Advance to be paid</label>
                <input
                  type="number"
                  name="advance"
                  value={formData.loadingSlipDetails.advance}
                  placeholder="Advance"
                  onChange={handleLoadingSlipChange} />
              </div>
              <div className="mb-4">
                <label>Halting Charges</label>
                <input
                  type="number"
                  name="haltingCharges"
                  value={formData.loadingSlipDetails.haltingCharges}
                  placeholder="Halting Charges"
                  onChange={handleLoadingSlipChange} />
              </div>
              <div className="mb-4">
                <label>Other Charges</label>
                <input
                  type="number"
                  name="charges"
                  value={formData.loadingSlipDetails.charges}
                  placeholder="Other Charges"
                  onChange={handleLoadingSlipChange} />
              </div>
              <div className="mb-4">
                <label>Balance</label>
                <input
                  type="number"
                  name="balance"
                  value={formData.loadingSlipDetails.balance}
                  placeholder="Balance"
                  onChange={handleLoadingSlipChange} />
              </div>
              <div className="mb-4">
                <label>Length (L)</label>
                <input
                  type="number"
                  name="length"
                  min="0"
                  max="9999"
                  step="0.01"
                  value={formData.loadingSlipDetails.length || ''}
                  placeholder="Length"
                  onChange={handleLoadingSlipChange} />
              </div>
              <div className="mb-4">
                <label>Width (W)</label>
                <input
                  type="number"
                  name="width"
                  min="0"
                  max="9999"
                  step="0.01"
                  value={formData.loadingSlipDetails.width || ''}
                  placeholder="Width"
                  onChange={handleLoadingSlipChange} />
              </div>
              <div className="mb-4">
                <label>Height (H)</label>
                <input
                  type="number"
                  name="height"
                  min="0"
                  max="9999"
                  step="0.01"
                  value={formData.loadingSlipDetails.height || ''}
                  placeholder="Height"
                  onChange={handleLoadingSlipChange} />
              </div>

            </div>


          )
        }



        {hasSupplier && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Truck Hire Cost</label>
            <Input
              type="text"
              name="truckHireCost"
              value={formatNumber(formData.truckHireCost)}
              placeholder="Truck Hire Cost"
              onChange={handleChange}
            />
          </div>
        )}

        <Button className="w-full hover:scale-100 mt-4" type="submit" disabled={fileLoading}>
          Submit
        </Button>
      </form>

    </div>
  )
}

