import React, { useState, useEffect } from 'react';
import { TruckModel, ISupplier } from '@/utils/interface';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PiPlusBold } from 'react-icons/pi';

type Props = {
  trucks: TruckModel[];
  suppliers: ISupplier[];
  formData: any; // Adjust type as per your formData structure
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

const TruckSelect: React.FC<Props> = ({ trucks, suppliers, formData, handleChange, setFormData }) => {
  const [supplierName, setSupplierName] = useState<string>('');
  const [selectedTruck, setSelectedTruck] = useState<TruckModel | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [supplierSearchTerm, setSupplierSearchTerm] = useState<string>('');
  const pathname = usePathname()

  useEffect(() => {
    const selectedTruck: any = trucks.find(truck => truck.truckNo === formData.truck);
    setSelectedTruck(selectedTruck || null);
    if (selectedTruck?.supplier) {
      setSupplierName(selectedTruck.supplierName as string)
    } else {
      setSupplierName('');
      setFormData((prev: any) => ({
        ...prev,
        supplierId: null
      }));
    }
  }, [trucks, formData.truck, setFormData]);

  const handleOptionSelect = (value: string) => {
    const truck = trucks.find(truck => truck.truckNo === value);
    setFormData((prev: any) => ({
      ...prev,
      truck: value,
      driver: truck?.driver_id ? truck.driver_id : ''
    }));
  };

  const handleSupplierSelect = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      supplierId: value
    }));
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );

  const filteredTrucks = trucks.filter(truck =>
    truck.truckNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateText = (text: string, maxLength: number) => {
    return text?.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="relative">
      <label className="block w-full">
        <span className="block text-xs font-medium text-gray-700 mb-1">Lorry*</span>
        <Select name="truck" defaultValue={formData.truck} value={formData.truck} onValueChange={handleOptionSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Lorry" />
          </SelectTrigger>
          <SelectContent className="w-full max-h-[300px]">
            <div className="flex items-center justify-between gap-2 p-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <Button className="rounded-full w-8 h-8 p-0" onClick={() => {
                localStorage.setItem('tripData', JSON.stringify(formData))
              }}>
                <Link href={{
                  pathname: `/user/trucks/create`, query: {
                    nextpath: pathname
                  }
                }}><PiPlusBold /></Link>
              </Button>
            </div>
            {filteredTrucks.length > 0 ? (
              filteredTrucks.map((truck: any) => (
                <SelectItem key={truck.truckNo} value={truck.truckNo} className="py-2">
                  <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center w-full">
                    <span className="truncate text-sm">{truck.truckNo}</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${truck.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {truck.status}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate text-sm text-right">{truncateText(truck.supplierName, 15)}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start" className="z-50 absolute border-lightOrange">
                          <p>{truck.supplierName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-gray-500">No lorries found</div>
            )}
          </SelectContent>
        </Select>
      </label>
      {supplierName && (
        <div className="mt-2 text-sm text-gray-600">
          Supplier: {truncateText(supplierName, 30)}
        </div>
      )}
      <label className="block w-full mt-4">
        <span className="block text-xs font-medium text-gray-700 mb-1">Supplier</span>
        <Select name="supplierId" defaultValue={formData.supplierId} value={formData.supplierId} onValueChange={handleSupplierSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Supplier" />
          </SelectTrigger>
          <SelectContent className="w-full max-h-[300px]">
            <div className="flex items-center justify-between gap-2 p-2">
              <input
                type="text"
                placeholder="Search..."
                value={supplierSearchTerm}
                onChange={(e) => setSupplierSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <Button className="rounded-full w-8 h-8 p-0" onClick={() => {
                localStorage.setItem('tripData', JSON.stringify(formData))
              }}>
                <Link href={{
                  pathname: `/user/suppliers/create`, query: {
                    nextpath: pathname
                  }
                }}><PiPlusBold /></Link>
              </Button>
            </div>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier: any) => (
                <SelectItem key={supplier.party_id} value={supplier.party_id}>
                  {supplier.name}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-gray-500">No suppliers found</div>
            )}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
};

export default TruckSelect;

