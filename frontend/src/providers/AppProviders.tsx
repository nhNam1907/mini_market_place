import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntApp } from "antd";

import { queryClient } from "@/lib/queryClient";

const theme = {
  token: {
    colorPrimary: "#1677ff",
    borderRadius: 12,
    fontFamily: "Segoe UI, sans-serif",
  },
};

type AppProvidersProps = {
  children: ReactNode;
};

function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default AppProviders;
