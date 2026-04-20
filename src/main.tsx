import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { useCheckTokenStore } from "./store/useCheckTokenStore";
import Router from "./Router";
import "./assets/fonts.css";
import "./index.css";
import { queryClient } from "@/lib/queryClient";
import "@/lib/changeLanguageUtils";

function App() {
  useCheckTokenStore();

  return <Router />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
