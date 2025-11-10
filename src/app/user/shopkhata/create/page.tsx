'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidGSTNumber } from '@/utils/validate';
import Loading from '@/app/user/loading'
import ShopKhataForm from '@/components/shopkhata/ShopKhataForm';
import { mutate } from 'swr';



const CreateShopPage: React.FC = () => {
    const [saving, setSaving] = useState(false)
    const router = useRouter()


    const handleShopSubmit = async (shop: any) => {
        setSaving(true)
        if (shop.gstNumber && !isValidGSTNumber(shop.gstNumber)) {
            alert('Invalid GST number. Please enter a valid GST number.');
            return;
        }

        try {

            const res = await fetch('/api/shopkhata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(shop),
            });

            if (!res.ok) {
                if (res.status === 400) {
                    const errorData = await res.json();
                    alert(`Error: ${errorData.message}`);
                    return;
                } else if (res.status === 409) {
                    alert('Duplicate GST number. Please use a unique GST number.');
                    return;
                } else {
                    alert('An unexpected error occurred. Please try again.');
                    return;
                }
            }

            const data = await res.json();
            mutate('/api/shopkhata')
            router.push('/user/shopkhata');
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
                <ShopKhataForm onSubmit={handleShopSubmit} />
            </div>
        </>

    );
};

export default CreateShopPage;
