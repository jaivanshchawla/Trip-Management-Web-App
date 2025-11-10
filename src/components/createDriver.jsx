'use client'

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from './ui/button';

const DriverForm = ({ onSubmit }) => {
  // State to hold form data
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    licenseNo: '',
    aadharNo: '',
    lastJoiningDate: new Date(Date.now())
  });

  const handleFocus = (e) => {
    if (e.target.value === '0') {
      handleChange({ target: { name: e.target.name, value: '' } });
    }
  };

  // Handle input changes and update the state
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate a unique driver ID
    const driverId = 'driver' + uuidv4();
    // Create a new driver object
    const newDriver = {
      ...formData,
      status: 'Available',
      driver_id: driverId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Call onSubmit with the new driver object
    onSubmit(newDriver);
    // Optionally, clear the form after submission
    setFormData({
      name: '',
      contactNumber: '',
      balance: 0,
    });
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
        Contact Number
        <input
          type="text"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-2">
        Aadhar Number
        <input
          type="text"
          name="aadharNo"
          value={formData.aadharNo}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-2">
        License Number
        <input
          type="text"
          name="licenseNo"
          value={formData.licenseNo}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-2">
        Last Joining Date
        <input
          type="date"
          name="lastJoiningDate"
          value={formData.lastJoiningDate ? new Date(formData.lastJoiningDate).toISOString().split('T')[0] : ''}
          onChange={handleChange}
          onClick={(e) => (e.target as HTMLInputElement).showPicker()}
          className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
        />
      </label>
      <Button type="submit" className='w-full justify-center'>
        Submit
      </Button>
    </form>
  );
};

export default DriverForm;
