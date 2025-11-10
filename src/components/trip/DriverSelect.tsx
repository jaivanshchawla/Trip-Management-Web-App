import React, { useState } from 'react';
import { IDriver } from '@/utils/interface';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '../ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PiPlusBold } from 'react-icons/pi';

type Props = {
  drivers: IDriver[];
  formData: any; // Adjust type as per your formData structure
  setFormData : any
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const DriverSelect: React.FC<Props> = ({ drivers, formData, handleChange }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const pathname = usePathname()

  const handleOptionSelect = (value: string) => {
    const event = {
      target: {
        name: 'driver',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleChange(event);
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">Driver</label>
        <Select name="driver" defaultValue={formData.driver} value={formData.driver} onValueChange={handleOptionSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Driver" />
          </SelectTrigger>
          <SelectContent className='max-h-[300px]'>
            <div className="flex items-center justify-between gap-2 p-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <Button className="rounded-full w-8 h-8 p-0" onClick={()=>{
              localStorage.setItem('tripData',JSON.stringify(formData))
            }}>
            <Link href={{pathname : `/user/drivers/create`, query : {
              nextpath : pathname
            }}}><PiPlusBold /></Link>
            </Button>
            </div>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => (
                <SelectItem key={driver.driver_id} value={driver.driver_id}>
                  <span>{driver.name}</span>
                  <span
                    className={`ml-2 p-1 rounded ${driver.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {driver.status}
                  </span>
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-gray-500">No drivers found</div>
            )}
            
          </SelectContent>
        </Select>
    </div>
  );
};

export default DriverSelect;
