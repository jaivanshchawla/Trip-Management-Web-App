'use client';

import { useParams, useRouter } from 'next/navigation';
import DriverLayout from '@/components/driver/driverLayout';
import { DriverProvider } from '@/context/driverContext';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {
  const { driverId } = useParams();
  const router = useRouter()
  return (
    <DriverProvider driverId={driverId as string}>
      <DriverLayout driverId={driverId as string} onDriverUpdate={() => router.refresh()}>

        {children}

      </DriverLayout>
    </DriverProvider>
  );
};

export default Layout;
