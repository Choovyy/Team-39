"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserType } from '../Utils/Global_variables';
import { faculty, student, user2 } from '@/Sample_Data/SampleData1';
import { extractFirstnameLastnameFromEmail } from '../Utils/Utility_functions';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

// Define the context type
interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter()
  // Initialize user state from localStorage if available
  const [user, setUser ] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Track loading state

  const login = (userData: User) => {
    setUser (userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Store user in localStorage
  };

  const logout = () => {
    setUser (null);
    // localStorage.removeItem('user'); // Remove user from localStorage
    localStorage.clear()
    router.push('/login')
  };

  useEffect(() => {
    // Retrieve user from localStorage when the component mounts
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // Mark as finished loading
  }, []);

  // Sync user state with localStorage on change
  useEffect(() => {
    if (loading) return; // Wait until loading is complete

    if (user && window.location.pathname.startsWith("/login")) {
      localStorage.setItem("user", JSON.stringify(user));
    } else if (!user) {
      console.log(`I will log you out. even though ${user}`);
      localStorage.removeItem("user");
      router.push("/login");
    }else if(user && user.role !== UserType.FACULTY){
      if(
        window.location.pathname.startsWith('/availability')
        ||
        window.location.pathname.includes("summary")
        ||
        window.location.pathname.includes('/mentorClassroom')
      ){
        router.push("/nt404")
      }
      
    }
  }, [user, loading]);

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the UserContext
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser  Context must be used within a UserProvider');
  }
  return context;
};