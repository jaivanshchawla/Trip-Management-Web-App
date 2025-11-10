'use client';

import { useParams } from 'next/navigation';
import Loading from '../loading';
import SupplierLayout from '@/components/layout/SupplierLayout';
import { SupplierProvider } from '@/context/supplierContext';

const Layout = ({ children }) => {
  const {supplierId} = useParams();


  if (!supplierId) {
    return <Loading />
  }

  return (
    <SupplierProvider supplierId={supplierId}>
    <SupplierLayout>
      {children}
    </SupplierLayout>
    </SupplierProvider>
  );
};

export default Layout;
