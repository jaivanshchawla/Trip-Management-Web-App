'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PartyLayout from '@/components/layout/PartyLayout';
import ProfileLayout from '@/components/layout/ProfileLayout';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {


  return (
    <ProfileLayout>
      {children}
      </ProfileLayout>
  );
};

export default Layout;