'use client';

import { useParams } from 'next/navigation';
import Loading from '../loading';
import SupplierLayout from '@/components/layout/SupplierLayout';
import { SupplierProvider } from '@/context/supplierContext';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {
  const {supplierId} = useParams();


  if (!supplierId) {
    return <Loading />
  }

  return (
    <SupplierProvider supplierId={supplierId as string}>
    <SupplierLayout>
      {children}
    </SupplierLayout>
    </SupplierProvider>
  );
};

export default Layout;
