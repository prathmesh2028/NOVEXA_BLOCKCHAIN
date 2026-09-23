/**
 * ModalPortal — renders children directly into document.body via a React Portal.
 *
 * This escapes ANY ancestor CSS that would break position:fixed, including:
 *   - overflow: auto/hidden/scroll on parent containers
 *   - transform: translateY/X/etc on animated wrappers (e.g. .page-fade)
 *   - filter, perspective, will-change on parent elements
 *
 * Usage:
 *   import ModalPortal from "../../components/ui/ModalPortal";
 *   {showModal && <ModalPortal>...</ModalPortal>}
 */

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalPortalProps {
  children: React.ReactNode;
}

export default function ModalPortal({ children }: ModalPortalProps) {
  const el = useRef(document.createElement("div"));

  useEffect(() => {
    const portalRoot = el.current;
    portalRoot.style.cssText = "position:fixed;top:0;left:0;width:100%;height:0;z-index:99999;";
    document.body.appendChild(portalRoot);
    return () => {
      document.body.removeChild(portalRoot);
    };
  }, []);

  return createPortal(children, el.current);
}
