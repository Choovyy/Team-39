"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ReportSummary } from '../Utils/Global_variables';

// Define the context type
interface ReportSummaryContextType {
  ReportSummary: ReportSummary | undefined | null;
  setReportSummary: (ReportSummary: ReportSummary | undefined) => void;
}

// Create the context
const ReportSummaryContext = createContext<ReportSummaryContextType | undefined>(undefined);

// Create a provider component
export const ReportSummaryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ReportSummary, setReportSummary] = useState<ReportSummary | null>(null);

  useEffect(()=>{
    const storedReportSummary = localStorage.getItem('ReportSummary');
    if(storedReportSummary){
      setReportSummary(JSON.parse(storedReportSummary))
    }
  },[])

  useEffect(() => {
    // Store ReportSummary in localStorage whenever it changes
    if (ReportSummary) {
      // const ReportSummaryWithMembers = {...ReportSummary, members:Array.from(ReportSummary.members)}
      localStorage.setItem('ReportSummary', JSON.stringify(ReportSummary));
    } else {
      localStorage.removeItem('ReportSummary'); // Clear if undefined
    }
  }, [ReportSummary]);

  return (
    <ReportSummaryContext.Provider value={{ ReportSummary, setReportSummary }}>
      {children}
    </ReportSummaryContext.Provider>
  );
};

// Create a custom hook to use the ReportSummaryContext
export const useReportSummaryContext = () => {
  const context = useContext(ReportSummaryContext);
  if (context === undefined) {
    throw new Error('ReportSummary Context must be used within a ReportSummaryProvider');
  }
  return context;
};