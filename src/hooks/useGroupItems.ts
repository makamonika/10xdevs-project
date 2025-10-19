import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { QueryDto, ErrorResponse } from "@/types";

/**
 * Custom hook to fetch all queries that are members of a group
 * @param groupId - The ID of the group
 * @returns Query data, loading state, error, and refetch function
 */
export function useGroupItems(groupId: string) {
  const [data, setData] = useState<QueryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchGroupItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/groups/${encodeURIComponent(groupId)}/items`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Group not found");
          }
          if (response.status === 401 || response.status === 403) {
            toast.error("Authentication required", {
              description: "Redirecting to login...",
            });
            setTimeout(() => {
              window.location.href = "/login?returnUrl=" + encodeURIComponent(window.location.pathname);
            }, 1000);
            return;
          }
          throw new Error(`Failed to fetch group items: ${response.statusText}`);
        }

        const result: QueryDto[] = await response.json();

        if (!isCancelled) {
          setData(result);
        }
      } catch (err) {
        if (!isCancelled) {
          const error = err instanceof Error ? err : new Error("Unknown error");
          setError(error);
          toast.error("Failed to load group items", {
            description: error.message,
          });
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchGroupItems();

    return () => {
      isCancelled = true;
    };
  }, [groupId, refetchTrigger]);

  return { data, isLoading, error, refetch };
}

/**
 * Custom hook to remove a query from a group
 * @returns Mutation function, loading state, and error
 */
export function useRemoveGroupItem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [removingQueryId, setRemovingQueryId] = useState<string | null>(null);

  const removeItem = async (groupId: string, queryId: string): Promise<void> => {
    setIsLoading(true);
    setRemovingQueryId(queryId);
    setError(null);

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(groupId)}/items/${encodeURIComponent(queryId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        if (errorData.error.code === "not_found") {
          throw new Error("Query not found in group");
        }
        throw new Error(errorData.error.message || "Failed to remove item from group");
      }

      toast.success("Removed from group");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      toast.error("Failed to remove item", {
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
      setRemovingQueryId(null);
    }
  };

  return { removeItem, isLoading, error, removingQueryId };
}

