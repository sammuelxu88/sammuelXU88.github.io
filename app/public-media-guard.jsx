"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PublicMediaGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/cms")) return undefined;

    const isProtectedMedia = (target) =>
      target instanceof Element && Boolean(target.closest("img, canvas"));

    const preventContextMenu = (event) => {
      if (isProtectedMedia(event.target)) event.preventDefault();
    };

    const preventDrag = (event) => {
      if (isProtectedMedia(event.target)) event.preventDefault();
    };

    document.addEventListener("contextmenu", preventContextMenu, true);
    document.addEventListener("dragstart", preventDrag, true);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu, true);
      document.removeEventListener("dragstart", preventDrag, true);
    };
  }, [pathname]);

  return null;
}
