import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { INITIAL_USERS, type MockUser } from "@/lib/mockData";
import { login as loginApi, register as registerApi, logout as logoutApi } from "@/api/auth";

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

  const loginFn = useCallback(
    async (phone: string, password: string): Promise<MockUser | null> => {
      try {
        const res = await loginApi({ phone, password });
        const mockUser = { ...res.user, password: '' } as MockUser;
        setCurrentUser(mockUser);
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        return mockUser;
      } catch (err: any) {
        // Fallback to local mock users if backend is offline or unreachable
        const localMatch = users.find(u => u.phone === phone && u.password === password);
        if (localMatch) {
          const mockUser = { ...localMatch, password: '' };
          setCurrentUser(mockUser);
          localStorage.setItem("currentUser", JSON.stringify(mockUser));
          return mockUser;
        }
        throw err;
      }
    },
    [users]
  );

  const signupFn = useCallback(async (user: MockUser) => {
    try {
      await registerApi({
        name: user.name,
        phone: user.phone,
        password: user.password,
        confirmPassword: user.password,
        village: user.village,
        language: user.language
      });
    } catch (err: any) {
      // Allow seamless local demo registration if backend server is not running
      users.push(user);
    }
  }, [users]);

  const logoutFn = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    logoutApi();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, users, login: loginFn, signup: signupFn, logout: logoutFn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
