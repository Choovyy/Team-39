"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Faculty} from '../Utils/Global_variables';

// Define the context type
interface FacultyContextType {
  Faculty: Faculty | undefined | null;
  setFaculty: (Faculty: Faculty) => void;
}

// Create the context
const FacultyContext = createContext<FacultyContextType | undefined>(undefined);

// Create a provider component
export const FacultyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [Faculty, setFaculty] = useState<Faculty | null>(null);

  useEffect(()=>{
    const storedFaculty = localStorage.getItem('Faculty');
    if(storedFaculty){
      setFaculty(JSON.parse(storedFaculty))
    }
  },[])

  useEffect(() => {
    // Store Faculty in localStorage whenever it changes
    if (Faculty) {
      localStorage.setItem('Faculty', JSON.stringify(Faculty));
    } else {
      localStorage.removeItem('Faculty'); // Clear if undefined
    }
  }, [Faculty]);

  return (
    <FacultyContext.Provider value={{ Faculty, setFaculty }}>
      {children}
    </FacultyContext.Provider>
  );
};

// Create a custom hook to use the FacultyContext
export const useFacultyContext = () => {
  const context = useContext(FacultyContext);
  if (context === undefined) {
    throw new Error('Faculty Context must be used within a FacultyProvider');
  }
  return context;
};