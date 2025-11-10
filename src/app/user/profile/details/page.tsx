"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import { removeBackgroundFromImage } from "@/helpers/removebg"
import Loading from "@/app/user/loading"
import logoImg from "@/assets/awajahi logo.png"
import { isValidPhone } from "@/utils/validate"
import { useToast } from "@/components/hooks/use-toast"
import LogoutModal from "@/components/LogoutModal"

const DetailsPage = () => {
  const [user, setUser] = useState<any>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [logo, setLogo] = useState<File | null>(null)
  const [stamp, setStamp] = useState<File | null>(null)
  const [signature, setSignature] = useState<File | null>(null)
  const [innerLoading, setInnerLoading] = useState(false)
  const [previews, setPreviews] = useState({
    logo: "",
    stamp: "",
    signature: "",
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showBgRemovalPrompt, setShowBgRemovalPrompt] = useState(false)
  const [currentFile, setCurrentFile] = useState<{
    file: File
    setter: React.Dispatch<React.SetStateAction<File | null>>
    previewKey: "logo" | "stamp" | "signature"
  } | null>(null)
  const [deleteLogo, setDeleteLogo] = useState(false)
  const [deleteStamp, setDeleteStamp] = useState(false)
  const [deleteSignature, setDeleteSignature] = useState(false)
  const {toast} = useToast()

  const fetchUser = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setUser(data.user)
      setPreviews({
        logo: data.user.logoUrl,
        stamp: data.user.stampUrl,
        signature: data.user.signatureUrl,
      })
    } catch (error) {
      console.error("Error:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user) {
      if (e.target.name.startsWith("bankDetails")) {
        setUser({
          ...user,
          bankDetails: { ...user.bankDetails, [e.target.name.replace("bankDetails.", "")]: e.target.value },
        })
        return
      }
      setUser({ ...user, [e.target.name]: e.target.value })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setPreviews({
      logo: user.logoUrl || "",
      stamp: user.stampUrl || "",
      signature: user.signatureUrl || "",
    })
    setDeleteLogo(false)
    setDeleteStamp(false)
    setDeleteSignature(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if(user.altPhone && !isValidPhone(user.altPhone)){
      toast({
        description : "Please enter a correct phone number",
        variant : "destructive"
      })
      return
    }
    setInnerLoading(true)
    if (user) {
      try {
        const formdata = new FormData()
        formdata.append(
          "data",
          JSON.stringify({
            name: user.name,
            company: user.company,
            gstNumber: user.gstNumber,
            address: user.address,
            pincode: user.pincode,
            city: user.city,
            panNumber: user.panNumber,
            bankDetails: user.bankDetails,
            email: user.email,
            altPhone : user.altPhone,
            deleteLogo,
            deleteStamp,
            deleteSignature,
          }),
        )

        // Only append files if they exist and haven't been marked for deletion
        if (logo && !deleteLogo) {
          console.log("Appending logo:", logo)
          formdata.append("logo", logo)
        }
        if (stamp && !deleteStamp) {
          console.log("Appending stamp:", stamp)
          formdata.append("stamp", stamp)
        }
        
        if (signature && !deleteSignature) {
          console.log("Appending signature:", signature)
          formdata.append("signature", signature)
        }

        const res = await fetch(`/api/users`, {
          method: "PUT",
          body: formdata,
        })

        if (!res.ok) {
          throw new Error("Failed to update party details")
        }

        const data = await res.json()
        setUser(data.user)
        setIsEditing(false)
        // Reset deletion states
        setDeleteLogo(false)
        setDeleteStamp(false)
        setDeleteSignature(false)
      } catch (err: any) {
        console.error("Error saving user details:", err)
        alert(err.message)
      }
      setInnerLoading(false)
    }
  }

  const handleFileChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      setter: React.Dispatch<React.SetStateAction<File | null>>,
      previewKey: "logo" | "stamp" | "signature",
    ) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        setCurrentFile({ file, setter, previewKey })
        setShowBgRemovalPrompt(true)
      }
    },
    [],
  )

  const handleBgRemovalChoice = useCallback(
    (removeBackground: boolean) => {
      setShowBgRemovalPrompt(false)
      if (currentFile && canvasRef.current) {
        const { file, setter, previewKey } = currentFile
        const reader = new FileReader()
        setInnerLoading(true)

        reader.onloadend = async () => {
          const img = document.createElement("img")
          img.onload = () => {
            let processedImageDataUrl: string
            if (removeBackground) {
              processedImageDataUrl = removeBackgroundFromImage(img, canvasRef.current!) as string
            } else {
              const canvas = canvasRef.current!
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext("2d")!
              ctx.drawImage(img, 0, 0)
              processedImageDataUrl = canvas.toDataURL("image/png")
            }

            // Update preview immediately
            setPreviews((prev) => ({ ...prev, [previewKey]: processedImageDataUrl }))

            // Convert the processed image to a File object
            fetch(processedImageDataUrl)
              .then((res) => res.blob())
              .then((blob) => {
                // Create a new File from the processed image blob
                const processedFile = new File([blob], file.name, {
                  type: "image/png",
                })
                // Set the processed file using the appropriate setter
                setter(processedFile)
                setInnerLoading(false)
              })
              .catch((error) => {
                console.error("Error converting processed image to file:", error)
                setInnerLoading(false)
              })
          }
          img.src = reader.result as string
        }
        reader.readAsDataURL(file)
      }
      setCurrentFile(null)
    },
    [currentFile],
  )

  // Helper function to convert processed image URL to a File

  const renderPreview = (type: "logo" | "stamp" | "signature") => {
    const preview = previews[type]
    return (
      <div className="w-full h-40 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100 relative group">
        {preview ? (
          <>
            <Image
              src={preview || "/placeholder.svg"}
              alt={`${type} preview`}
              fill
              className="transition-opacity group-hover:opacity-50 object-contain"
            />
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  className="mr-2"
                  onClick={() => {
                    setPreviews((prev) => ({ ...prev, [type]: "" }))
                    if (type === "logo") setDeleteLogo(true)
                    if (type === "stamp") setDeleteStamp(true)
                    if (type === "signature") setDeleteSignature(true)
                  }}
                >
                  <X size={16} className="mr-1" /> Remove
                </Button>
                <label htmlFor={`${type}-upload`} className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload size={16} className="mr-1" /> Change
                    </span>
                  </Button>
                </label>
                <input
                  id={`${type}-upload`}
                  name={type}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(e, type === "logo" ? setLogo : type === "stamp" ? setStamp : setSignature, type)
                  }
                  hidden
                />
              </div>
            )}
          </>
        ) : (
          <label
            htmlFor={`${type}-upload`}
            className="cursor-pointer flex flex-col items-center justify-center text-gray-400"
          >
            <Upload size={24} />
            <span className="mt-2">Upload {type}</span>
            <input
              id={`${type}-upload`}
              name={type}
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e, type === "logo" ? setLogo : type === "stamp" ? setStamp : setSignature, type)
                setIsEditing(true)
              }}
              hidden
            />
          </label>
        )}
      </div>
    )
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="max-w-4xl container border border-gray-300 shadow-md rounded-lg p-8">
      {user && (
        <form className="" onSubmit={handleSave}>
          <h2 className="text-black text-lg text-left my-2">User Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700">Name:</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Company Name:</label>
              <input
                type="text"
                name="company"
                value={user.company || ""}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Secondary Phone:</label>
              <input
                type="text"
                name="altPhone"
                value={user.altPhone || ""}
                onChange={handleInputChange}
                placeholder="9876543210"
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">GST Number:</label>
              <input
                type="text"
                name="gstNumber"
                value={user.gstNumber || ""}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">PAN Number:</label>
              <input
                type="text"
                name="panNumber"
                value={user.panNumber || ""}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Email:</label>
              <input
                type="email"
                name="email"
                value={user.email || ""}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Address:</label>
              <input
                type="text"
                name="address"
                value={user.address || ""}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">City:</label>
              <input
                type="text"
                name="city"
                value={user.city || ""}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Pincode:</label>
              <input
                type="text"
                name="pincode"
                value={user.pincode || ""}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2"
                disabled={!isEditing}
              />
            </div>
          </div>

          <h2 className="text-black text-lg text-left mb-2 mt-4">Bank Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankMsmeNo">MSME Number</label>
              <input
                id="bankMsmeNo"
                name="bankDetails.msmeNo"
                value={user.bankDetails?.msmeNo || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="bankAccountNo">Account Number</label>
              <input
                id="bankAccountNo"
                name="bankDetails.accountNo"
                value={user.bankDetails?.accountNo || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="bankIfscCode">IFSC Code</label>
              <input
                id="bankIfscCode"
                name="bankDetails.ifscCode"
                value={user.bankDetails?.ifscCode || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="bankName">Bank Name</label>
              <input
                id="bankName"
                name="bankDetails.bankName"
                value={user.bankDetails?.bankName || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="bankBranch">Bank Branch</label>
              <input
                id="bankBranch"
                name="bankDetails.bankBranch"
                value={user.bankDetails?.bankBranch || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Logo</label>
              {renderPreview("logo")}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Stamp</label>
              {renderPreview("stamp")}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Signature</label>
              {renderPreview("signature")}
            </div>
          </div>

          {isEditing && (
            <footer className="text-red-500 text-xs mt-2">
              If the Background is not removed properly please upload brighter image*
            </footer>
          )}
          <div className="flex items-center justify-between col-span-2">
            <div className="mt-6 flex items-center   space-x-4">
              {isEditing ? (
                <>
                  <Button type="submit" variant="ghost" disabled={innerLoading}>
                    {innerLoading ? <Loader2 className="text-bottomNavBarColor animate-spin" /> : "Save"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
              <Button type="button" onClick={() => router.push("/user/parties")}>
                Back to Parties List
              </Button>
            </div>
           {!isEditing && <LogoutModal />}
          </div>
        </form>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {showBgRemovalPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Image src={logoImg || "/placeholder.svg"} alt="logo" width={30} height={30} priority />
                <h3 className="text-2xl font-semibold text-gray-800">Background Removal</h3>
              </div>

              <button
                onClick={() => setShowBgRemovalPrompt(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">Would you like Awajahi to remove the background from this image?</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button onClick={() => handleBgRemovalChoice(true)}>Yes, Remove Background</Button>
              <Button
                onClick={() => handleBgRemovalChoice(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg "
              >
                No, Keep Original
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DetailsPage

