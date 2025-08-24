"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Team } from '../Utils/Global_variables';

// Define the context type
interface TeamContextType {
  Team: Team | undefined | null;
  setTeam: (Team: Team | undefined) => void;
}

// Create the context
const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Create a provider component
export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [Team, setTeam] = useState<Team | null>(null);

  useEffect(()=>{
    const storedTeam = localStorage.getItem('Team');
    if(storedTeam){
      setTeam(JSON.parse(storedTeam))
    }
  },[])

  useEffect(() => {
    // Store Team in localStorage whenever it changes
    if (Team) {
      // const teamWithMembers = {...Team, members:Array.from(Team.members)}
      localStorage.setItem('Team', JSON.stringify(Team));
    } else {
      localStorage.removeItem('Team'); // Clear if undefined
    }
  }, [Team]);

  return (
    <TeamContext.Provider value={{ Team, setTeam }}>
      {children}
    </TeamContext.Provider>
  );
};

// Create a custom hook to use the TeamContext
export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('Team Context must be used within a TeamProvider');
  }
  return context;
};