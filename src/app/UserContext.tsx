"use client";

import { apiHandler } from "../utils/apiHandler";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { usePermissionsSync } from "../utils/usePermissionsSync";

export interface Session {
  id: string;
  ip_address?: string;
  device?: string;
  last_seen?: string;
}

export interface User {
  id?: string | number;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;

  active: boolean;
  created_at: string;
  tfa_enabled: boolean;
  last_login: string;
  sessions?: Session[];

  roles?: string[];
  direct_permissions?: Array<{
    permission: string;
    value: string;
    scope?: string;
    container_id?: number;
  }>;
  role_permissions?: Array<{
    permission: string;
    value: string;
    scope?: string;
    container_id?: number;
  }>;
}

interface UserContextType {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  refresh: () => void;
}

interface StatusData {
  authenticated: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  authenticated: false,
  loading: true,
  refresh: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("user");
    }
    return false;
  });

  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const statusData = (await apiHandler("/api/auth/status", {
        cacheTtlMs: 10000,
      })) as StatusData;

      setAuthenticated(!!statusData.authenticated);

      if (statusData.authenticated) {
        const meData = (await apiHandler("/api/auth/me", {
          cacheTtlMs: 10000,
        })) as Partial<User>;

        const mappedUser: User = {
          username: meData.username ?? "Unknown User",
          id: meData.id,
          email: meData.email ?? "",
          name: meData.name ?? "",
          avatar: meData.avatar ?? "",
          active: meData.active ?? true, // ✅ fixed
          created_at: meData.created_at ?? new Date().toISOString(),
          tfa_enabled: meData.tfa_enabled ?? false,
          last_login: meData.last_login ?? new Date().toISOString(),
          sessions: meData.sessions ?? [],
          roles: meData.roles ?? [],
          direct_permissions: meData.direct_permissions ?? [],
          role_permissions: meData.role_permissions ?? [],
        };

        setUser(mappedUser);

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(mappedUser));
        }
      } else {
        setUser(null);
        if (typeof window !== "undefined") localStorage.removeItem("user");
      }
    } catch {
      setUser(null);
      setAuthenticated(false);
      if (typeof window !== "undefined") localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  usePermissionsSync({
    onMismatch: () => {
      toast.info("Your permissions have changed. Refreshing session.");
      fetchUser();
    },
    intervalMs: 5 * 60 * 1000,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        authenticated: !!authenticated,
        loading,
        refresh: fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
