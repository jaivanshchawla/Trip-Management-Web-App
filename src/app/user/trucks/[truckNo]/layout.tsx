'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Loading from '../loading';
import TruckLayout from '@/components/layout/TruckLayout';
import { TruckProvider } from '@/context/truckContext';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {
  const {truckNo} = useParams();

  useEffect(() => {
    if (!truckNo) return;

    const fetchPartyName = async () => {
      try {
        const res = await fetch(`/api/trucks/${truckNo}`);
        if (!res.ok) {
          throw new Error('Failed to fetch party name');
        }
        const data = await res.json();
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchPartyName();
  }, [truckNo]);

  if (!truckNo) {
    return <Loading />
  }

  return (
    <TruckProvider truckNo={truckNo as string}>
    <TruckLayout>
      {children}
    </TruckLayout>
    </TruckProvider>
  );
};

export default Layout;
