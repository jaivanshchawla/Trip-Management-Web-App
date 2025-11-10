// components/CreateTruck.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { minitruck, openBody, closedContainer, trailer, truckTypes, truckTypesIcons } from '@/utils/utilArray';
import { validateTruckNo } from '@/utils/validate';
import { IDriver, ISupplier, TruckModel } from '@/utils/interface';
import SupplierSelect from '@/components/truck/SupplierSelect';
import AdditionalDetails from '@/components/truck/AdditionalDetails';
import Loading from '@/app/user/trucks/loading';
import { Button } from '../ui/button';
import DriverSelect from '../trip/DriverSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useExpenseCtx } from '@/context/context';
import { useExpenseData } from '../hooks/useExpenseData';
import { Loader2 } from 'lucide-react';

type FormData = {
    truckNo: string;
    truckType: string;
    model: string;
    capacity: string;
    bodyLength: number | null;
    ownership: string;
    supplier: string;
    driver_id: string
}

interface EditTruckModalProps {
    truck: TruckModel;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

const EditTruckModal: React.FC<EditTruckModalProps> = ({ truck, isOpen, onClose, onSave }) => {
    const {drivers, suppliers} = useExpenseData()
    const [saving, setSaving] = useState(false);
    const [formdata, setFormdata] = useState<FormData>({
        truckNo: truck?.truckNo || '',
        truckType: truck?.truckType || '',
        model: truck?.model || '',
        capacity: truck?.capacity || '',
        bodyLength: truck?.bodyLength as any || '',
        ownership: truck?.ownership || '',
        supplier: truck?.supplier || '',
        driver_id: truck?.driver_id || ''
    });

    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchSuppliers = async () => {
    //         try {
    //             const [supplierRes] = await Promise.all([fetch('/api/suppliers')]);

    //             // Correct the condition to check if either request failed
    //             if (!supplierRes.ok) {
    //                 throw new Error('Failed to fetch data');
    //             }

    //             const [supplierData] = await Promise.all([supplierRes.json()]);
    //             setSuppliers(supplierData.suppliers);
    //         } catch (err) {
    //             setError((err as Error).message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchSuppliers();
    // }, []);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormdata({
            ...formdata,
            [name]: value
        });
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormdata({
            ...formdata,
            [name]: value
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formdata.truckNo) {
            setError('Enter Truck Number');
            return;
        }

        if (!validateTruckNo(formdata.truckNo)) {
            setError("Please enter a valid Indian truck number.");
            return;
        }

        if (!formdata.ownership) {
            setError('Select Ownership');
            return;
        }

        if (formdata.ownership === 'Market' && !formdata.supplier) {
            setError('Select Supplier');
            return;
        }

        setError(null);
        setSaving(true);

        onSave(formdata)
        onClose()
        setSaving(false)
    };

    const renderModelOptions = () => {
        switch (formdata.truckType) {
            case 'Mini Truck / LCV':
                return minitruck;
            case 'Open Body Truck':
                return openBody;
            case 'Closed Container':
                return closedContainer;
            case 'Trailer':
                return trailer;
            default:
                return [];
        }
    }

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-class"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white text-black p-4 max-w-md w-full mx-auto shadow-md rounded-md relative">
                    {saving && (
                        <div className='absolute inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50'>
                            <Loading />
                        </div>
                    )}
                    <form className="space-y-2" onSubmit={handleSubmit}>
                        <div>
                            <label>Lorry No</label>
                            <input
                                className="w-full p-2 border border-gray-300 rounded-md"
                                type='text'
                                name='truckNo'
                                value={formdata.truckNo}
                                placeholder='Enter the Truck Number'
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label>Lorry Type</label>
                            <Select defaultValue={formdata.truckType} onValueChange={(value) => setFormdata({ ...formdata, truckType: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Truck Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {truckTypesIcons.map(({ type, Icon }) => (
                                        <SelectItem key={type} value={type}>
                                            <Icon className="inline-block mr-2" /> {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label>Ownership</label>
                            <Select defaultValue={formdata.ownership} onValueChange={(value) => setFormdata({ ...formdata, ownership: value })}>
                                <SelectTrigger >
                                    <SelectValue placeholder="Select Ownership*" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Self'>Self</SelectItem>
                                    <SelectItem value='Market'>Market</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label>Driver</label>
                            <Select name="driver_id" value={formdata.driver_id} onValueChange={(value) => setFormdata({ ...formdata, driver_id: value })}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Driver" />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map((driver) => (
                                        <SelectItem key={driver.driver_id} value={driver.driver_id}>
                                            <span>{driver.name}</span>
                                            <span
                                                className={`ml-2 p-1 rounded ${driver.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                            >
                                                {driver.status}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                        {formdata.ownership === 'Market' && (
                            <div>
                                <label>Supplier</label>
                                <SupplierSelect
                                    suppliers={suppliers}
                                    value={formdata.supplier}
                                    onChange={handleSelectChange}
                                />
                            </div>

                        )}
                        {showDetails && formdata.truckType !== 'Other' && (
                            <AdditionalDetails
                                formdata={formdata}
                                renderModelOptions={renderModelOptions}
                                handleInputChange={handleInputChange}
                            />
                        )}
                        {formdata.truckType !== 'Other' && (
                            <Button
                                className='hover:scale-100 w-full'
                                type="button"
                                onClick={() => setShowDetails((prev) => !prev)}
                            >
                                {showDetails ? 'Hide Details' : 'Add More Details'}
                            </Button>
                        )}

                        {error && <div className="text-red-500">{error}</div>}
                        <div className='flex flex-row w-full justify-end gap-2'>
                            <Button
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? <><Loader2 className='animate-spin'/></> : "Submit"}
                            </Button>
                            <Button
                                variant={'ghost'}
                                onClick={() => onClose()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditTruckModal;
