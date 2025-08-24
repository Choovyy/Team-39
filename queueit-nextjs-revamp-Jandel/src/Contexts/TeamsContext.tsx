"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Team } from '../Utils/Global_variables';

// Define the context type
interface TeamsContextType {
  Teams: Array<Team> | undefined | null;
  setTeams: (Teams: Array<Team> | undefined) => void;
}

// Create the context
const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

// Create a provider component
export const TeamsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [Teams, setTeams] = useState<Array<Team> | null>(null);

  useEffect(()=>{
    const storedTeams = localStorage.getItem('Teams');
    if(storedTeams){
      setTeams(JSON.parse(storedTeams))
    }
  },[])

  useEffect(() => {
    // Store Teams in localStorage whenever it changes
    if (Teams) {
      // const TeamsWithMembers = {...Teams, members:Array.from(Teams.members)}
      localStorage.setItem('Teams', JSON.stringify(Teams));
    } else {
      localStorage.removeItem('Teams'); // Clear if undefined
    }
  }, [Teams]);

  return (
    <TeamsContext.Provider value={{ Teams, setTeams }}>
      {children}
    </TeamsContext.Provider>
  );
};

// Create a custom hook to use the TeamsContext
export const useTeamsContext = () => {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error('Teams Context must be used within a TeamsProvider');
  }
  return context;
};