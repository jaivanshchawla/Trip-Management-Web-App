'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IDriver } from '@/utils/interface';
import DriverLayout from '@/components/driver/driverLayout';
import Loading from './loading'
import ShopLayout from '@/components/shopkhata/ShopLayout';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {
  const {shopId} = useParams();
  const [shop, setShop] = useState<any>();
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>()
  const router = useRouter()

  const fetchDriverDetails = async () => {
    try {
      const response = await fetch(`/api/shopkhata/${shopId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver');
      }

      const result = await response.json();
      setShop(result.shop);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(shopId){
        fetchDriverDetails()
    }
  },[shopId])

  if(loading) return <Loading />

  return (
    <ShopLayout name={shop?.name || '' }  onShopUpdate={() => router.refresh()} contactNumber={shop?.contactNumber || ''} shopId={shop?.shop_id || ''}>
      {children}
    </ShopLayout>
  );
};

export default Layout;
