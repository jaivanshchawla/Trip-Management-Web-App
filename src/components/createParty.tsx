'use client'

import React, { useState } from 'react';
import { IParty } from '@/utils/interface';
import { v4 as uuidv4 } from 'uuid';
import { Button } from './ui/button';

interface Props {
  onSubmit: (party: IParty) => void;
}

const PartyForm: React.FC<Props> = ({ onSubmit }) => {
  // State to hold form data
  const [formData, setFormData] = useState<Partial<IParty>>({
    name: '',
    contactPerson: '',
    contactNumber: '',
    address: '',
    gstNumber: '',
    balance: 0,
    pan : '',
    email : ''
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      handleChange({ target: { name: e.target.name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Handle input changes and update the state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!formData.name || !formData.contactNumber){
      alert('!Fill in the required feilds')
      return
    }
    // Generate a unique party ID
    const partyId = 'party' + uuidv4();

    // Create a new party object
    const newParty: IParty = {
      ...formData,
      party_id: partyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IParty; // Type assertion to ensure newParty matches IParty
    // Call onSubmit with the new party object
    onSubmit(newParty);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-4 bg-white shadow-md rounded-md text-black">
      <label className="block mb-2">
        Name*
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-2">
        Contact Person
        <input
          type="text"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-2">
        Contact Number*
        <input
          type="text"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-2">
        Address
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-2">
        GST Number
        <input
          type="text"
          name="gstNumber"
          value={formData.gstNumber}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-2">
        Email
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-2">
        PAN (Permanent Account Number)
        <input
          type="text"
          name="pan"
          value={formData.pan}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <Button type="submit" className='mt-2 w-full'>
        Submit
      </Button>
    </form>
  );
};

export default PartyForm;
