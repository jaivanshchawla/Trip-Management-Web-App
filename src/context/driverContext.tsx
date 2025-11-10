import React, { createContext, useContext, useEffect, useState } from 'react';

const DriverContext = createContext<any>(null);

export const useDriver = () => useContext(DriverContext);

export const DriverProvider: React.FC<{ driverId: string; children: React.ReactNode }> = ({ driverId, children }) => {
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch driver data
    async function fetchDriver() {
      try {
        const response = await fetch(`/api/drivers/${driverId}`);
        const data = await response.json();
        setDriver(data.driver);
      } catch (error) {
        console.error('Error fetching driver:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDriver();
  }, [driverId]);

  return (
    <DriverContext.Provider value={{ driver, setDriver, loading }}>
      {children}
    </DriverContext.Provider>
  );
};
