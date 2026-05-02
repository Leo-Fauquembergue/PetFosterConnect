import type { AnimalWithRelations, Bookmark } from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../api/api";
import { bookmarkApi } from "../api/bookmarkApi";

export type BookmarkWithAnimal = Bookmark & {
  animal: AnimalWithRelations;
};

export const useBookmarks = (userId: number | undefined) => {
  const [bookmarks, setBookmarks] = useState<BookmarkWithAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const data = await bookmarkApi.getMyBookmarks(controller.signal);
        setBookmarks(data);
        setError(false);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        setError(true);
        const errorMessage = extractErrorMessage(err, "Impossible de charger vos favoris ❌");
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();

    return () => {
      controller.abort();
    };
  }, [userId]);

  return { bookmarks, setBookmarks, loading, error };
};
