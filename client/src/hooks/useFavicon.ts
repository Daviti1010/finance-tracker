import { useEffect } from "react";

export function useFavicon(href: string) {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    const previousHref = link.href;

    link.href = href;

    // restore default favicon when leaving the page
    return () => {
      link.href = previousHref;
    };
  }, [href]);
}