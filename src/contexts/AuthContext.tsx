import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { getApiUrl } from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('campus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // First, attempt to login
      const loginResponse = await fetch(getApiUrl('/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });
      const loginData = await loginResponse.json();
      
      if (loginData.success && loginData.user) {
        // If it's a student, fetch complete student details
        if (loginData.user.role === 'student' && loginData.user.studentId) {
          try {
            const studentResponse = await fetch(getApiUrl(`/students/${loginData.user.studentId}`));
            if (studentResponse.ok) {
              const studentData = await studentResponse.json();
              // Merge student details with login data
              const completeUserData = {
                ...loginData.user,
                branch: studentData.branch,
                semester: studentData.semester,
                specialization: studentData.specialization,
              };
              setUser(completeUserData);
              localStorage.setItem('campus_user', JSON.stringify(completeUserData));
              return true;
            }
          } catch (error) {
            console.error('Error fetching student details:', error);
          }
        }
        
        // For non-student users or if student details fetch fails
        setUser(loginData.user);
        localStorage.setItem('campus_user', JSON.stringify(loginData.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      const response = await fetch(getApiUrl('/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, password }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campus_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
