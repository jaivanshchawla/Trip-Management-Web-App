import React, { createContext, useContext, useEffect, useState } from 'react';

const SupplierContext = createContext(null);

export const useSupplier = () => useContext(SupplierContext);

export const SupplierProvider = ({ supplierId, children }) => {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch supplier data
    async function fetchSupplier() {
      try {
        const response = await fetch(`/api/suppliers/${supplierId}`);
        const data = await response.json();
        setSupplier(data.supplier);
      } catch (error) {
        console.error('Error fetching supplier:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSupplier();
  }, [supplierId]);

  return (
    <SupplierContext.Provider value={{ supplier, setSupplier, loading }}>
      {children}
    </SupplierContext.Provider>
  );
};
