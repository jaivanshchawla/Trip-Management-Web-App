'use client'
import React, { Dispatch, useEffect, useMemo, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fuelAndDriverChargeTypes, maintenanceChargeTypes, officeExpenseTypes } from '@/utils/utilArray';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { statuses } from '@/utils/schema';
import DriverSelect from './trip/DriverSelect';
import ShopSelect from './shopkhata/ShopSelect';
import Image from 'next/image';
import PreviewDocument from './documents/PreviewDocument';
import { useToast } from './hooks/use-toast';
import { loadingIndicator } from './ui/LoadingIndicator';
import { X, FileText, ImageIcon } from 'lucide-react';
import { useExpenseData } from './hooks/useExpenseData';
import TruckExpenseWrapper from '@/app/user/expenses/page';
import AdExpenseTypeModal from './AdExpenseTypeModal';

const AddExpenseModal = ({ categories, isOpen, onClose, onSave, driverId, selected, tripId, truckNo, setDrafts }) => {

    const { trips: ctxTrips, drivers, shops, trucks, isLoading, error } = useExpenseData();

    const [formData, setFormData] = useState({
        id: selected?._id || undefined,
        trip_id: selected?.trip_id ? selected.trip_id : tripId ? tripId : '',
        partyBill: false,
        amount: selected?.amount || 0,
        date: selected?.date ? new Date(selected.date) : new Date(),
        expenseType: selected?.expenseType || '',
        notes: selected?.notes || '',
        partyAmount: 0,
        paymentMode: selected?.paymentMode || 'Cash',
        transactionId: selected?.transaction_id || '',
        driver: selected?.driver || driverId || '',
        truck: selected?.truck || truckNo || '',
        shop_id: selected?.shop_id || '',
        url: selected?.url ? selected?.url : ''
    });

    const pathname = usePathname()
    const truckpage = pathname === '/user/expenses/truckExpense' || pathname.startsWith('/user/trucks/')
    const trippage = pathname === '/user/expenses/tripExpense' || pathname.startsWith('/user/trips/')
    const officepage = pathname === '/user/expenses/officeExpense'
    const draftpage = pathname === '/user/expenses/draft'
    const { toast } = useToast()


    const [selectedCategory, setSelectedCategory] = useState(truckpage ? 'Truck Expense' : trippage ? 'Trip Expense' : officepage ? 'Office Expense' : '');
    const [trip, setTrip] = useState()
    const [file, setFile] = useState()
    const [fileUrl, setFileUrl] = useState(selected?.url || null);
    const [modalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [expenseTypeModal, setExpenseTypeModal] = useState(false)
    const [userExpenseTypes, setUserExpenseTypes] = useState([])
    const modalRef = useRef(null)

    const fetchUserExpenseTypes = async () => {
        try {
            const res = await fetch('/api/expenses/expenseType')
            const data = await res.json()
            setUserExpenseTypes(data.expenseTypes)

        } catch (error) {
            toast({
                description: "Failed to fetch some expense types",
                variant: "destructive"
            })
        }
    }

    useEffect(() => {
        fetchUserExpenseTypes()
    }, [])

    useEffect(() => {
        if (truckNo) {
            setSelectedCategory('Trip Expense');
        }
    }, [truckNo])

    const trips = useMemo(() => {
        let initialTrips = [...ctxTrips]
        if (tripId) {
            initialTrips = initialTrips.filter(trip => trip.trip_id === tripId)
        } else if (formData.truck && selectedCategory === 'Trip Expense') {
            initialTrips = initialTrips.filter(trip => trip.truck === formData.truck)
        }
        return initialTrips
    }, [formData.truck, selectedCategory, tripId])

    const filteredTrucks = useMemo(() => {
        if (formData.trip_id) {
            const selectedTrip = trips.find(t => t.trip_id === formData.trip_id);
            if (selectedTrip) {
                return trucks?.filter(truck => truck.truckNo === selectedTrip.truck) || [];
            }
        } else if (truckNo) {
            return trucks?.filter(truck => truck.truckNo === truckNo) || [];
        }
        return trucks || [];
    }, [trucks, formData.trip_id, trips, truckNo])

    const savetoDraft = async () => {
        setLoading(true)
        try {
            const formdata = new FormData()
            if (file) {
                formdata.append('file', file);
            }
            formdata.append('expense', JSON.stringify(formData))
            const res = await fetch('/api/expenses/draft', {
                method: 'POST',
                body: formdata
            })
            if (!res.ok) throw new Error('Failed to save draft')
            const data = await res.json()
            setDrafts((prev) => [
                {
                    ...data.expense,
                    driverName: data.expense.driver ? drivers.find((driver) => driver.driver_id === data.expense.driver)?.driverName : '',
                    shopName: data.expense.shop_id ? shops.find((shop) => shop.id === data.expense.shop_id)?.shop_id : ''
                },
                ...prev,
            ])
            toast({
                description: 'saved draft',
            })
        } catch (error) {
            toast({
                description: 'Failed to save draft',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
            onClose()
        }
    }

    const saveDraft = async (id) => {
        if (!id) {
            toast({
                description: 'No draft selected',
                variant: 'destructive'
            })
        }
        setLoading(true)
        try {
            const formdata = new FormData()
            if (file) {
                formdata.append('file', file);
            }
            formdata.append('expense', JSON.stringify(formData))
            const res = await fetch(`/api/expenses/draft/${id}`, {
                method: 'PUT',
                body: formdata
            })
            if (!res.ok) throw new Error('Failed to save draft')
            const data = await res.json()
            if (data.status === 200) {
                setDrafts((prev) => prev.map(exp => exp._id === id ? {
                    ...data.expense,
                    driverName: data.expense.driver ? drivers.find((driver) => driver.driver_id === data.expense.driver)?.driverName : '',
                    shopName: data.expense.shop_id ? shops.find((shop) => shop.id === data.expense.shop_id)?.shop_id : ''
                } : exp))
            }
        } catch (error) {
            toast({
                description: 'Failed to save draft',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
            onClose()
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        setFile(selectedFile);

        if (selectedFile) {
            setFileUrl(URL.createObjectURL(selectedFile));
        } else if (typeof e.target.value === 'string' && e.target.value.startsWith('http')) {
            setFileUrl(e.target.value);
        } else {
            setFileUrl(null);
        }
    };


    const removeFile = () => {
        setFile(null);
        setFileUrl(null);
    };

    useEffect(() => {
        if (!selected) return;
        setFormData({
            id: selected?._id || undefined,
            trip_id: selected?.trip_id ? selected.trip_id : tripId ? tripId : '',
            partyBill: false,
            amount: selected?.amount || 0,
            date: selected?.date ? new Date(selected.date) : new Date(),
            expenseType: selected?.expenseType || '',
            notes: selected?.notes || '',
            partyAmount: 0,
            paymentMode: selected?.paymentMode || 'Cash',
            transactionId: selected?.transaction_id || '',
            driver: selected?.driver || '',
            truck: selected?.truck || truckNo || '',
            shop_id: selected?.shop_id || '',
        });
        if (selected.url) {
            setFileUrl(selected.url);
        }
    }, [selected]);

    const expenseTypes = useMemo(() => {
        setFormData((prev) => ({ ...prev, expenseType: "" }))
        if (selectedCategory === 'Truck Expense') return Array.from(maintenanceChargeTypes)
        else if (selectedCategory === 'Trip Expense') return Array.from(fuelAndDriverChargeTypes)
        else if (selectedCategory === 'Office Expense') return Array.from(officeExpenseTypes)
        if (selected) {
            if ((!selected.trip_id || selected.trip_id === '') && selected.truck) {
                setSelectedCategory('Truck Expense')
                return Array.from(maintenanceChargeTypes)
            }
            if (selected.trip_id && selected.trip_id !== '') {
                setSelectedCategory('Trip Expense')
                return Array.from(fuelAndDriverChargeTypes)
            }
            if ((!selected.trip_id || selected.trip_id === '') && (!selected.truck || selected.truck === '')) {
                setSelectedCategory('Office Expense')
                return officeExpenseTypes
            }
        }

        return []

    }, [selectedCategory, selected])

    const paymentModes = useMemo(() => {
        if (selectedCategory !== 'Office Expense') {
            return ['Cash', 'Online', 'Paid By Driver', 'Credit']
        } else return ['Cash', 'Online', 'Credit']
    }, [selectedCategory])




    useEffect(() => {
        if (formData.paymentMode === 'Paid By Driver' && trip) {
            setFormData((prevData) => ({ ...prevData, driver: trip.driver }));
        }
        if (formData.paymentMode !== 'Paid By Driver' && formData.driver) {
            setFormData((prevData) => ({ ...prevData, driver: '' }));
        }
        if (formData.paymentMode !== 'Credit' && formData.shop_id) {
            setFormData((prevData) => ({ ...prevData, shop_id: '' }));
        }
    }, [trip, formData.paymentMode])

    useEffect(() => {
        if (formData.truck && pathname === '/user/expenses/tripExpense') {
            let tempTrips = trips?.filter((trip) => trip.truck === formData.truck)
            setFormData((prev) => ({
                ...prev,
                trip_id: tempTrips ? tempTrips[0]?.trip_id : ''
            }))
            setTrip(tempTrips ? tempTrips[0] : undefined)
        }
    }, [formData.truck])

    const handleSelectChange = (name, value) => {
        setFormData((prevData) => {
            let updatedData = { ...prevData, [name]: value };

            if (name === 'trip_id') {
                const selectedTrip = trips?.find((trip) => trip.trip_id === value);
                if (selectedTrip && selectedTrip.truck) {
                    updatedData = { ...updatedData, truck: selectedTrip.truck };
                }
            }

            return updatedData;
        });
    };



    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? !formData.partyBill : value });
    };

    const handleSave = () => {
        if (selectedCategory === 'Truck Expense') setFormData((prev) => ({ ...prev, trip_id: '' }))
        else if (selectedCategory === 'Office Expense') setFormData((prev) => ({ ...prev, trip_id: '', truck: '' }))
        const missingFields = [];

        if (!formData.amount) missingFields.push("Amount");
        if (!formData.date) missingFields.push("Date");
        if (!formData.expenseType) missingFields.push("Expense Type");
        if (selectedCategory === 'Truck Expense' && !formData.truck) missingFields.push("Truck");
        if (selectedCategory === 'Trip Expense' && !formData.trip_id) missingFields.push("Trip");
        if (formData.paymentMode === 'Credit' && !formData.shop_id) missingFields.push("Shop");
        if (formData.paymentMode === 'Paid By Driver' && !formData.driver) missingFields.push("Driver");

        if (missingFields.length > 0) {
            toast({
                description: `Please fill in the following fields: ${missingFields.join(", ")}`,
                variant: 'warning'
            });
            return
        }

        if (formData.paymentMode !== 'Paid By Driver') setFormData(prev => ({ ...prev, driver: '' }))
        if (formData.paymentMode !== 'Credit') setFormData(prev => ({ ...prev, shop_id: '' }))


        if (selected) {
            onSave(formData, selected._id, file);
        } else {
            onSave(formData, '', file);
        }

        onClose();
    };

    const handleFocus = (e) => {
        if (e.target.value === '0') {
            handleChange({ target: { name: e.target.name, value: '' } });
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-class"
        >
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: [0, 0.71, 0.2, 1.01]
                    }}
                    ref={modalRef}
                    className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[700px] overflow-y-auto thin-scrollbar"
                >
                    <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expense Receipt
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-30 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                                    <p className="text-xs text-gray-500">PDF, PNG, JPG or GIF (MAX. 800x400px)</p>
                                </div>
                                <input
                                    id="dropzone-file"
                                    type="file"
                                    className="hidden"
                                    accept="application/pdf,image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>

                    {fileUrl && (
                        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">File Preview</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={removeFile}
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                {(fileUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null || !fileUrl.endsWith('.pdf')) ? (
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={fileUrl}
                                            alt="Preview"
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-t-lg"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 flex items-center justify-center bg-gray-200">
                                        <FileText className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <p className="text-sm text-gray-600 truncate">
                                        {file ? file.name : 'Document'}
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() => setModalOpen(true)}
                                    >
                                        Open Document
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <PreviewDocument 
                        isOpen={modalOpen} 
                        onClose={() => setModalOpen(false)} 
                        documentUrl={fileUrl}
                        documentName={file?.name || selected?.filename || 'document'}
                    />


                    <div className='flex justify-between gap-2'>
                        {categories &&
                            <div className="mb-4 w-full">
                                <label className="block text-sm font-medium text-gray-700">Select Category*</label>
                                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue>{selectedCategory || 'Select Category'}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        }
                        <div className="mb-4 w-full">
                            <label className="block text-sm font-medium text-gray-700">Expense Type*</label>
                            <Select value={formData.expenseType} onValueChange={(value) => handleSelectChange('expenseType', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue>{formData.expenseType || 'Select Expense Type'}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>


                                    {selectedCategory && <>
                                        <Button className=' w-full my-2' onClick={() => {
                                            setExpenseTypeModal(true)
                                        }
                                        }>Add Your Own</Button>
                                        <p className='p-1 text-gray-500 text-xs border-b border-gray-300 mb-1'>Added by you</p>
                                        {userExpenseTypes?.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                        <p className='p-1 text-gray-500 text-xs border-b border-gray-300 mb-1'>By Awajahi</p>
                                        {expenseTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </>}

                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='flex items-center space-x-2 '>
                        <div className="mb-4 w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Amount*</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="mb-4 w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Date*</label>
                            <input
                                type="date"
                                name="date"
                                value={new Date(formData.date).toISOString().split('T')[0]}
                                onChange={handleChange}
                                onClick={(e) => e.target.showPicker()}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {selectedCategory !== 'Office Expense' && <div className='flex items-center space-x-2 '>
                        {selectedCategory === 'Trip Expense' && <div className="mb-4 w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Select Trip*</label>
                            <Select value={formData.trip_id} defaultValue={formData.trip_id} onValueChange={(value) => handleSelectChange('trip_id', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder='Select Trip' />
                                </SelectTrigger>
                                <SelectContent>
                                    {trips?.map((trip) => (
                                        <SelectItem key={trip.trip_id} value={trip.trip_id}>
                                            <div className='flex items-center space-x-2 w-full'>
                                                <span className='font-semibold w-1/2'>{trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]}</span>
                                                <div className="flex flex-col items-center space-x-2 w-1/2">
                                                    <span>{statuses[trip.status]}</span>
                                                    <div className="relative w-full bg-gray-200 h-1 rounded">
                                                        <div
                                                            className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`}
                                                            style={{ width: `${(trip.status / 4) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <p className='whitespace-nowrap'>{trip.LR}</p>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>}

                        <div className="mb-4 w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Select Truck*</label>
                            <Select value={formData.truck} onValueChange={(value) => handleSelectChange('truck', value)}>
                                <SelectTrigger className="w-full text-black" value={formData.truck}>
                                    <SelectValue placeholder='Select Truck' />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredTrucks?.map((truck) => (
                                        <SelectItem key={truck.truckNo} value={truck.truckNo}>
                                            <span>{truck.truckNo}</span>
                                            <span
                                                className={`ml-2 p-1 rounded ${truck.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                            >
                                                {truck.status}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                    </div>}

                    <label className="block text-sm font-medium text-gray-700">Payment Mode*</label>
                    <div className="flex flex-row w-full justify-start gap-3 mb-3">
                        {paymentModes.map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={`p-2 rounded-md ${formData.paymentMode === type ? 'bg-bottomNavBarColor text-white' : 'bg-lightOrangeButtonColor text-black'}`}
                                onClick={() => handleChange({ target: { name: 'paymentMode', value: type } })}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {formData.paymentMode === 'Paid By Driver' && (
                        <DriverSelect
                            drivers={drivers || []}
                            formData={formData}
                            handleChange={handleChange}
                            setFormData={setFormData}
                        />
                    )}

                    {formData.paymentMode === 'Online' && (
                        <div className="mb-4">
                            <input
                                type="text"
                                name="transactionId"
                                value={formData.transactionId}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Transaction ID"
                            />
                        </div>
                    )}

                    {formData.paymentMode === 'Credit' && (
                        <ShopSelect
                            shops={shops} // Pass the shops array as a prop
                            formData={formData}
                            handleChange={handleChange}
                            setFormData={setFormData}
                        />
                    )}

                    {formData.partyBill && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Party Amount</label>
                            <input
                                type="number"
                                name="partyAmount"
                                value={formData.partyAmount}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className={`${!selected || (draftpage && selected) ? 'flex justify-between' : ''}`}>
                        {!selected && <Button variant={'outline'} disabled={loading} onClick={() => savetoDraft()}>{loading ? loadingIndicator : 'Save as Draft'}</Button>}
                        {draftpage && selected && <Button variant={'outline'} disabled={loading} onClick={() => saveDraft(selected?._id)}>{loading ? loadingIndicator : 'Save Draft'}</Button>}
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" disabled={loading} onClick={() => {
                                onClose()
                                setFormData({
                                    id: undefined,
                                    trip_id: '',
                                    partyBill: false,
                                    amount: 0,
                                    date: new Date(Date.now()),
                                    expenseType: '',
                                    notes: '',
                                    partyAmount: 0,
                                    paymentMode: 'Cash',
                                    transactionId: '',
                                    driver: '',
                                    truck: '',
                                    shop_id: '',
                                    url: ''
                                })
                                setSelectedCategory('')
                                setFile(null)
                                setFileUrl('')
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                                Save
                            </Button>
                        </div>
                    </div>

                </motion.div>
                <AdExpenseTypeModal open={expenseTypeModal} setOpen={setExpenseTypeModal} setExpenses={setUserExpenseTypes} />
            </div>
    );
};

export default AddExpenseModal;

