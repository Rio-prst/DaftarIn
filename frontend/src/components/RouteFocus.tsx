import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function RouteFocus() {
  const { pathname, state } = useLocation();
  const scrollTarget: string | undefined = state?.scrollTo;
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const main = document.getElementById("main-content");
      const title = main?.querySelector("h1")?.textContent;
      document.title = title ? title + " · DaftarIn" : "DaftarIn";
      if (!scrollTarget) {
        window.scrollTo(0, 0);
        main?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, scrollTarget]);
  return null;
}
