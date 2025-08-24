"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MentoredClasses } from "../Utils/Global_variables";
 
interface MentoredClassroomContextType {
  mentoredClassroom: MentoredClasses | undefined | null;
  setMentoredClassroom: (mentoredClassroom: MentoredClasses) => void;
}
 
const MentoredClassroomContext = createContext<MentoredClassroomContextType | undefined>(undefined);
 
export const MentoredClassroomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mentoredClassroom, setMentoredClassroom] = useState<MentoredClasses | null>(null);

  useEffect(()=>{
    const storedClassroom = localStorage.getItem("mentoredClassroom");
    if(storedClassroom){
      setMentoredClassroom(JSON.parse(storedClassroom))
    }
  },[])

  useEffect(() => {
    if (mentoredClassroom) {
      localStorage.setItem("mentoredClassroom", JSON.stringify(mentoredClassroom));
    } else {
      localStorage.removeItem("mentoredClassroom");  
    }
  }, [mentoredClassroom]);

  return (
    <MentoredClassroomContext.Provider value={{ mentoredClassroom, setMentoredClassroom }}>
      {children}
    </MentoredClassroomContext.Provider>
  );
};
 
export const useMentoredClassroomContext = () => {
  const context = useContext(MentoredClassroomContext);
  if (!context) {
    throw new Error("useMentoredClassroomContext must be used within a MentoredClassroomProvider");
  }
  return context;
};
