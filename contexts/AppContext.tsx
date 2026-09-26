import React, { createContext, useState, ReactNode } from 'react';
import { MockUser, MOCK_USERS, UserRole } from '@/services/mockData';

interface AppContextType {
  currentUser: MockUser | null;
  isLoggedIn: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);

  const login = (role: UserRole) => {
    const user = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{ currentUser, isLoggedIn: !!currentUser, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}
