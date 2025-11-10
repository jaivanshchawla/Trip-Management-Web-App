'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PartyLayout from '@/components/layout/PartyLayout';
import { PartyProvider } from '@/context/partyContext';

const Layout = ({ children }) => {
  const { singleparty } = useParams();

  if (!singleparty) {
    return <div>Loading...</div>;
  }

  return (
    <PartyProvider partyId={singleparty}>
      <PartyLayout partyId={singleparty}>
        {children}
      </PartyLayout>
    </PartyProvider>
  );
};

export default Layout;
