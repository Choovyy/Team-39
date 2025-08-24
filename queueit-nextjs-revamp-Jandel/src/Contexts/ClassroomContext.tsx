"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Classes } from '../Utils/Global_variables';
 
interface ClassroomContextType {
  classroom: Classes | undefined | null;
  setClassroom: (classroom: Classes) => void;
}
 
const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);
 
export const ClassroomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classroom, setClassroom] = useState<Classes | null>(null);

  useEffect(()=>{
    const storedClassroom = localStorage.getItem('classroom');
    if(storedClassroom){
      setClassroom(JSON.parse(storedClassroom))
    }
  },[])

  useEffect(() => { 
    if (classroom) {
      localStorage.setItem('classroom', JSON.stringify(classroom));
    } else {
      localStorage.removeItem('classroom');  
    }
  }, [classroom]);

  return (
    <ClassroomContext.Provider value={{ classroom, setClassroom }}>
      {children}
    </ClassroomContext.Provider>
  );
};
 
export const useClassroomContext = () => {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error('Classroom Context must be used within a ClassroomProvider');
  }
  return context;
};