import React, { createContext, useContext, useEffect, useState } from 'react';

const TripContext = createContext(null);

export const useTrip = () => useContext(TripContext);

export const TripProvider = ({ tripId, children }) => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch trip data
    async function fetchTrip() {
      try {
        const response = await fetch(`/api/trips/${tripId}`);
        const data = await response.json();
        setTrip(data.trip);
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrip();
  }, [tripId]);

  return (
    <TripContext.Provider value={{ trip, setTrip, loading }}>
      {children}
    </TripContext.Provider>
  );
};
