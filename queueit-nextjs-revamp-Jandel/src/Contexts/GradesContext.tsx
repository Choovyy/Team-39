"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Grade } from '../Utils/Global_variables';

// Define the context type
interface GradesContextType {
  Grades: Array<Grade> | undefined | null;
  setGrades: (Grades: Array<Grade> | undefined) => void;
}

// Create the context
const GradesContext = createContext<GradesContextType | undefined>(undefined);

// Create a provider component
export const GradesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [Grades, setGrades] = useState<Array<Grade> | null>(null);

  useEffect(()=>{
    const storedGrades = localStorage.getItem('Grades');
    if(storedGrades){
      setGrades(JSON.parse(storedGrades))
    }
  },[])

  useEffect(() => {
    // Store Grades in localStorage whenever it changes
    if (Grades) {
      // const GradesWithMembers = {...Grades, members:Array.from(Grades.members)}
      localStorage.setItem('Grades', JSON.stringify(Grades));
    } else {
      localStorage.removeItem('Grades'); // Clear if undefined
    }
  }, [Grades]);

  return (
    <GradesContext.Provider value={{ Grades, setGrades }}>
      {children}
    </GradesContext.Provider>
  );
};

// Create a custom hook to use the GradesContext
export const useGradesContext = () => {
  const context = useContext(GradesContext);
  if (context === undefined) {
    throw new Error('Grades Context must be used within a GradesProvider');
  }
  return context;
};