import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authFetch } from "@/utils/authFetch";

interface PermissionItem {
  permission: string;
}

interface MeResponse {
  direct_permissions?: PermissionItem[];
  role_permissions?: PermissionItem[];
}

interface PermissionsContextType {
  permissions: string[] | null;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: null,
  loading: true,
});

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerms() {
      try {
        const data: MeResponse = await authFetch("/api/auth/me");

        const direct = (data.direct_permissions || []).map((p) => p.permission);
        const role = (data.role_permissions || []).map((p) => p.permission);

        setPermissions(Array.from(new Set([...direct, ...role])));
      } catch {
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPerms();
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}

export function IfHasPermission({
  required,
  children,
}: {
  required: string | string[];
  children: ReactNode;
}) {
  const { permissions, loading } = usePermissions();
  if (loading || !permissions) return null;

  const requiredArr = Array.isArray(required) ? required : [required];
  const has = requiredArr.every((perm) => permissions.includes(perm));

  return has ? <>{children}</> : null;
}
