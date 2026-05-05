import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: We need pathname to trigger scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
