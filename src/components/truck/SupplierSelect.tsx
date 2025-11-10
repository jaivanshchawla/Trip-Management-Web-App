import React, { useState } from 'react';
import { ISupplier } from '@/utils/interface';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input'; // Assuming you have an Input component for the search field
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PiPlusBold } from 'react-icons/pi';

type Props = {
    suppliers: ISupplier[];
    value: string;
    onChange: (key: string, value: string) => void;
};

const SupplierSelect: React.FC<Props> = ({ suppliers, value, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    // Filter suppliers based on the search term
    const filteredSuppliers = suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Select defaultValue={value} onValueChange={(value) => onChange('supplier', value)}>
            <SelectTrigger>
                <SelectValue placeholder="Select Supplier*" />
            </SelectTrigger>
            <SelectContent>
                {/* Search input and add button */}
                <div className="flex items-center justify-between gap-2 p-2">
                    <Input
                        type="text"
                        placeholder="Search supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button className="rounded-full w-8 h-8 p-0" onClick={() => {
                        router.push(`/user/suppliers/create?nextpath=${window.location.pathname}`);
                    }}>
                        <PiPlusBold />
                    </Button>
                </div>
                {/* Display filtered suppliers */}
                {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                        <SelectItem key={supplier.supplier_id} value={supplier.supplier_id}>
                            {supplier.name}
                        </SelectItem>
                    ))
                ) : (
                    <div className="p-2 text-sm text-gray-500">No suppliers found</div>
                )}
            </SelectContent>
        </Select>
    );
};

export default SupplierSelect;
