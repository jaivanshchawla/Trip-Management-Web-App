'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

type AdvanceContextType = {
  advanceTotal: number;
  setAdvanceTotal: React.Dispatch<React.SetStateAction<number>>;
};

const AdvanceContext = createContext<AdvanceContextType | undefined>(undefined);

export const AdvanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [advanceTotal, setAdvanceTotal] = useState(0);

  return (
    <AdvanceContext.Provider value={{ advanceTotal, setAdvanceTotal }}>
      {children}
    </AdvanceContext.Provider>
  );
};

export const useAdvance = (): AdvanceContextType => {
  const context = useContext(AdvanceContext);
  if (!context) throw new Error('useAdvance must be used within AdvanceProvider');
  return context;
};
