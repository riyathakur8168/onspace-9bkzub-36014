import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/services/types';

interface AppUser {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  role: UserRole;
}

interface AppContextType {
  user: AppUser | null;
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  login: (role: UserRole) => void;
  logout: () => void;
}

const MOCK_USERS: Record<UserRole, AppUser> = {
  customer: {
    id: 'c1',
    name: 'Priya Mehra',
    phone: '+91 91234 56789',
    avatar: 'https://i.pravatar.cc/150?img=47',
    role: 'customer',
  },
  worker: {
    id: 'w1',
    name: 'Suresh Patel',
    phone: '+91 98765 43210',
    avatar: 'https://i.pravatar.cc/150?img=11',
    role: 'worker',
  },
  admin: {
    id: 'a1',
    name: 'Admin User',
    phone: '+91 99999 00000',
    avatar: 'https://i.pravatar.cc/150?img=68',
    role: 'admin',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);

  const setRole = (r: UserRole) => setRoleState(r);

  const login = (r: UserRole) => {
    setUser(MOCK_USERS[r]);
    setRoleState(r);
  };

  const logout = () => {
    setUser(null);
    setRoleState(null);
  };

  return (
    <AppContext.Provider value={{ user, role, setRole, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
