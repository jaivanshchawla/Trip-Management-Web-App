import React, { useState } from "react";
import { IParty } from "@/utils/interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Button } from "../ui/button";
import { PiPlusBold } from "react-icons/pi";

interface PartySelectProps {
  parties: IParty[];
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PartySelect: React.FC<PartySelectProps> = ({ parties, formData, handleChange }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelectChange = (value: string) => {
    const event = {
      target: {
        name: 'party',
        value: value,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(event);
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <label className="block w-full">
        <label className="block text-xs font-medium text-gray-700 mb-1">Customer*</label>
        <Select name="party" defaultValue={formData.party} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Customer" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <div className="sticky p-2 flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              
                <Link href={{
                  pathname: `/user/parties/create`, query: {
                    nextpath: `/user/trips/create`
                  }
                }}>
                  <Button  className="rounded-full w-8 h-8 p-0" onClick={() => {
                localStorage.setItem('tripData', JSON.stringify(formData))
              }}><PiPlusBold /></Button></Link>
            </div>
            {filteredParties.length > 0 ? (
              filteredParties.map((party) => (
                <SelectItem key={party.party_id} value={party.party_id}>{party.name}</SelectItem>
              ))
            ) : (
              <div className="p-2 text-gray-500">No customers found</div>
            )}


          </SelectContent>
        </Select>
      </label>
    </div>
  );
};

export { PartySelect };
