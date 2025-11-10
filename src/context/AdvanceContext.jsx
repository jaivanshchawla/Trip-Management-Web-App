'use client'
import React, { createContext, useContext, useState } from 'react';

const AdvanceContext = createContext(undefined);

export const AdvanceProvider = ({ children }) => {
  const [advanceTotal, setAdvanceTotal] = useState(0);

  return (
    <AdvanceContext.Provider value={{ advanceTotal, setAdvanceTotal }}>
      {children}
    </AdvanceContext.Provider>
  );
};

export const useAdvance = () => {
  const context = useContext(AdvanceContext);
  if (!context) throw new Error('useAdvance must be used within AdvanceProvider');
  return context;
};
