import { createContext, useContext, useMemo, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userId, setUserId] = useState(
    localStorage.getItem('em_userId') || import.meta.env.VITE_DEFAULT_USER_ID || 'user-001'
  );

  const updateUser = (value) => {
    const clean = String(value || '').trim() || 'user-001';
    setUserId(clean);
    localStorage.setItem('em_userId', clean);
  };

  const value = useMemo(() => ({ userId, updateUser }), [userId]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
};