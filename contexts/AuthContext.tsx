"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  account,
  databases,
  DATABASE_ID,
  COLLECTIONS,
  generateId,
} from "@/lib/appwrite";
import { Models, Query } from "appwrite";
import { UserProfile } from "@/lib/appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchUserProfile = async (
    userId: string,
  ): Promise<UserProfile | null> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal("userId", userId)],
      );

      if (response.documents.length > 0) {
        return response.documents[0] as unknown as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Create user profile in database
  const createUserProfile = async (
    userId: string,
    email: string,
    name: string,
    phone: string,
  ): Promise<UserProfile> => {
    try {
      const profile = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        generateId(),
        {
          userId,
          name,
          email,
          phone,
          balance: 0,
          currency: "UGX",
        },
      );
      return profile as unknown as UserProfile;
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);

      // Fetch user profile
      const profile = await fetchUserProfile(currentUser.$id);
      if (profile) {
        setUserProfile(profile);
      } else {
        // Profile not found, logout
        console.error("User profile not found in database");
        await account.deleteSession("current");
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      // User not logged in
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);

      const profile = await fetchUserProfile(currentUser.$id);
      setUserProfile(profile);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) throw new Error("No user profile found");

    try {
      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userProfile.$id,
        data,
      );
      setUserProfile(updated as unknown as UserProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    try {
      const profile = await fetchUserProfile(user.$id);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
