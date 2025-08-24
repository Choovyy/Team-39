"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Rubric } from '../Utils/Global_variables';

// Define the context type
interface RubricsContextType {
  Rubrics: Array<Rubric> | undefined | null;
  setRubrics: (Rubrics: Array<Rubric> | undefined) => void;
}

// Create the context
const RubricsContext = createContext<RubricsContextType | undefined>(undefined);

// Create a provider component
export const RubricsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [Rubrics, setRubrics] = useState<Array<Rubric> | null>(null);

  useEffect(()=>{
    const storedRubrics = localStorage.getItem('Rubrics');
    if(storedRubrics){
      setRubrics(JSON.parse(storedRubrics))
    }
  },[])

  useEffect(() => {
    // Store Rubrics in localStorage whenever it changes
    if (Rubrics) {
      // const RubricsWithMembers = {...Rubrics, members:Array.from(Rubrics.members)}
      localStorage.setItem('Rubrics', JSON.stringify(Rubrics));
    } else {
      localStorage.removeItem('Rubrics'); // Clear if undefined
    }
  }, [Rubrics]);

  return (
    <RubricsContext.Provider value={{ Rubrics, setRubrics }}>
      {children}
    </RubricsContext.Provider>
  );
};

// Create a custom hook to use the RubricsContext
export const useRubricsContext = () => {
  const context = useContext(RubricsContext);
  if (context === undefined) {
    throw new Error('Rubrics Context must be used within a RubricsProvider');
  }
  return context;
};