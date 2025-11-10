'use client'

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from './ui/button';

const SupplierForm = ({ onSubmit }) => {
  // State to hold form data
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
  });

  // Handle input changes and update the state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate a unique party ID
    const partyId = 'party' + uuidv4();
    // Create a new party object
    const newSupplier = {
      ...formData,
      party_id: partyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Call onSubmit with the new party object
    onSubmit(newSupplier);
    // Optionally, clear the form after submission
    setFormData({
      name: '',
      contactNumber: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-4 bg-white shadow-md rounded-md text-black">
      <label className="block mb-2">
        Name:
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
        Contact Number:
        <input
          type="text"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <Button type="submit" className='w-full'>
        Submit
      </Button>
    </form>
  );
};

export default SupplierForm;
