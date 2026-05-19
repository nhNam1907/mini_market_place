import type { ReactNode } from "react";
import { Modal, message, notification } from "antd";
import { useEffect, useMemo } from "react";

import { useAuthStore } from "@/store/authStore";

type AuthSessionBoundaryProps = {
  children: ReactNode;
};

const PORTAL_SELECTORS = [
  ".ant-image-preview-root",
  ".ant-modal-root",
  ".ant-drawer-root",
  ".ant-popover",
  ".ant-tooltip",
];

function clearAntdPortals() {
  message.destroy();
  notification.destroy();
  Modal.destroyAll();

  PORTAL_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.remove();
    });
  });

  document.body.classList.remove("ant-scrolling-effect");
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("padding-right");
  document.documentElement.style.removeProperty("overflow");
}

function AuthSessionBoundary({ children }: AuthSessionBoundaryProps) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const sessionKey = useMemo(
    () => `${user?.id ?? "guest"}:${user?.role ?? "guest"}:${token ? "auth" : "anon"}`,
    [token, user?.id, user?.role],
  );

  useEffect(() => {
    clearAntdPortals();
  }, [sessionKey]);

  return <>{children}</>;
}

export default AuthSessionBoundary;
