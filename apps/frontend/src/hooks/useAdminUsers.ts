import type { User } from "@projet/shared-types";
import { useCallback } from "react";
import { userApi } from "../api/userApi";
import { useFetch } from "./useFetch";

export const useAdminUsers = () => {
  const fetcher = useCallback((signal: AbortSignal) => userApi.getAllUsers(signal), []);

  const {
    data: users,
    setData: setUsers,
    loading,
    error,
  } = useFetch<User[]>(fetcher, "Impossible de charger les utilisateurs.", []);

  return { users, setUsers, loading, error };
};
