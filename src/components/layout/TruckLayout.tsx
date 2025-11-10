'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { IDriver, ITrip, TruckModel } from '@/utils/interface';
import Link from 'next/link';
import { BsFillFuelPumpFill } from "react-icons/bs";
import { FaTruckMoving } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { RiSteering2Fill } from "react-icons/ri";
import Loading from '@/app/user/loading';
import { Button } from '../ui/button';
import { MdDelete, MdEdit, MdExpandLess, MdExpandMore } from 'react-icons/md';
import { SlOptionsVertical } from "react-icons/sl";
import { IoCloseCircleOutline, IoDocuments } from "react-icons/io5";
import { IoAddCircle } from "react-icons/io5";
import EditTruckModal from '../truck/EditTruckModal';
import { motion } from 'framer-motion';
import AddExpenseModal from '../AddExpenseModal';
import { handleAddExpense } from '@/helpers/ExpenseOperation';
import { useTruck } from '@/context/truckContext';
import { Frown } from 'lucide-react';
import { useExpenseData } from '../hooks/useExpenseData';

interface TruckLayoutProps {
    children: React.ReactNode;
}

const TruckLayout = ({ children }: TruckLayoutProps) => {
    const { truck, setTruck, loading } = useTruck()
    const {suppliers} = useExpenseData()
    const router = useRouter();
    const pathname = usePathname();
    const { truckNo } = useParams()
    const tabs = [
        { logo: <FaTruckMoving />, name: 'Trip Book', path: `/user/trucks/${truckNo}/trips` },
        { logo: <BsFillFuelPumpFill />, name: 'Fuel Book', path: `/user/trucks/${truckNo}/fuel` },
        { logo: <IoMdSettings />, name: 'Maintenance Book', path: `/user/trucks/${truckNo}/maintainence` },
        { logo: <RiSteering2Fill />, name: 'Driver and Other Expenses', path: `/user/trucks/${truckNo}/driverExpense` },
        { logo: <IoDocuments />, name: 'Documents', path: `/user/trucks/${truckNo}/documents` },
    ];


    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [openOptions, setOpenOptions] = useState(false);
    const dropdownRef = useRef<any>(null);
    const [edit, setEdit] = useState<boolean>(false);

    const [showDetails, setShowDetails] = useState(false);
    const [saving, setSaving] = useState(false)

    const toggleDetails = () => setShowDetails(!showDetails);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenOptions(false);
            }
        };

        if (openOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openOptions]);

    useEffect(() => {
        tabs.forEach(tab => {
            router.prefetch(tab.path);
        });
    }, [tabs, router]);


    const handleEdit = async (formData: any) => {
        // console.log(formData)
        setSaving(true)
        try {   
            const response = await fetch(`/api/trucks/${truckNo}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update truck');  
            }
            const data = await response.json();
            setTruck((prev : TruckModel | any)=>({
                ...prev,
                ...data.truck,
                supplierName : suppliers.find(supplier=>supplier.supplier_id === data.truck.supplier)?.name || ''
            }))
        } catch (error) {
            console.error('Error updating truck:', error);
            setError('Failed to update truck. Please try again later.');
        }finally{
            setSaving(false)
        }
        
    };

    const handleDelete = async () => {
        const res = await fetch(`/api/trucks/${truckNo}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            alert('Failed to delete truck');
            return;
        }
        const data = await res.json();
        if (data.status == 400) {
            alert(data.message);
            return;
        }
        router.push('/user/trucks');
    };
    if (loading) return <Loading />;
    if (!truck) {
        return <div className='flex items-center justify-center space-x-2'><Frown className='text-bottomNavBarColor' /> Truck Not Found</div>
    }
    if (error) return <div className="text-red-500 text-center my-4">Error: {error}</div>;


    return (
        <div className="w-full h-full p-4 bg-gray-50 rounded-lg shadow-sm min-h-screen">
            {saving && <div>
                <Loading />
                </div>}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between p-4 bg-lightOrange rounded-sm text-buttonTextColor">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            className="text-2xl font-bold"
                            onClick={() => router.push(`/user/trucks/${truckNo}`)}
                        >
                            {truckNo}
                        </Button>
                        <Button
                            variant="link"
                            className="flex items-center font-bold p-1"
                            onClick={toggleDetails}
                        >
                            {showDetails ? 'Hide Details' : 'Show Details'}
                            {showDetails ? <MdExpandLess className="ml-2" /> : <MdExpandMore className="ml-2" />}
                        </Button>
                        <div className={`transition-all duration-500 ease-in-out transform ${showDetails ? 'max-h-screen opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95 overflow-hidden'}`}>
                            <div className="bg-white p-1 rounded-lg shadow-lg border border-gray-200">
                                {/* Table Header */}
                                <div className="grid grid-cols-4 gap-6 border-b border-gray-300 pb-1 mb-1 text-gray-700 font-medium">
                                    <span className="text-center">Status</span>
                                    <span className="text-center">Type & Model</span>
                                    <span className="text-center">Ownership</span>
                                    <span className="text-center">Supplier</span>
                                </div>

                                {/* Table Content */}
                                <div className="grid grid-cols-4 gap-6 text-gray-900">
                                    {/* Status */}
                                    <div className="flex justify-center items-center space-x-2">
                                        <span className={`h-3 w-3 rounded-full ${truck?.status === 'On Trip' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                        <span className="font-semibold">{truck?.status}</span>
                                    </div>

                                    {/* Truck Type & Model */}
                                    <div className="flex flex-col items-center text-center">
                                        <span className="text-lg font-semibold">{truck?.truckType}</span>
                                        <span className="text-sm text-gray-500">{truck?.model}</span>
                                    </div>

                                    {/* Ownership */}
                                    <div className="flex justify-center items-center font-semibold text-center">
                                        {truck?.ownership}
                                    </div>

                                    {/* Supplier */}
                                    <div className="flex justify-center items-center">
                                        {truck?.supplier ? (
                                            <Button variant={'link'}>
                                                <Link href={`/user/suppliers/${truck?.supplier}/trips`} className="text-blue-600 hover:underline font-semibold">
                                                    {truck?.supplierName}
                                                </Link>
                                            </Button>
                                        ) : (
                                            <span className="text-gray-500">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <Button onClick={() => setOpenOptions(!openOptions)}>
                            <SlOptionsVertical size={20} />
                        </Button>
                        {openOptions && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md flex flex-col gap-2 p-2 z-20">
                                <Button
                                    onClick={() => {
                                        setModalOpen(true);
                                        setOpenOptions(false);
                                    }}
                                    className="justify-start"
                                >
                                    <IoAddCircle className="mr-2" /> Add Expense
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setEdit(true);
                                        setOpenOptions(false);
                                    }}
                                    className="justify-start"
                                >
                                    <MdEdit className="mr-2" /> Edit Truck
                                </Button>
                                {/* <Button
                                    variant="destructive"
                                    onClick={() => {
                                        handleDelete();
                                        setOpenOptions(false);
                                    }}
                                    className="justify-start"
                                >
                                    <MdDelete className="mr-2" /> Delete Truck
                                </Button> */}
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setOpenOptions(false);
                                    }}
                                    className="justify-start"
                                >
                                    <IoCloseCircleOutline className="mr-2" /> Close
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>



                <div className="flex border-b-2 border-lightOrange">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.path}
                            className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-t-md hover:bg-lightOrangeButtonColor ${pathname === tab.path
                                ? 'border-b-2 border-lightOrange text-buttonTextColor bg-lightOrange'
                                : 'border-transparent text-buttonTextColor hover:bottomNavBarColor hover:border-bottomNavBarColor'
                                }`}
                            prefetch={true}
                        >
                            <div className="flex items-center space-x-2">
                                {tab.logo}
                                <span>{tab.name}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-4">{children}</div>
            </div>

            <AddExpenseModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleAddExpense}
                truckNo={truckNo as string} driverId={''} categories={['Truck Expense', 'Trip Expense', 'Office Expense']} />
            <EditTruckModal
                truck={truck as TruckModel}
                isOpen={edit}
                onClose={() => setEdit(false)}
                onSave={handleEdit}
            />
        </div>
    );
};

export default TruckLayout;


