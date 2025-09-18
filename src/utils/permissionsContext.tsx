import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { authFetch } from "./authFetch";

// -------------------- TYPES --------------------
export interface MeResponse {
  id?: string | number;
  username: string;
  direct_permissions?: Array<{ permission: string }>;
  role_permissions?: Array<{ permission: string }>;
}

const PermissionsContext = createContext<string[]>([]);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchPerms() {
      try {
        const response = await authFetch("/api/auth/me");
        if (!response.ok) throw new Error("Failed to fetch permissions");

        const data: MeResponse = await response.json(); // ✅ parse JSON

        const direct = (data.direct_permissions || []).map((p) => p.permission);
        const role = (data.role_permissions || []).map((p) => p.permission);

        setPermissions([...direct, ...role]);
      } catch (err) {
        console.error("Error fetching permissions:", err);
        setPermissions([]);
      }
    }

    fetchPerms();
  }, []);

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);
