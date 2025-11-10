'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PartyLayout from '@/components/layout/PartyLayout';
import { PartyProvider } from '@/context/partyContext';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {
  const { singleparty } = useParams();

  if (!singleparty) {
    return <div>Loading...</div>;
  }

  return (
    <PartyProvider partyId={singleparty as string}>
      <PartyLayout partyId={singleparty as string}>
        {children}
      </PartyLayout>
    </PartyProvider>
  );
};

export default Layout;
