"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Rubric } from '../Utils/Global_variables';

// Define the context type
interface RubricContextType {
  Rubric: Rubric | undefined | null;
  setRubric: (Rubric: Rubric | undefined) => void;
}

// Create the context
const RubricContext = createContext<RubricContextType | undefined>(undefined);

// Create a provider component
export const RubricProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [Rubric, setRubric] = useState<Rubric | null>(null);

  useEffect(()=>{
    const storedRubric = localStorage.getItem('Rubric');
    if(storedRubric){
      setRubric(JSON.parse(storedRubric))
    }
  },[])

  useEffect(() => {
    // Store Rubric in localStorage whenever it changes
    if (Rubric) {
      // const RubricWithMembers = {...Rubric, members:Array.from(Rubric.members)}
      localStorage.setItem('Rubric', JSON.stringify(Rubric));
    } else {
      localStorage.removeItem('Rubric'); // Clear if undefined
    }
  }, [Rubric]);

  return (
    <RubricContext.Provider value={{ Rubric, setRubric }}>
      {children}
    </RubricContext.Provider>
  );
};

// Create a custom hook to use the RubricContext
export const useRubricContext = () => {
  const context = useContext(RubricContext);
  if (context === undefined) {
    throw new Error('Rubric Context must be used within a RubricProvider');
  }
  return context;
};