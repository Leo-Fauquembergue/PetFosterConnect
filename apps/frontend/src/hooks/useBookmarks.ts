import type { AnimalWithRelations, Bookmark } from "@projet/shared-types";
import { useCallback } from "react";
import { bookmarkApi } from "../api/bookmarkApi";
import { useFetch } from "./useFetch";

export type BookmarkWithAnimal = Bookmark & {
  animal: AnimalWithRelations;
};

export const useBookmarks = (userId: number | undefined) => {
  const fetcher = useCallback(
    (signal: AbortSignal) => bookmarkApi.getMyBookmarks(signal),
    []
  );

  const {
    data: bookmarks,
    setData: setBookmarks,
    loading,
    error,
  } = useFetch<BookmarkWithAnimal[]>(
    fetcher,
    "Impossible de charger vos favoris ❌",
    []
  );

  // Note: userId is no longer used for fetching here since it was not used in the API call itself (getMyBookmarks), 
  // but keeping it for signature compatibility if needed by the component.
  // If the API call depends on userId, the fetcher should be updated.

  return { bookmarks, setBookmarks, loading, error };
};
