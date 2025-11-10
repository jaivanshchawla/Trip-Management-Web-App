import React, { createContext, useContext, useEffect, useState } from 'react';

const TruckContext = createContext(null);

export const useTruck = () => useContext(TruckContext);

export const TruckProvider = ({ truckNo, children }) => {
  const [truck, setTruck] = useState(null);
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
