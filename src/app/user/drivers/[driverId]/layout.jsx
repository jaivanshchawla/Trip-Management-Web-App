'use client';

import { useParams, useRouter } from 'next/navigation';
import DriverLayout from '@/components/driver/driverLayout';
import { DriverProvider } from '@/context/driverContext';

const Layout = ({ children }) => {
  const { driverId } = useParams();
  const router = useRouter()
  return (
    <DriverProvider driverId={driverId}>
      <DriverLayout driverId={driverId} onDriverUpdate={() => router.refresh()}>

        {children}

      </DriverLayout>
    </DriverProvider>
  );
};

export default Layout;
