'use client'

import React, { useEffect, useState } from 'react';
import DriverForm from '@/components/createDriver';
import { IDriver } from '@/utils/interface';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '../loading';
import { mutate } from 'swr';


const isValidPhone = (phone: string): boolean => {
    return /^[6789]\d{9}$/.test(phone); // Phone number validation logic for India
};

const CreateDriverPage: React.FC = () => {
    const [saving, setSaving] = useState(false)
    const router = useRouter();
    const params = useSearchParams()
    const nextpath = params.get('nextpath')


    const handleDriverSubmit = async (driver: IDriver) => {
        setSaving(true);

        if (driver.contactNumber && !isValidPhone(driver.contactNumber)) {
            alert('Invalid phone number. Please enter a 10-digit phone number.');
            return;
        }

        try {

            const res = await fetch('/api/drivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(driver),
            });

            if (!res.ok) {
                if (res.status === 400) {
                    const errorData = await res.json();
                    alert(`Error: ${errorData.message}`);
                    return;
                } else {
                    alert('An unexpected error occurred. Please try again.');
                    return;
                }
            }

            const data = await res.json();
            if(nextpath){
                const current = JSON.parse(localStorage.getItem('tripData') as any)
                current.driver = data.data.driver_id
                localStorage.setItem('tripData', JSON.stringify(current))
            }
            router.push(nextpath ? nextpath : '/user/drivers');
        } catch (error) {
            console.error('Error saving party:', error);
            alert('An error occurred while saving the party. Please try again.');
        } finally {
            setSaving(false)
        }
    };

    return (
        <>
            {saving && (
                <div className='absolute inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50'>
                    <Loading />
                </div>
            )}
            <div className='w-full h-full'>
                <DriverForm onSubmit={handleDriverSubmit} />
            </div>
        </>

    );
};

export default CreateDriverPage;
