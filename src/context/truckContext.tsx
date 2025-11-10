import React, { createContext, useContext, useEffect, useState } from 'react';

const TruckContext = createContext<any>(null);

export const useTruck = () => useContext(TruckContext);

export const TruckProvider: React.FC<{ truckNo: string; children: React.ReactNode }> = ({ truckNo, children }) => {
  const [truck, setTruck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch truck data
    async function fetchTruck() {
      try {
        const response = await fetch(`/api/trucks/${truckNo}`);
        const data = await response.json();
        setTruck(data.truck);
      } catch (error) {
        console.error('Error fetching truck:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTruck();
  }, [truckNo]);

  return (
    <TruckContext.Provider value={{ truck, setTruck, loading }}>
      {children}
    </TruckContext.Provider>
  );
};
