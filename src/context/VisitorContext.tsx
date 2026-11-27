import React, { createContext, useContext, useState, useEffect } from "react";

interface VisitorContextType {
  /** Real view count, or null when unavailable (UI hides it instead of showing a fake number). */
  count: number | null;
  isLoading: boolean;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export function VisitorProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      const KEY = "nitishdotdev_portfolio_views";
      const hasVisited = sessionStorage.getItem("has_visited_session");

      const endpoint = hasVisited ? "get" : "hit";
      const url = `https://countapi.mileshilliard.com/api/v1/${endpoint}/${KEY}`;

      try {
        if (!hasVisited) {
          sessionStorage.setItem("has_visited_session", "true");
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch count: ${res.statusText}`);
        }

        const data = await res.json();
        setCount(typeof data.value === "number" ? data.value : null);
      } catch (error) {
        console.error("Error fetching visitor count:", error);
        setCount(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();
  }, []);

  return (
    <VisitorContext.Provider value={{ count, isLoading }}>
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor() {
  const context = useContext(VisitorContext);
  if (context === undefined) {
    throw new Error("useVisitor must be used within a VisitorProvider");
  }
  return context;
}
