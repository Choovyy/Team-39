"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { QueueingManager } from '../Utils/Global_variables';

// Define the context type
interface QueueingManagerContextType {
  QueueingManager: QueueingManager | undefined | null;
  setQueueingManager: (QueueingManager: QueueingManager) => void;
}

// Create the context
const QueueingManagerContext = createContext<QueueingManagerContextType | undefined>(undefined);

// Create a provider component
export const QueueingManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [QueueingManager, setQueueingManager] = useState<QueueingManager | null>(null);

  useEffect(()=>{
    const storedQueueingManager = localStorage.getItem('QueueingManager');
    if(storedQueueingManager){
      setQueueingManager(JSON.parse(storedQueueingManager))
    }
  },[])

  useEffect(() => {
    // Store QueueingManager in localStorage whenever it changes
    if (QueueingManager) {
      localStorage.setItem('QueueingManager', JSON.stringify(QueueingManager));
    } else {
      localStorage.removeItem('QueueingManager'); // Clear if undefined
    }
  }, [QueueingManager]);

  return (
    <QueueingManagerContext.Provider value={{ QueueingManager, setQueueingManager }}>
      {children}
    </QueueingManagerContext.Provider>
  );
};

// Create a custom hook to use the QueueingManagerContext
export const useQueueingManagerContext = () => {
  const context = useContext(QueueingManagerContext);
  if (context === undefined) {
    throw new Error('QueueingManager Context must be used within a QueueingManagerProvider');
  }
  return context;
};