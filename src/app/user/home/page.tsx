'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowRightLong, FaRegCircleUser, FaRoute, FaTruck } from 'react-icons/fa6';
import { IoNotificationsOutline } from "react-icons/io5";
import Link from 'next/link';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, CartesianGrid, Cell, Label, Legend, Pie, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useToast } from '@/components/hooks/use-toast';
import Loading from '../loading';
import { useAnimatedNumber } from '@/components/hooks/useAnimatedNumber';
import { useExpenseData } from '@/components/hooks/useExpenseData';
import dynamic from 'next/dynamic';
import { useReminder } from '@/context/reminderContext';
import { Button } from '@/components/ui/button';
import TruckDocumentUpload from '@/components/documents/TruckDocumentUpload';
import TripDocumentUpload from '@/components/documents/TripDocumentUpload';
import DriverDocumentUpload from '@/components/documents/DriverDocumentUpload';
import CompanyDocumentUpload from '@/components/documents/CompanyDocumentUpload';
import OtherDocumentUpload from '@/components/documents/OtherDocumentUpload';
import { motion } from 'framer-motion';
import { PiSteeringWheel } from 'react-icons/pi';
import { X } from 'lucide-react';
import { BiCloudUpload } from 'react-icons/bi';
import { GoOrganization } from 'react-icons/go';
import { useRouter } from 'next/navigation';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import { handleAddExpense } from '@/helpers/ExpenseOperation';
import { IExpense } from '@/utils/interface';
import Image from 'next/image';
import biltyImg from '@/assets/bilty-home-icon.png'
import fmImg from '@/assets/fm-home-icon.png'
import loadingSlipImg from '@/assets/loading-slip-home-icon.png'
import quotationImg from '@/assets/quotation-home-icon.png'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { statuses } from '@/utils/schema';
import { formatNumber } from '@/utils/utilArray';

const piechartConfig: ChartConfig = {
  totalAmount: {
    label: "Expenses",
    color: "#EA3A88",
  },
  Truck: {
    label: "Truck",
    color: "#5687F2",
  },
  Trip: {
    label: "Trip",
    color: "#60CA3B",
  },
  Office: {
    label: "Office",
    color: "#EA3A88",
  },
}

const chartConfig: ChartConfig = {
  count: {
    label: "Number of Trips :",
    color: "#3190F5",
  },
}

const documentTypes = [
  {
    title: 'Trip Documents',
    link: '/user/documents/tripDocuments',
    icon: <FaRoute className='text-bottomNavBarColor' size={40} />
  },
  {
    title: 'Driver Documents',
    link: '/user/documents/driverDocuments',
    icon: <PiSteeringWheel className='text-bottomNavBarColor' size={40} />
  },
  {
    title: 'Lorry Documents',
    link: '/user/documents/truckDocuments',
    icon: <FaTruck className='text-bottomNavBarColor' size={40} />
  },
  {
    title: 'Company Documents',
    link: '/user/documents/companyDocuments',
    icon: <GoOrganization className='text-bottomNavBarColor' size={40} />
  },
  {
    title: 'Quick Uploads',
    link: '/user/documents/otherDocuments',
    icon: <BiCloudUpload className='text-bottomNavBarColor' size={40} />
  }
];

const RecentActivities = dynamic(() => import('@/components/RecentActivites'), { ssr: false })
const Notification = dynamic(() => import('@/components/Notification'), { ssr: false })
const InvoiceForm = dynamic(() => import('@/components/trip/tripDetail/TripFunctions/InvoiceForm'), { ssr: false, loading: () => <div>{loadingIndicator}</div> })
const AddExpenseModal = dynamic(() => import('@/components/AddExpenseModal'), {
  ssr: false,
  loading: () => <div>{loadingIndicator}</div>
})


const TripSelect = ({ tripId, setTripId, trips }: { tripId: string, setTripId: React.Dispatch<React.SetStateAction<string>>, trips: any[] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrips = useMemo(() => {
    if (!trips || trips.length === 0) return [];
    let filtered = [...trips];
    if (searchTerm) {
      const lowercaseQuery = searchTerm.toLowerCase();
      filtered = trips.filter((trip) =>
        trip.LR.toLowerCase().includes(lowercaseQuery) ||
        trip.partyName.toLowerCase().includes(lowercaseQuery) ||
        trip.route.origin.toLowerCase().includes(lowercaseQuery) ||
        trip.route.destination.toLowerCase().includes(lowercaseQuery) ||
        new Date(trip.startDate).toLocaleDateString().includes(lowercaseQuery) ||
        trip.amount.toString().includes(lowercaseQuery) ||
        trip.truckHireCost.toString().includes(lowercaseQuery) ||
        trip.balance.toString().includes(lowercaseQuery) ||
        trip.truck.toLowerCase().includes(lowercaseQuery)
      );
    }
    return filtered;
  }, [trips, searchTerm]);

  return (
    <div className="mb-4">
      <label className="block text-sm text-gray-700">Trip*</label>
      <Select name="tripId" defaultValue={tripId} onValueChange={(value) => setTripId(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Trip" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {filteredTrips && filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => (
              <SelectItem key={trip.trip_id} value={trip.trip_id} className='border rounded-md'>
                <div className="grid grid-cols-2 gap-2 p-2 space-x-2 ">
                  {/* Route and Party Name */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700 whitespace-nowrap">
                      {trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]}
                    </span>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      {trip.partyName}
                    </span>
                  </div>

                  {/* Status and Progress Bar */}
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-600">
                      Status: {statuses[trip.status as number]}
                    </span>
                    <div className="relative w-full h-1 bg-gray-200 rounded">
                      <div
                        className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0
                          ? 'bg-red-500'
                          : trip.status === 1
                            ? 'bg-yellow-500'
                            : trip.status === 2
                              ? 'bg-blue-500'
                              : trip.status === 3
                                ? 'bg-green-500'
                                : 'bg-green-800'
                          }`}
                        style={{ width: `${(trip.status as number / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* LR Number and Start Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      LR: {trip.LR}
                    </span>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      Date: {new Date(trip.startDate).toISOString().split('T')[0]}
                    </span>
                  </div>

                  {/* Balance and Truck Details */}
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      Balance: ₹{formatNumber(trip.balance)}
                    </span>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      Truck: {trip.truck}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-gray-500">No Trips found</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });

const Page = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { dashboardData: data, trips, isLoading, refetchDashboard } = useExpenseData()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const notificationIconRef = useRef<HTMLDivElement>(null);
  const { reminders } = useReminder()
  const [open, setOpen] = useState(false)
  const [tripOpen, setTripOpen] = useState(false);
  const [truckOpen, setTruckOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [InvoiceOpen, setInvoiceOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [tripId, setTripId] = useState<string>('')

  const totalCost = useMemo(() => {
    return data?.expenses?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0
  }, [data])

  const totalTrip = useMemo(() => {
    return data?.trips?.reduce((acc, curr) => acc + curr.count, 0) || 0
  }, [data])

  const totalRecievable = useMemo(() => {
    return trips?.reduce((acc, curr) => acc + curr.balance, 0)
  }, [trips])

  const animatedTotalTrip = useAnimatedNumber(totalTrip);
  const animatedTotalCost = useAnimatedNumber(totalCost);
  const animatedTotalReceivable = useAnimatedNumber(totalRecievable);
  const animatedProfit = useAnimatedNumber(data?.profit || 0);


  const openModal = (title: string) => {
    setOpen(false)
    switch (title) {
      case 'Trip Documents':
        setTripOpen(!tripOpen);
        break;
      case 'Truck Documents':
        setTruckOpen(!truckOpen);
        break;
      case 'Driver Documents':
        setDriverOpen(!driverOpen);
        break;
      case 'Company Documents':
        setCompanyOpen(!companyOpen);
        break;
      case 'Quick Uploads':
        setOtherOpen(!otherOpen);
        break;
      default:
        break;
    }
  }

  const handleExpense = async (expense: IExpense | any, id?: string, file?: File | null) => {
    try {
      const data = await handleAddExpense(expense, file, toast)

      toast({
        description: `Expense added successfully`
      })
    } catch (error) {
      toast({
        description: 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setExpenseOpen(false);
    }
  };


  useEffect(() => {
    refetchDashboard()
  }, [refetchDashboard])

  if (isLoading) {
    return <Loading />
  }

  if (!data) {
    return <div className="flex items-center justify-center h-screen">No data available</div>
  }

  return (
    <div className='w-full h-screen bg-white overflow-hidden flex flex-col'>
      <div className='text-black border-b-2 border-gray-400 flex justify-between p-4 xl:px-8 xl:py-2'>
        <h1 className='text-2xl font-semibold'>
          Hey!
        </h1>
        <div className='flex items-center gap-4'>
          <div ref={notificationIconRef} className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              <IoNotificationsOutline size={24} />
              {reminders?.tripReminders?.length + reminders?.truckReminders?.length + reminders?.driverReminders?.length > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {reminders?.tripReminders?.length + reminders?.truckReminders?.length + reminders?.driverReminders?.length}
                </span>
              )}
            </button>
            <Notification
              tripReminders={reminders?.tripReminders || []}
              truckReminders={reminders?.truckReminders || []}
              driverReminders={reminders?.driverReminders || []}
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>
          <Link href={'/user/profile/details'}>
            <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors duration-200">
              <FaRegCircleUser size={24} className='font-normal' />
            </div>
          </Link>
        </div>
      </div>

      <div className='flex h-[calc(100vh-64px)] overflow-hidden'>
        <div className='flex-grow overflow-y-auto border-r border-gray-300 p-4 xl:p-10 xl:py-2 no-scrollbar'>
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-10 mb-8'>
            <div className='py-3 text-white bg-bottomNavBarColor text-center rounded-xl shadow-xl flex flex-col gap-2'>
              <p className="text-sm">Total Trips</p>
              <p className='text-xl xl:text-2xl font-semibold'>{animatedTotalTrip}</p>
            </div>
            <div className='py-3 text-white bg-bottomNavBarColor text-center rounded-xl shadow-xl flex flex-col gap-2'>
              <p className="text-sm">Total Expenses</p>
              <p className='text-xl xl:text-2xl font-semibold'>₹{animatedTotalCost}</p>
            </div>
            <div className='py-3 text-white bg-bottomNavBarColor text-center rounded-xl shadow-xl flex flex-col gap-2'>
              <p className="text-sm">Accounts Receivable</p>
              <p className='text-xl xl:text-2xl font-semibold'>₹{animatedTotalReceivable}</p>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-2 grid-cols-1">
            {/* Trips Section */}
            <div className="bg-white rounded-xl border shadow-md p-4">
              <h2 className="text-xl font-semibold mb-4">Trips</h2>
              {data?.trips?.length > 0 ?
                <ChartContainer config={chartConfig} className="h-[200px] w-full" title="Trips per month">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.trips} barSize={15} margin={{ left: -20, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="monthYear"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                        fontSize={10}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill={chartConfig.count.color} radius={[8, 8, 8, 8]} width={5} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                :
                <div className="flex items-center justify-center ">
                  <p className="text-center text-gray-500 text-xs">Your monthly trips</p>   
                </div>

              }

            </div>

            {/* Expenses Section */}
            <div className="bg-white rounded-xl border shadow-md p-4">
              <h2 className="text-xl font-semibold mb-4">Expenses</h2>
              {
                data.expenses.length > 0 ?
                  <ChartContainer
                    config={piechartConfig}
                    className="mx-auto aspect-square h-[200px] w-full"
                  >
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend
                          content={<ChartLegendContent className="flex flex-col items-start xl:items-end" />}
                          iconSize={25}
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                        />
                        <Pie
                          data={data.expenses}
                          dataKey="totalAmount"
                          nameKey="_id"
                          innerRadius="60%"
                          outerRadius="100%"
                          paddingAngle={2}
                        >
                          {data.expenses.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                piechartConfig[entry._id as keyof typeof piechartConfig]?.color ||
                                piechartConfig.totalAmount.color
                              }
                            />
                          ))}
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      className="fill-foreground text-xl font-semibold"
                                    >
                                      ₹{totalCost.toLocaleString("en-IN")}
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 20}
                                      className="fill-muted-foreground text-xs"
                                    >
                                      Total Expense
                                    </tspan>
                                  </text>
                                );
                              }
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer> :
                  <div className='flex items-center justify-center text-gray-500 text-xs'>
                    <p className='text-center'>Your Expense Analysis</p>
                  </div>
              }

            </div>
          </div>
          <div className='p-2 bg-gray-100 rounded-xl shadow-sm mt-8'>
            <h2 className='font-semibold text-lg xl:text-xl text-black p-4'>Generate Documents</h2>
            <div className='grid gap-4 grid-cols-2 xl:grid-cols-4 py-4 px-4'>
              <Button variant='ghost' className='w-full h-full' onClick={() => toast({
                description: 'Functionality under development',
                variant: 'warning'
              })}>
                <div className='flex flex-col items-center justify-center h-full'>
                  <Image src={quotationImg} alt='Quotation' width={80} height={80} />
                  <p className='text-center text-sm mt-2'>Quotation</p>
                </div>
              </Button>
              <Button variant='ghost' className='w-full h-full' onClick={() => toast({
                description: 'Functionality under development',
                variant: 'warning'
              })}>
                <div className='flex flex-col items-center justify-center h-full'>
                  <Image src={loadingSlipImg} alt='Quotation' width={80} height={80} />
                  <p className='text-center text-sm mt-2'>Loading Slip</p>
                </div>
              </Button>
              <Dialog>
                <DialogTrigger>
                  <Button variant='ghost' className='w-full h-full '>
                    <div className='flex flex-col items-center justify-center h-full'>
                      <Image src={biltyImg} alt='Quotation' width={80} height={80} />
                      <p className='text-center text-sm mt-2'>Bilty</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl'>
                  <h2>Select Trip</h2>
                  <TripSelect trips={trips} tripId={tripId} setTripId={setTripId} />
                  {tripId && <div className='flex justify-end'>
                    <Link href={{
                      pathname: `/user/trips/${tripId}`,
                      query: { open: 'bilty' },
                    }}>
                      <Button>
                        <FaArrowRightLong />
                      </Button>
                    </Link>
                  </div>}

                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger>
                  <Button variant='ghost' className='w-full h-full'>
                    <div className='flex flex-col items-center justify-center h-full'>
                      <Image src={fmImg} alt='Frieght Memo' width={80} height={80} />
                      <p className='text-center text-sm mt-2'>Frieght Memo</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl'>
                  <h2>Select Trip</h2>
                  <TripSelect trips={trips} tripId={tripId} setTripId={setTripId} />
                  {tripId && <div className='flex justify-end'>
                    <Link href={{
                      pathname: `/user/trips/${tripId}`,
                      query: { open: 'fm' },
                    }}>
                      <Button>
                        <FaArrowRightLong />
                      </Button>
                    </Link>
                  </div>}

                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className='grid gap-8 grid-cols-2 xl:grid-cols-4 mt-8 py-4 border-b-2 border-gray-200'>
            <Button onClick={() => router.replace('/user/trips/create')}>
              Add Trip
            </Button>
            <Button onClick={() => setOpen(true)}>
              Add Document
            </Button>
            <Button onClick={() => setExpenseOpen(true)}>
              Add Expense
            </Button>
            <Button onClick={() => setInvoiceOpen(true)}>
              Generate Invoice
            </Button>
          </div>
        </div>
        <div className='w-1/3 xl:w-1/4 xl:min-w-[300px] p-4 xl:p-8 overflow-y-auto'>
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <div className='border-2 border-gray-300 rounded-xl p-4 bg-white shadow-md'>
            <div className='flex items-center justify-between text-sm text-gray-500 mb-2'>
              <p>Your Profit</p>
              <p>{new Date(Date.now()).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric'
              })}</p>
            </div>
            <p className='text-3xl font-semibold'>₹{animatedProfit}</p>
          </div>
          <div className='mt-8'>
            <h3 className='font-semibold text-xl mb-2'>
              Recent Activities
            </h3>
            <RecentActivities data={data} />
          </div>
        </div>
      </div>



      {
        open &&
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Select Document Type</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-5 gap-6">
              {documentTypes.map(({ title, icon }) => (
                <Button
                  key={title}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-32 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => openModal(title)}
                >
                  {/* Replace with your actual icon component */}
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="text-sm font-medium">{title.split(' ')[0]}</p>
                </Button>
              ))}
            </div>


          </motion.div>

        </div>
      }
      <TruckDocumentUpload open={truckOpen} setOpen={setTruckOpen} />



      <TripDocumentUpload open={tripOpen} setOpen={setTripOpen} />


      <DriverDocumentUpload open={driverOpen} setOpen={setDriverOpen} />


      <CompanyDocumentUpload open={companyOpen} setOpen={setCompanyOpen} />


      <OtherDocumentUpload open={otherOpen} setOpen={setOtherOpen} />
      <InvoiceForm open={InvoiceOpen} setOpen={setInvoiceOpen} />
      <AddExpenseModal
        isOpen={expenseOpen}
        onClose={() => {
          setExpenseOpen(false);
        }}
        driverId=''
        onSave={handleExpense}
        categories={['Truck Expense', 'Trip Expense', 'Office Expense']}

      />
    </div>
  );
};

export default Page;

