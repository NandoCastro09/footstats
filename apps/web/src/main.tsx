import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import "./index.css";
import App from "./App.tsx";
import ToastProvider from "./components/toast/ToastProvider";
import { persistOptions, queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </PersistQueryClientProvider>
  </StrictMode>
);
