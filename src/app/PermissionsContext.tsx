"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import { authFetch } from "../utils/authFetch"; // ✅ Correct relative path
import { usePermissionsSync } from "../utils/usePermissionsSync";

// -------------------- TYPES --------------------
export interface MeResponse {
  id?: string | number;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
  active?: boolean;
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

interface PermissionsContextType {
  permissions: string[];
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: [],
});

// -------------------- PROVIDER --------------------
export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const [permissions, setPermissions] = useState<string[]>([]);

  usePermissionsSync({
    onMismatch: async () => {
      toast.info("Your permissions have changed. Refreshing session.");
      await fetchPermissions();
    },
    intervalMs: 5 * 60 * 1000, // every 5 mins
  });

  const fetchPermissions = async () => {
    try {
      const res = await authFetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch user");

      const data: MeResponse = await res.json();

      const direct = (data.direct_permissions || []).map((p) => p.permission);
      const role = (data.role_permissions || []).map((p) => p.permission);

      setPermissions([...new Set([...direct, ...role])]);
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setPermissions([]);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

// -------------------- HOOK --------------------
export const usePermissions = () => {
  return useContext(PermissionsContext).permissions;
};
