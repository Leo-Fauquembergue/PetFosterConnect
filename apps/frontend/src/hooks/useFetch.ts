import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../api/api";

export const useFetch = <T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  errorMessage: string,
  initialData: T
) => {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetcher(controller.signal);
        setData(result);
        setError(null);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        const msg = extractErrorMessage(err, errorMessage);
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [fetcher, errorMessage]);

  return { data, loading, error, setData };
};
