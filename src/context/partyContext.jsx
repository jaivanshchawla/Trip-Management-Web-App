import React, { createContext, useContext, useEffect, useState } from 'react';

const PartyContext = createContext(null);

export const useParty = () => useContext(PartyContext);

export const PartyProvider = ({ partyId, children }) => {
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch party data
    async function fetchParty() {
      try {
        const response = await fetch(`/api/parties/${partyId}`);
        const data = await response.json();
        setParty(data.party);
      } catch (error) {
        console.error('Error fetching party:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchParty();
  }, [partyId]);

  return (
    <PartyContext.Provider value={{ party, setParty, loading }}>
      {children}
    </PartyContext.Provider>
  );
};
