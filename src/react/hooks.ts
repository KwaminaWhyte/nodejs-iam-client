import { useState, useEffect } from 'react';
import { useIAM } from './IAMContext';
import { User, Department, Position, PaginatedResponse, QueryParams } from '../types';

/**
 * Hook to check if user has a specific permission
 */
export const usePermission = (permission: string): boolean => {
  const { hasPermission } = useIAM();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      const result = await hasPermission(permission);
      if (mounted) {
        setHasAccess(result);
      }
    };

    checkPermission();

    return () => {
      mounted = false;
    };
  }, [permission, hasPermission]);

  return hasAccess;
};

/**
 * Hook to check if user has a specific role
 */
export const useRole = (role: string): boolean => {
  const { hasRole } = useIAM();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRole = async () => {
      const result = await hasRole(role);
      if (mounted) {
        setHasAccess(result);
      }
    };

    checkRole();

    return () => {
      mounted = false;
    };
  }, [role, hasRole]);

  return hasAccess;
};

/**
 * Hook to fetch users with pagination
 */
export const useUsers = (params?: QueryParams) => {
  const { client } = useIAM();
  const [users, setUsers] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await client.getUsers(params);
        if (mounted) {
          setUsers(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      mounted = false;
    };
  }, [client, JSON.stringify(params)]);

  return { users, loading, error };
};

/**
 * Hook to fetch a single user
 */
export const useUser = (userId: string | number | null) => {
  const { client } = useIAM();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await client.getUser(userId);
        if (mounted) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [client, userId]);

  return { user, loading, error };
};

/**
 * Hook to fetch departments with pagination
 */
export const useDepartments = (params?: QueryParams) => {
  const { client } = useIAM();
  const [departments, setDepartments] = useState<PaginatedResponse<Department> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await client.getDepartments(params);
        if (mounted) {
          setDepartments(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDepartments();

    return () => {
      mounted = false;
    };
  }, [client, JSON.stringify(params)]);

  return { departments, loading, error };
};

/**
 * Hook to fetch positions with pagination
 */
export const usePositions = (params?: QueryParams) => {
  const { client } = useIAM();
  const [positions, setPositions] = useState<PaginatedResponse<Position> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPositions = async () => {
      try {
        setLoading(true);
        const data = await client.getPositions(params);
        if (mounted) {
          setPositions(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPositions();

    return () => {
      mounted = false;
    };
  }, [client, JSON.stringify(params)]);

  return { positions, loading, error };
};
