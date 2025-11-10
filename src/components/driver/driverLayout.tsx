"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, FileText, Pencil, Truck, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { formatNumber } from "@/utils/utilArray"
import type { IDriver } from "@/utils/interface"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import Loading from "@/app/user/loading"
import { useDriver } from "@/context/driverContext"
import dynamic from "next/dynamic"
import { useToast } from "../hooks/use-toast"

interface DriverLayoutProps {
  driverId: string
  onDriverUpdate: (driver: IDriver) => void
  children: React.ReactNode
}

const DriverModal = dynamic(() => import('@/components/driver/driverModal'), { ssr: false })
const EditDriverModal = dynamic(() => import('@/components/driver/editDriverModal'), { ssr: false })

export default function DriverLayout({ driverId, onDriverUpdate, children }: DriverLayoutProps) {
  const { driver, setDriver,loading } = useDriver()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"gave" | "got" | null>(null)
  const [edit, setEdit] = useState(false)
  const {toast} = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
  };

  const handleConfirm = async (amount: number, reason: string, date: string) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          got: modalType === 'got' ? amount : 0,
          gave: modalType === 'gave' ? amount : 0,
          reason,
          date,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver');
      }

      const data = await response.json();

      // Update the driver state
      setDriver((prev: any) => {
        const latestAccount = data.accounts[data.accounts.length - 1]; // Get the last account entry from the updated response
        const newBalance =
          prev.balance + (latestAccount.got || 0) - (latestAccount.gave || 0); // Update balance correctly

        return {
          ...prev,
          driverExpAccounts: [latestAccount, ...prev.driverExpAccounts], // Add the latest entry to the accounts
          balance: newBalance, // Set the updated balance
        };
      });

      closeModal(); // Close the modal after confirming
    } catch (error: any) {
      console.error('Failed to update driver:', error);
      // setError(error.message); // Set error message if something goes wrong
      toast({
        description: 'Internal Server Error',
        variant: 'destructive'
      })
    }
  };

  const handleEditDriver = async (updatedDriver: Partial<IDriver>) => {

    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'PATCH', // Use PATCH to partially update the driver
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDriver),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver');
      }
      const data = await response.json();

      setDriver((prev : IDriver)=>({
        ...prev,
        ...data.driver
      }))
      setEdit(false);
      toast({
        description: 'Driver Updated Successfully',
      })
    } catch (error: any) {
      toast({
        description: 'Internal Server Error',
        variant: 'destructive'
      })
    }
  };

  const handleDeleteDriver = async () => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400) {
          alert(data.message);
          return;
        }
        throw new Error(data.message || 'Failed to delete driver');
      }

      alert('Driver Removed Successfully');
      router.push('/user/drivers');
    } catch (error: any) {
      console.error('Failed to delete driver:', error);
      toast({
        description: 'Internal Server Error',
        variant: 'destructive'
      })
      // setError(error.message);
    }
  };



  const tabs = [
    { icon: <Truck className="h-4 w-4" />, name: "Driver Accounts", path: `/user/drivers/${driverId}` },
    { icon: <Calendar className="h-4 w-4" />, name: "Trips", path: `/user/drivers/${driverId}/trips` },
    { icon: <FileText className="h-4 w-4" />, name: "Documents", path: `/user/drivers/${driverId}/documents` },
  ]

  if (loading) return <Loading />
  if (!driver) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Driver not found</div>
  }

  return (
    <div className="">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{driver.name}</h1>
              <span className={`text-sm px-3 py-1 rounded-full ${driver.status === 'On Trip' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{driver?.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalOpen(true)
                  setModalType("got")
                }}
              >
                Got Money
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalOpen(true)
                  setModalType("gave")
                }}
              >
                Gave Money
              </Button>
              <Button variant={'ghost'} onClick={() => setEdit(true)}>
                <Pencil size={15} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="font-medium text-foreground">Contact</div>
                {driver.contactNumber}
              </div>
              <div>
                <div className="font-medium text-foreground">License No</div>
                {driver.licenseNo}
              </div>
              <div>
                <div className="font-medium text-foreground">Aadhar No</div>
                {driver.aadharNo}
              </div>
              <div>
                <div className="font-medium text-foreground">Last Joining</div>
                {new Date(driver.lastJoiningDate).toLocaleDateString("en-IN")}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-lg">
              <span className="font-medium">Balance:</span>
              <span className={driver.balance >= 0 ? "text-success" : "text-destructive"}>
                ₹{formatNumber(Math.abs(driver.balance))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex border-b-2 border-lightOrange mb-4 mt-2 overflow-x-auto">
        {tabs.map((tab) => (
          <a
            key={tab.name}
            href={tab.path}
            className={`px-4 py-2 font-semibold rounded-t-md transition-all duration-300 ${pathname === tab.path ? 'border-b-2 border-lightOrange text-buttonTextColor bg-lightOrange' : 'hover:bg-lightOrangeButtonColor'}`}
          >
            <div className="flex items-center space-x-2">{tab.icon}<span>{tab.name}</span></div>
          </a>
        ))}
      </div>

      <div className="mt-4">{children}</div>

      <DriverModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        onConfirm={handleConfirm}
      />

      {edit && (
        <EditDriverModal
          driverId={driverId}
          onCancel={() => setEdit(false)}
          handleEdit={handleEditDriver}
          name={driver.name}
          contactNumber={driver.contactNumber}
        />
      )}
    </div>
  )
}

