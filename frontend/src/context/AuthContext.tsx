import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { INITIAL_USERS, type MockUser } from "@/lib/mockData";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface AuthContextType {
  currentUser: MockUser | null;
  users: MockUser[];
  login: (phone: string, password: string) => Promise<MockUser | null>;
  signup: (user: MockUser) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [users] = useState<MockUser[]>([...INITIAL_USERS]);

  const login = useCallback(
    async (phone: string, password: string): Promise<MockUser | null> => {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        return data.user;
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Login failed');
      }
    },
    []
  );

  const signup = useCallback(async (user: MockUser) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Signup failed');
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, users, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
