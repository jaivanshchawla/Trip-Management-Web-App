'use client'
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fuelAndDriverChargeTypes, maintenanceChargeTypes } from '@/utils/utilArray';
import { IDriver, IExpense, ITrip, TruckModel } from '@/utils/interface';
import DriverSelect from '../DriverSelect';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { statuses } from '@/utils/schema';
import ShopSelect from '@/components/shopkhata/ShopSelect';

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: any;
  driverId: string;
  selected?: any;
  truckPage?: boolean;
}

interface TripExpense {
  id?: string;
  trip: string;
  partyBill: boolean;
  amount: number;
  date: Date;
  expenseType: string;
  notes?: string;
  partyAmount: number;
  paymentMode: string;
  transactionId: string;
  driver: string;
  truck?: string
  shop_id?: string
}

const ExpenseModal: React.FC<ChargeModalProps> = ({ isOpen, onClose, onSave, driverId, selected, truckPage }) => {
  const [formData, setFormData] = useState<TripExpense>({
    id: selected?._id || undefined,
    trip: selected?.trip_id || '',
    partyBill: false,
    amount: selected?.amount || 0,
    date: selected?.date ? new Date(selected.date) : new Date(),
    expenseType: selected?.expenseType || '',
    notes: selected?.notes || '',
    partyAmount: 0,
    paymentMode: selected?.paymentMode || 'Cash',
    transactionId: selected?.transaction_id || '',
    driver: driverId || '',
    truck: selected?.truck || '',
    shop_id: selected?.shop_id || ''
  });

  const pathname = usePathname()

  const [driverName, setDriverName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fuel & Driver');
  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const [trucks, setTrucks] = useState<TruckModel[]>([])
  const [trips, setTrips] = useState<ITrip[]>([])
  const [trip, setTrip] = useState<ITrip>()
  const [shops, setShops] = useState<any[]>([])
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose(); // Close modal if clicked outside
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);


  useEffect(() => {
    if (!selected) return;
    setFormData({
      id: selected?._id || undefined,
      trip: selected?.trip_id || '',
      partyBill: false,
      amount: selected?.amount || 0,
      date: selected?.date ? new Date(selected.date) : new Date(),
      expenseType: selected?.expenseType || '',
      notes: selected?.notes || '',
      partyAmount: 0,
      paymentMode: selected?.paymentMode || 'Cash',
      transactionId: selected?.transaction_id || '',
      driver: selected?.driver || '',
      truck: selected?.truck || '',
      shop_id: selected?.shop_id || ''
    });
  }, [selected]);

  const fetchshops = async () => {
    const res = await fetch(`/api/shopkhata`)
    const data = await res.json()
    setShops(data.shops)
  }

  useEffect(() => {
    if (formData.paymentMode === 'Credit') {
      fetchshops()
    }
  }, [formData.paymentMode])

  useEffect(() => {
    const fetchDriverName = async () => {
      const result = await fetch(`/api/drivers/${driverId || trip?.driver}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await result.json();
      setDriverName(data.name || 'Driver Not Found');
    };
    if (formData.paymentMode === 'Paid By Driver') fetchDriverName();

    const fetchDrivers = async () => {
      const res = await fetch(`/api/drivers`);
      const data = await res.json();
      setDrivers(data.drivers);
    };

    fetchDrivers();
  }, [formData.paymentMode, driverId]);

  const fetchTripsTrucks = async () => {
    try {
      const [tripRes, truckRes] = await Promise.all([
        fetch(`/api/trips/expenses`),
        fetch(`/api/trucks/create`)
      ])

      const [tripData, truckData] = await Promise.all([
        tripRes.ok ? tripRes.json() : [],
        truckRes.ok ? truckRes.json() : []
      ])
      setTrips(tripData.trips)
      setTrucks(truckData.trucks)

    } catch (error: any) {
      console.error('Error fetching data:', error);
      alert(error.message);
    }
  }

  useEffect(() => {
    if (pathname.includes('/expenses')) {
      fetchTripsTrucks()
    }
  }, [pathname])

  useEffect(() => {
    if (formData.paymentMode === 'Paid By Driver' && trip) {
      setFormData((prevData) => ({ ...prevData, driver: trip.driver }));
    }
  }, [trip, formData.paymentMode])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => {
      let updatedData = { ...prevData, [name]: value };

      if (name === 'trip') {
        const selectedTrip = trips.find(trip => trip.trip_id === value);
        if (selectedTrip) {
          setTrip(selectedTrip)
          updatedData = { ...updatedData, truck: selectedTrip.truck };
        }
      }

      return updatedData;
    });
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? !formData.partyBill : value });
  };

  const handleSave = () => {
    if (formData.paymentMode === 'Paid By Driver') {
      setFormData((prev) => ({ ...prev, driver: driverId }));
    }
    if (selected) {
      onSave(formData, selected._id);
    } else {
      onSave(formData);
    }

    onClose();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      handleChange({ target: { name: e.target.name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const chargeTypes = selectedCategory === 'Fuel & Driver' ? Array.from(fuelAndDriverChargeTypes) : Array.from(maintenanceChargeTypes);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
    >
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0, 0.71, 0.2, 1.01]
          }}
          className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl"
          ref={modalRef}
        >
          <h2 className="text-xl font-semibold mb-4">Add New Charge</h2>

          <div className="flex space-x-4 mb-4 border-b-2 border-gray-200">
            <Button
              variant="link"
              onClick={() => setSelectedCategory('Fuel & Driver')}
              className={`px-4 py-2 transition duration-300 ease-in-out ${selectedCategory === 'Fuel & Driver'
                ? 'border-b-2 border-bottomNavBarColor text-bottomNavBarColor'
                : 'border-transparent text-gray-600 hover:text-bottomNavBarColor hover:border-bottomNavBarColor'
                }`}
            >
              Fuel & Driver
            </Button>
            {truckPage || pathname.includes('/expenses') && (
              <Button
                variant="link"
                onClick={() => setSelectedCategory('Maintenance')}
                className={`px-4 py-2 transition duration-300 ease-in-out ${selectedCategory === 'Maintenance'
                  ? 'border-b-2 border-bottomNavBarColor text-bottomNavBarColor'
                  : 'border-transparent text-gray-600 hover:text-bottomNavBarColor hover:border-bottomNavBarColor'
                  }`}
              >
                Maintenance
              </Button>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Expense Type</label>
            <Select value={formData.expenseType} onValueChange={(value) => handleSelectChange('expenseType', value)}>
              <SelectTrigger className="w-full">
                <SelectValue>{formData.expenseType || 'Select Expense Type'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {chargeTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center space-x-2 '>
            <div className="mb-4 w-1/2">
              <label className="block text-sm font-medium text-gray-700">Amount</label>
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
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                value={formData.date.toISOString().split('T')[0]}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {pathname.includes('/expenses') && !selected && <div className='flex items-center space-x-2 '>
            <div className="mb-4 w-1/2">
              <label className="block text-sm font-medium text-gray-700">Select Trip</label>
              <Select value={formData.trip} onValueChange={(value) => handleSelectChange('trip', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder='Select Trip' />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip: ITrip) => (
                    <SelectItem key={trip.trip_id} value={trip.trip_id}>
                      <div className='flex items-center space-x-2 w-full'>
                        <span className='font-semibold w-1/2'>{trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]}</span>
                        <div className="flex flex-col items-center space-x-2 w-1/2">
                          <span>{statuses[trip.status as number]}</span>
                          <div className="relative w-full bg-gray-200 h-1 rounded">
                            <div
                              className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0 ? 'bg-red-500' : trip.status === 1 ? 'bg-yellow-500' : trip.status === 2 ? 'bg-blue-500' : trip.status === 3 ? 'bg-green-500' : 'bg-green-800'}`}
                              style={{ width: `${(trip.status as number / 4) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4 w-1/2">
              <label className="block text-sm font-medium text-gray-700">Select Truck</label>
              <Select value={formData.truck} onValueChange={(value) => handleSelectChange('truck', value)}>
                <SelectTrigger className="w-full text-black" value={formData.truck}>
                  <SelectValue placeholder='Select Truck' />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((truck) => (
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

          <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
          <div className="flex flex-row w-full justify-start gap-3 mb-3">
            {['Cash', 'Paid By Driver', 'Online', 'Credit'].map((type) => (
              <button
                key={type}
                type="button"
                className={`p-2 rounded-md ${formData.paymentMode === type ? 'bg-bottomNavBarColor text-white' : 'bg-lightOrangeButtonColor text-black'}`}
                onClick={() => handleChange({ target: { name: 'paymentMode', value: type } } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)}
              >
                {type}
              </button>
            ))}
          </div>

          {formData.paymentMode === 'Paid By Driver' && !truckPage && (
            <div className="mb-4">
              <button disabled className="block text-sm font-medium text-gray-700 border border-black rounded-md p-2 w-1/3">
                {driverName}
              </button>
            </div>
          )}

          {formData.paymentMode === 'Paid By Driver' && truckPage && (
            <DriverSelect
              drivers={drivers}
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

          {(formData.expenseType !== 'Fuel Expense' && !selected && !truckPage && !pathname.includes('expenses')) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Add to Party Bill</label>
              <input
                type="checkbox"
                name="partyBill"
                checked={formData.partyBill}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExpenseModal;
