import type { AnimalWithRelations, Bookmark } from "@projet/shared-types";
import { useCallback } from "react";
import { bookmarkApi } from "../api/bookmarkApi";
import { useFetch } from "./useFetch";

export type BookmarkWithAnimal = Bookmark & {
  animal: AnimalWithRelations;
};

export const useBookmarks = () => {
  const fetcher = useCallback((signal: AbortSignal) => bookmarkApi.getMyBookmarks(signal), []);

  const {
    data: bookmarks,
    setData: setBookmarks,
    loading,
    error,
  } = useFetch<BookmarkWithAnimal[]>(fetcher, "Impossible de charger vos favoris ❌", []);

  return { bookmarks, setBookmarks, loading, error };
};
