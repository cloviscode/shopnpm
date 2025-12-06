import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'addresses'>) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Get user details from our users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            password: userData.password,
            name: userData.name,
            phone: userData.phone,
            isAdmin: userData.is_admin,
            addresses: [],
            createdAt: new Date(userData.created_at),
          });
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // First check if user exists in our database
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (!userData) {
        return false;
      }

      // For demo purposes, we'll use a simple password check
      // In production, you'd use proper password hashing
      if (userData.password !== password) {
        return false;
      }

      // Sign in with Supabase Auth (create session)
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'demo-password' // Using a fixed password for demo
      });

      if (error && error.message.includes('Invalid login credentials')) {
        // User doesn't exist in auth, create them
        const { error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: 'demo-password'
        });

        if (signUpError) {
          console.error('Auth signup error:', signUpError);
          return false;
        }
      } else if (error) {
        console.error('Auth signin error:', error);
        return false;
      }

      setUser({
        id: userData.id,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        isAdmin: userData.is_admin,
        addresses: [],
        createdAt: new Date(userData.created_at),
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'addresses'>): Promise<boolean> => {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return false;
      }

      // Create user in our database
      const { data: newUserData, error: dbError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          phone: userData.phone,
          is_admin: userData.isAdmin,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return false;
      }

      // Create auth user
      const { error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: 'demo-password'
      });

      if (authError) {
        console.error('Auth error:', authError);
        // Clean up database user if auth fails
        await supabase.from('users').delete().eq('id', newUserData.id);
        return false;
      }

      const newUser: User = {
        id: newUserData.id,
        email: newUserData.email,
        password: newUserData.password,
        name: newUserData.name,
        phone: newUserData.phone,
        isAdmin: newUserData.is_admin,
        addresses: [],
        createdAt: new Date(newUserData.created_at),
      };

      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const updateData: any = {};
      if (userData.name) updateData.name = userData.name;
      if (userData.email) updateData.email = userData.email;
      if (userData.phone) updateData.phone = userData.phone;
      if (userData.password) updateData.password = userData.password;
      
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error);
        return;
      }

      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};