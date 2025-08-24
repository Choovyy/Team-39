"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MilestoneSet } from '../Utils/Global_variables';

// Define the context type
interface MilestoneSetContextType {
  MilestoneSet: MilestoneSet | undefined | null;
  setMilestoneSet: (MilestoneSet: MilestoneSet | undefined) => void;
}

// Create the context
const MilestoneSetContext = createContext<MilestoneSetContextType | undefined>(undefined);

// Create a provider component
export const MilestoneSetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [MilestoneSet, setMilestoneSet] = useState<MilestoneSet | null>(null);

  useEffect(()=>{
    const storedMilestoneSet = localStorage.getItem('MilestoneSet');
    if(storedMilestoneSet){
      setMilestoneSet(JSON.parse(storedMilestoneSet))
    }
  },[])

  useEffect(() => {
    // Store MilestoneSet in localStorage whenever it changes
    if (MilestoneSet) {
      // const MilestoneSetWithMembers = {...MilestoneSet, members:Array.from(MilestoneSet.members)}
      localStorage.setItem('MilestoneSet', JSON.stringify(MilestoneSet));
    } else {
      localStorage.removeItem('MilestoneSet'); // Clear if undefined
    }
  }, [MilestoneSet]);

  return (
    <MilestoneSetContext.Provider value={{ MilestoneSet, setMilestoneSet }}>
      {children}
    </MilestoneSetContext.Provider>
  );
};

// Create a custom hook to use the MilestoneSetContext
export const useMilestoneSetContext = () => {
  const context = useContext(MilestoneSetContext);
  if (context === undefined) {
    throw new Error('MilestoneSet Context must be used within a MilestoneSetProvider');
  }
  return context;
};