import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  adminLogin: (username: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'ayushyaa_users';
const CURRENT_USER_KEY = 'ayushyaa_current_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getUsers = (): Array<{ id: string; email: string; password: string; name: string }> => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: Array<{ id: string; email: string; password: string; name: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const foundUser = users.find((u) => u.email === email && u.password === password);

    if (foundUser) {
      const userObj: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: 'user',
      };
      setUser(userObj);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = getUsers();
    
    if (users.find((u) => u.email === email)) {
      return false;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password,
      name,
    };

    users.push(newUser);
    saveUsers(users);

    const userObj: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: 'user',
    };
    setUser(userObj);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
    return true;
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    if (username === 'admin' && password === 'admin') {
      const adminUser: User = {
        id: 'admin',
        email: 'admin@ayushyaa.com',
        name: 'Admin',
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        adminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
